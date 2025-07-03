const Signature = require('../models/Signature');
const Document = require('../models/Document');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const { logAction } = require('../utils/auditLogger');

const hexToRgb = (hex) => {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return [((bigint >> 16) & 255) / 255, ((bigint >> 8) & 255) / 255, (bigint & 255) / 255];
};

// Get Signatures by Document
exports.getSignaturesByDoc = async (req, res) => {
  try {
    const signatures = await Signature.find({ documentId: req.params.id });
    res.json(signatures);
  } catch (err) {
    console.error("Fetch Signatures Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Place Signature
exports.placeSignature = async (req, res) => {
  try {
    const { documentId, x, y, page, renderWidth, renderHeight, text, fontSize, fontColor } = req.body;
    if (!documentId || x === undefined || y === undefined || !page || !renderWidth || !renderHeight)
      return res.status(400).json({ message: 'Missing required fields' });

    const newSignature = new Signature({
      documentId,
      x: parseFloat(x),
      y: parseFloat(y),
      page,
      renderWidth: parseFloat(renderWidth),
      renderHeight: parseFloat(renderHeight),
      status: 'Pending',
      text: text?.trim(),
      fontSize: fontSize || 14,
      fontColor: fontColor || '#000000'
    });

    await newSignature.save();
    res.json(newSignature);
  } catch (err) {
    console.error("Place Signature Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Finalize Signed PDF
exports.finalizeDocument = async (req, res) => {
  try {
    const { documentId } = req.body;
    const document = await Document.findById(documentId);
    if (!document) return res.status(404).json({ message: "Document not found" });

    const pdfPath = path.join(__dirname, '../uploads/', document.filepath);
    const pdfDoc = await PDFDocument.load(fs.readFileSync(pdfPath));
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const signatures = await Signature.find({ documentId, status: 'Signed' });
    const pages = pdfDoc.getPages();

    signatures.forEach(sig => {
      if (sig.page > 0 && sig.page <= pages.length) {
        const page = pages[sig.page - 1];
        const scaledX = (sig.x / sig.renderWidth) * page.getWidth();
        const scaledY = (sig.y / sig.renderHeight) * page.getHeight();
        const [r, g, b] = hexToRgb(sig.fontColor || '#000');

        page.drawText(sig.text?.trim() || "Unknown Signer", {
          x: scaledX,
          y: page.getHeight() - scaledY,
          size: sig.fontSize || 14,
          font,
          color: rgb(r, g, b)
        });
      }
    });

    const signedPath = path.join(__dirname, '../uploads/', `signed-${Date.now()}.pdf`);
    fs.writeFileSync(signedPath, await pdfDoc.save());

    logAction({ documentId, action: "Final PDF Generated", user: req.userName || "Unknown", email: req.userEmail || "-", ip: req.ip });
    res.json({ message: "Final signed PDF generated", signedPdfUrl: `http://localhost:5000/uploads/${path.basename(signedPath)}` });
  } catch (err) {
    console.error("Finalize Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete Signature
exports.deleteSignature = async (req, res) => {
  try {
    const sig = await Signature.findById(req.params.id);
    if (!sig) return res.status(404).json({ message: "Signature not found" });
    const doc = await Document.findById(sig.documentId);
    if (!doc || doc.uploadedBy.toString() !== req.userId) return res.status(403).json({ message: "Unauthorized" });

    await sig.deleteOne();
    res.json({ message: "Signature deleted" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update Signature Status
exports.updateSignatureStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    if (!['Signed', 'Rejected'].includes(status)) return res.status(400).json({ message: "Invalid status" });

    const sig = await Signature.findById(req.params.id);
    if (!sig) return res.status(404).json({ message: "Signature not found" });
    const doc = await Document.findById(sig.documentId);
    if (!doc || doc.uploadedBy.toString() !== req.userId) return res.status(403).json({ message: "Unauthorized" });

    sig.status = status;
    sig.reason = status === "Rejected" ? (reason || "No reason provided") : "";
    await sig.save();

    res.json({ message: "Signature status updated", signature: sig });
  } catch (err) {
    console.error("Update Status Error:", err);
    res.status(500).json({ message: err.message });
  }
};

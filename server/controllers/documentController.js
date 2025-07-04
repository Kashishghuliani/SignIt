const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Document = require('../models/Document');
const Signature = require('../models/Signature');
const { logAction } = require('../utils/auditLogger');

// Upload PDF
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const newDoc = new Document({
      filename: req.file.originalname,
      filepath: req.file.filename,
      uploadedBy: req.userId
    });

    await newDoc.save();
    res.status(201).json({ message: "PDF uploaded successfully", document: newDoc });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Server error while uploading PDF" });
  }
};

// Get User's Documents with Signature Summary
exports.getUserDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ uploadedBy: req.userId }).sort({ uploadedAt: -1 });
    const enriched = await Promise.all(docs.map(async (doc) => {
      const signatures = await Signature.find({ documentId: doc._id });
      const total = signatures.length;
      const signed = signatures.filter(s => s.status === 'Signed').length;
      const rejected = signatures.filter(s => s.status === 'Rejected').length;
      const pending = signatures.filter(s => s.status === 'Pending').length;
      return { ...doc.toObject(), signatureSummary: { total, signed, rejected, pending } };
    }));
    res.json(enriched);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch documents" });
  }
};

// Delete Document
exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });
    if (doc.uploadedBy.toString() !== req.userId) return res.status(403).json({ message: "Unauthorized" });

    fs.unlink(path.join(__dirname, '../uploads/', doc.filepath), err => {
      if (err) console.error("File delete error:", err);
    });

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Send Public Signature Link
exports.sendSignatureLink = async (req, res) => {
  try {
    const { documentId, recipientEmail } = req.body;
    const document = await Document.findById(documentId);
    if (!document) return res.status(404).json({ message: "Document not found" });

    document.token = crypto.randomBytes(20).toString('hex');
    document.tokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await document.save();

    const link = `${process.env.FRONTEND_URL}/sign/${document.token}`;

    const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});


    await transporter.sendMail({
      from: 'kashishghuliani2004@gmail.com',
      to: recipientEmail,
      subject: "Document Signature Request",
      text: `Please sign the document using this link:\n${link}\nNote: Link expires in 24 hours.`
    });

    res.json({ message: "Signature link sent successfully" });
  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Public Access to Document by Token
exports.getPublicDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ token: req.params.token, tokenExpires: { $gt: Date.now() } });
    if (!document) return res.status(404).json({ message: "Invalid or expired link" });
    res.json({ filepath: document.filepath, documentId: document._id });
  } catch (err) {
    console.error("Get Public Document Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Public Sign
exports.publicSign = async (req, res) => {
  try {
    const { token, x, y, page, renderWidth, renderHeight, signerName, fontSize, color } = req.body;
    if (!signerName?.trim()) return res.status(400).json({ message: "Signature text required" });

    const document = await Document.findOne({ token, tokenExpires: { $gt: Date.now() } });
    if (!document) return res.status(404).json({ message: "Invalid or expired link" });

    await new Signature({
      documentId: document._id,
      x: parseFloat(x),
      y: parseFloat(y),
      page: page || 1,
      renderWidth: parseFloat(renderWidth),
      renderHeight: parseFloat(renderHeight),
      status: 'Signed',
      text: signerName.trim(),
      fontSize: fontSize || 14,
      fontColor: color || '#000000'
    }).save();

    document.token = null;
    document.tokenExpires = null;
    await document.save();

    logAction({ documentId: document._id, action: 'Public Document Signed', user: 'Public User', email: '-', ip: req.ip });
    res.json({ message: "Document signed successfully!" });
  } catch (err) {
    console.error("Public Sign Error:", err);
    res.status(500).json({ message: err.message });
  }
};

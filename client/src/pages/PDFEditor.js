import React, { useEffect, useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFEditor = ({ fileUrl, documentId }) => {
  const [signatures, setSignatures] = useState([]);
  const [dragPos, setDragPos] = useState({ x: 100, y: 100 });
  const [pdfRenderSize, setPdfRenderSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [signatureStyle, setSignatureStyle] = useState({
    text: '',
    fontSize: 14,
    fontColor: '#000000'
  });

  const pdfWrapperRef = useRef(null);
  const pageWrapperRef = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadSignatureStyle();
    if (documentId) fetchSignatures();
  }, [documentId]);

  // Reload signature style + reset drag when file changes
  useEffect(() => {
    loadSignatureStyle();
    setDragPos({ x: 100, y: 100 });
  }, [fileUrl]);

  const loadSignatureStyle = () => {
    setSignatureStyle({
      text: localStorage.getItem('signatureText') || '',
      fontSize: parseFloat(localStorage.getItem('fontSize')) || 14,
      fontColor: localStorage.getItem('fontColor') || '#000000'
    });
  };

  const fetchSignatures = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/signatures/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSignatures(res.data);
    } catch (err) {
      console.error('Failed to fetch signatures:', err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (pageWrapperRef.current) {
        const rect = pageWrapperRef.current.getBoundingClientRect();
        if (rect.width && rect.height) {
          setPdfRenderSize({ width: rect.width, height: rect.height });
          clearInterval(interval);
        }
      }
    }, 500);
    return () => clearInterval(interval);
  }, [fileUrl]);

  // Global Drag Listeners
  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging) return;
      const rect = pdfWrapperRef.current.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;
      x = Math.max(0, Math.min(x, rect.width));
      y = Math.max(0, Math.min(y, rect.height));
      setDragPos({ x, y });
    };

    const handleUp = () => {
      if (isDragging) {
        setIsDragging(false);
        saveSignature();
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, dragPos]);

  const saveSignature = async () => {
    if (!documentId || !token) return;
    if (!signatureStyle.text.trim()) return alert("Please set your signature style.");

    const payload = {
      documentId,
      x: dragPos.x,
      y: dragPos.y,
      page: 1,
      renderWidth: parseFloat(pdfRenderSize.width),
      renderHeight: parseFloat(pdfRenderSize.height),
      text: signatureStyle.text.trim(),
      fontSize: signatureStyle.fontSize,
      fontColor: signatureStyle.fontColor
    };

    try {
      await axios.post(`http://localhost:5000/api/signatures`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSignatures();
    } catch (err) {
      console.error('❌ Save Error:', err);
    }
  };

  const handleMouseDown = () => {
    const latestText = localStorage.getItem('signatureText') || '';
    const latestFontSize = parseFloat(localStorage.getItem('fontSize')) || 14;
    const latestFontColor = localStorage.getItem('fontColor') || '#000000';

    setSignatureStyle({
      text: latestText,
      fontSize: latestFontSize,
      fontColor: latestFontColor
    });

    if (!latestText.trim()) {
      alert("Please set your signature style first.");
      return;
    }
    setIsDragging(true);
  };

  const updateStatus = async (sigId, status, reason = '') => {
    try {
      await axios.patch(`http://localhost:5000/api/signatures/${sigId}/status`, { status, reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSignatures();
    } catch (err) {
      console.error('Status Update Error:', err);
    }
  };

  const deleteSignature = async (sigId) => {
    if (!window.confirm('Delete this signature?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/signatures/${sigId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSignatures();
    } catch (err) {
      console.error('Delete Error:', err);
    }
  };

  return (
    <div
      ref={pdfWrapperRef}
      className="relative border border-gray-300 bg-white shadow-md mx-auto"
      style={{ width: '600px', height: '800px', marginTop: '20px', position: 'relative' }}
    >
      <div ref={pageWrapperRef} style={{ display: 'inline-block' }}>
        <Document file={fileUrl} onLoadSuccess={() => {}}>
          <Page pageNumber={1} />
        </Document>
      </div>

      {/* Render Existing Signatures */}
      {signatures.map((sig) => (
        <div
          key={sig._id}
          className={`absolute px-2 py-1 rounded-full text-xs flex items-center gap-2 shadow ${
            sig.status === 'Signed' ? 'bg-green-600 text-white' :
            sig.status === 'Rejected' ? 'bg-red-500 text-white' :
            'bg-yellow-400 text-black'
          }`}
          style={{
            top: `${sig.y}px`,
            left: `${sig.x}px`,
            transform: 'translate(-50%, -50%)',
            zIndex: 100
          }}
        >
          ✍️ {sig.text} ({sig.status})

          {sig.status === 'Pending' && (
            <>
              <button
                onClick={() => updateStatus(sig._id, 'Signed')}
                className="ml-1 text-white hover:scale-110"
                title="Mark as Signed"
              >✔️</button>

              <button
                onClick={() => {
                  const reason = prompt('Reason for rejection:') || 'No reason';
                  updateStatus(sig._id, 'Rejected', reason);
                }}
                className="ml-1 text-white hover:scale-110"
                title="Reject"
              >❌</button>
            </>
          )}

          <button
            onClick={() => deleteSignature(sig._id)}
            className="ml-1 text-white hover:scale-110"
            title="Delete"
          >🗑️</button>
        </div>
      ))}

      {/* Draggable Signature */}
      {pdfRenderSize.width > 0 && pdfRenderSize.height > 0 && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute cursor-move text-sm font-signature shadow-lg"
          style={{
            top: `${dragPos.y}px`,
            left: `${dragPos.x}px`,
            transform: 'translate(-50%, -50%)',
            color: signatureStyle.fontColor,
            fontSize: `${signatureStyle.fontSize}px`,
            padding: '4px 8px',
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontWeight: '500',
            zIndex: 9999
          }}
        >
          ✍️ {signatureStyle.text || 'Your Signature'}
        </div>
      )}
    </div>
  );
};

export default PDFEditor;

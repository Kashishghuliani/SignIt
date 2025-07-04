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
  const token = localStorage.getItem('token');
  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    loadSignatureStyle();
    if (documentId) fetchSignatures();
  }, [documentId]);

  useEffect(() => {
    loadSignatureStyle();
    setDragPos({ x: 100, y: 100 });
  }, [fileUrl]);

  useEffect(() => {
    const handleResize = () => {
      if (pdfWrapperRef.current) {
        const containerWidth = pdfWrapperRef.current.offsetWidth;
        setPdfRenderSize((prev) => ({ ...prev, width: Math.min(containerWidth, 600) }));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadSignatureStyle = () => {
    setSignatureStyle({
      text: localStorage.getItem('signatureText') || '',
      fontSize: parseFloat(localStorage.getItem('fontSize')) || 14,
      fontColor: localStorage.getItem('fontColor') || '#000000'
    });
  };

  const fetchSignatures = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/signatures/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSignatures(res.data);
    } catch (err) {
      console.error('Failed to fetch signatures:', err);
    }
  };

  const onPageLoadSuccess = (page) => {
    const viewport = page.getViewport({ scale: 1 });
    setPdfRenderSize(prev => ({
      ...prev,
      height: viewport.height
    }));
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging || !pdfWrapperRef.current) return;
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
  }, [isDragging]);

  const saveSignature = async () => {
    if (!signatureStyle.text.trim()) return alert("Please set your signature style.");
    try {
      await axios.post(`${API_URL}/api/signatures`, {
        documentId,
        x: dragPos.x,
        y: dragPos.y,
        page: 1,
        renderWidth: pdfRenderSize.width,
        renderHeight: pdfRenderSize.height,
        text: signatureStyle.text,
        fontSize: signatureStyle.fontSize,
        fontColor: signatureStyle.fontColor
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSignatures();
    } catch (err) {
      console.error('❌ Save Error:', err);
      alert('Failed to save signature. Try again.');
    }
  };

  const handleMouseDown = () => {
    const latestText = localStorage.getItem('signatureText') || '';
    if (!latestText.trim()) {
      alert("Please set your signature style first.");
      return;
    }
    setIsDragging(true);
  };

  const updateStatus = async (sigId, status, reason = '') => {
    try {
      await axios.patch(`${API_URL}/api/signatures/${sigId}/status`, { status, reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSignatures();
    } catch (err) {
      console.error('Status Update Error:', err);
      alert('Failed to update signature status.');
    }
  };

  const deleteSignature = async (sigId) => {
    if (!window.confirm('Delete this signature?')) return;
    try {
      await axios.delete(`${API_URL}/api/signatures/${sigId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSignatures();
    } catch (err) {
      console.error('Delete Error:', err);
      alert('Failed to delete signature.');
    }
  };

  return (
    <div
      ref={pdfWrapperRef}
      className="relative mx-auto bg-white shadow border rounded w-full max-w-[700px] overflow-auto"
      style={{ marginTop: '20px' }}
    >
      <div className="w-full flex justify-center">
        <Document file={fileUrl}>
          <Page
            pageNumber={1}
            onLoadSuccess={onPageLoadSuccess}
            width={pdfRenderSize.width}
          />
        </Document>
      </div>

      {/* Render Existing Signatures */}
      {signatures.map(sig => (
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
              <button onClick={() => updateStatus(sig._id, 'Signed')} title="Mark as Signed">✔️</button>
              <button onClick={() => {
                const reason = prompt('Reason for rejection:') || 'No reason';
                updateStatus(sig._id, 'Rejected', reason);
              }} title="Reject">❌</button>
            </>
          )}
          <button onClick={() => deleteSignature(sig._id)} title="Delete">🗑️</button>
        </div>
      ))}

      {/* Signature Drag Element */}
      {signatureStyle.text.trim() && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute cursor-move text-sm shadow-lg select-none"
          style={{
            top: `${dragPos.y}px`,
            left: `${dragPos.x}px`,
            transform: 'translate(-50%, -50%)',
            color: signatureStyle.fontColor,
            fontSize: `${signatureStyle.fontSize}px`,
            background: 'rgba(255,255,255,0.7)',
            padding: '4px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontWeight: '500',
            zIndex: 9999
          }}
          title="Drag to place your signature"
        >
          ✍️ {signatureStyle.text}
        </div>
      )}
    </div>
  );
};

export default PDFEditor;

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
  const [pdfReady, setPdfReady] = useState(false);
  const [signatureStyle, setSignatureStyle] = useState({
    text: '',
    fontSize: 14,
    fontColor: '#000000'
  });

  const wrapperRef = useRef(null);
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
      if (wrapperRef.current) {
        const containerWidth = wrapperRef.current.offsetWidth;
        setPdfRenderSize({
          width: Math.min(containerWidth, 600),
          height: 0
        });
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
    if (!documentId || !token) return;
    try {
      const res = await axios.get(`${API_URL}/api/signatures/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSignatures(res.data || []);
    } catch (err) {
      console.error('❌ Failed to fetch signatures:', err);
    }
  };

  const onPageLoadSuccess = (page) => {
    const viewport = page.getViewport({ scale: 1 });
    const containerWidth = wrapperRef.current?.offsetWidth || 600;
    const scale = containerWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    setPdfRenderSize({
      width: scaledViewport.width,
      height: scaledViewport.height
    });
    setPdfReady(true);
  };

  const saveSignature = async (x, y) => {
    const { width, height } = pdfRenderSize;
    if (!documentId || !token || !signatureStyle.text.trim() || width === 0 || height === 0) {
      alert("Missing document, signature, or PDF size.");
      return;
    }

    const payload = {
      documentId,
      page: 1,
      x,
      y,
      renderWidth: width,
      renderHeight: height,
      text: signatureStyle.text,
      fontSize: signatureStyle.fontSize,
      fontColor: signatureStyle.fontColor
    };

    try {
      await axios.post(`${API_URL}/api/signatures`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSignatures();
    } catch (err) {
      console.error('❌ Save Error:', err.response?.data || err.message);
      alert('Failed to save signature.');
    }
  };

  const handleStart = (e) => {
    if (!signatureStyle.text.trim()) return;
    setIsDragging(true);
    handleMove(e);
  };

  const handleMove = (e) => {
    if (!isDragging || !wrapperRef.current) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = wrapperRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
    setDragPos({ x, y });
  };

  const handleEnd = async () => {
    if (isDragging) {
      setIsDragging(false);
      await saveSignature(dragPos.x, dragPos.y);
    }
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
    if (!sigId) {
      alert("Invalid signature ID.");
      return;
    }
    const confirm = window.confirm('Delete this signature?');
    if (!confirm) return;

    try {
      await axios.delete(`${API_URL}/api/signatures/${sigId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSignatures();
    } catch (err) {
      console.error('Delete Error:', err.response?.data || err.message);
      alert('Failed to delete signature.');
    }
  };

  return (
    <div
      ref={wrapperRef}
      className="relative mx-auto bg-white shadow border rounded w-full max-w-[700px] overflow-auto touch-none"
      style={{ marginTop: '20px' }}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
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

      {/* Existing Signatures */}
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

      {/* Floating Signature */}
      {signatureStyle.text.trim() && pdfReady && (
        <div
          className="absolute text-sm shadow-lg select-none"
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
            cursor: isDragging ? 'grabbing' : 'grab',
            zIndex: 9999
          }}
        >
          ✍️ {signatureStyle.text}
        </div>
      )}
    </div>
  );
};

export default PDFEditor;

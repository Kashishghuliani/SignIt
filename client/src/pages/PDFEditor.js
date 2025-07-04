import React, { useEffect, useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFEditor = ({ fileUrl, documentId }) => {
  const [signatures, setSignatures] = useState([]);
  const [dragPos, setDragPos] = useState(null); // null until drag starts
  const [pdfSize, setPdfSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [signatureStyle, setSignatureStyle] = useState({
    text: '',
    fontSize: 14,
    fontColor: '#000000'
  });

  const pdfWrapperRef = useRef(null);
  const token = localStorage.getItem('token');
  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  // Load signature style from localStorage
  const loadSignatureStyle = () => {
    setSignatureStyle({
      text: localStorage.getItem('signatureText') || '',
      fontSize: parseFloat(localStorage.getItem('fontSize')) || 14,
      fontColor: localStorage.getItem('fontColor') || '#000000'
    });
  };

  useEffect(() => {
    loadSignatureStyle();
    if (documentId) fetchSignatures();
  }, [documentId]);

  useEffect(() => {
    loadSignatureStyle();
    setDragPos(null);
  }, [fileUrl]);

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
    const { width, height } = page.getViewport({ scale: 1 });
    setPdfSize({ width, height });
  };

  // Position update on drag
  useEffect(() => {
    const move = (x, y) => {
      if (!pdfWrapperRef.current) return;
      const rect = pdfWrapperRef.current.getBoundingClientRect();
      const localX = x - rect.left;
      const localY = y - rect.top;
      setDragPos({
        x: Math.max(0, Math.min(localX, rect.width)),
        y: Math.max(0, Math.min(localY, rect.height))
      });
    };

    const handleMouseMove = (e) => isDragging && move(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      if (isDragging && e.touches.length === 1) {
        move(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const endDrag = () => {
      if (isDragging) {
        setIsDragging(false);
        saveSignature();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', endDrag);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', endDrag);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', endDrag);
    };
  }, [isDragging]);

  const handleStartDrag = () => {
    if (!signatureStyle.text.trim()) {
      alert("Please set your signature style first.");
      return;
    }
    setDragPos({ x: 100, y: 100 }); // Optional: Reset drag start
    setIsDragging(true);
  };

  const saveSignature = async () => {
    if (!dragPos || !pdfSize.width || !pdfSize.height) return;

    const xPercent = dragPos.x / pdfSize.width;
    const yPercent = dragPos.y / pdfSize.height;

    try {
      await axios.post(`${API_URL}/api/signatures`, {
        documentId,
        xPercent,
        yPercent,
        page: 1,
        renderWidth: pdfSize.width,
        renderHeight: pdfSize.height,
        text: signatureStyle.text,
        fontSize: signatureStyle.fontSize,
        fontColor: signatureStyle.fontColor
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDragPos(null); // reset position after placing
      fetchSignatures();
    } catch (err) {
      console.error('❌ Save Error:', err);
      alert('Failed to save signature. Try again.');
    }
  };

  const updateStatus = async (sigId, status, reason = '') => {
    try {
      await axios.patch(`${API_URL}/api/signatures/${sigId}/status`, { status, reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSignatures();
    } catch (err) {
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
      alert('Failed to delete signature.');
    }
  };

  return (
    <div
      ref={pdfWrapperRef}
      className="relative mx-auto bg-white shadow border rounded w-full max-w-[700px]"
      style={{ marginTop: 20 }}
    >
      <div className="w-full flex justify-center">
        <Document file={fileUrl}>
          <Page
            pageNumber={1}
            width={pdfSize.width}
            onLoadSuccess={onPageLoadSuccess}
          />
        </Document>
      </div>

      {/* Show saved signatures */}
      {signatures.map(sig => {
        const x = sig.xPercent * pdfSize.width;
        const y = sig.yPercent * pdfSize.height;

        return (
          <div
            key={sig._id}
            className={`absolute px-2 py-1 rounded-full text-xs flex items-center gap-2 shadow ${
              sig.status === 'Signed' ? 'bg-green-600 text-white' :
              sig.status === 'Rejected' ? 'bg-red-500 text-white' :
              'bg-yellow-400 text-black'
            }`}
            style={{
              top: `${y}px`,
              left: `${x}px`,
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
        );
      })}

      {/* Draggable Signature */}
      {signatureStyle.text && dragPos && (
        <div
          onMouseDown={handleStartDrag}
          onTouchStart={handleStartDrag}
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

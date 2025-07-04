import React, { useEffect, useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PublicSign = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const [fileUrl, setFileUrl] = useState('');
  const [pdfSize, setPdfSize] = useState({ width: 0, height: 0 });
  const [dragPos, setDragPos] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [signatureText, setSignatureText] = useState('');
  const [fontSize, setFontSize] = useState(20);
  const [color, setColor] = useState('#008000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const wrapperRef = useRef(null);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/docs/public/${token}`);
        if (!res.data?.filepath) throw new Error('Invalid file');

        // Load PDF from the backend uploads folder
        setFileUrl(`${API_URL}/uploads/${res.data.filepath}`);
      } catch (err) {
        console.error(err);
        setMessage('Invalid or expired link');
      }
    };
    fetchDoc();
  }, [token, API_URL]);

  const onPageLoadSuccess = (page) => {
    const viewport = page.getViewport({ scale: 1 });
    setPdfSize({ width: viewport.width, height: viewport.height });
  };

  const handleMouseDown = () => {
    if (!placed && signatureText.trim()) setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(e.clientY - rect.top, 0), rect.height);
    setDragPos({ x, y });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setPlaced(true);
    }
  };

  const handleSign = async () => {
    if (pdfSize.width === 0 || pdfSize.height === 0 || !signatureText.trim()) {
      return alert('Please enter your name and wait for the PDF to load.');
    }
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/docs/public-sign`, {
        token,
        x: dragPos.x,
        y: dragPos.y,
        page: 1,
        renderWidth: pdfSize.width,
        renderHeight: pdfSize.height,
        signerName: signatureText.trim(),
        fontSize,
        color
      });
      alert('Document signed successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Error signing document');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 flex justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">

        <h2 className="text-3xl font-bold text-center mb-6" style={{ color: '#d90429' }}>
          Document Signature
        </h2>

        {message && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 shadow text-center">
            {message}
          </div>
        )}

        {fileUrl && !placed && (
          <div className="bg-gray-50 p-4 rounded shadow mb-6">
            <h3 className="font-semibold mb-3">Enter Your Signature:</h3>
            <input
              type="text"
              placeholder="Your Full Name"
              className="border px-4 py-2 rounded w-full mb-3"
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
              disabled={placed}
            />
            <div className="flex items-center gap-4">
              <label className="text-sm">Font Size:</label>
              <input
                type="number"
                min="10"
                max="50"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="border px-2 py-1 w-20"
                disabled={placed}
              />
              <label className="text-sm">Color:</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 border"
                disabled={placed}
              />
            </div>
          </div>
        )}

        {fileUrl && (
          <div
            ref={wrapperRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="border mx-auto relative overflow-hidden bg-white shadow mb-6"
            style={{ width: '100%', maxWidth: '700px', minHeight: '900px' }}
          >
            <Document file={fileUrl}>
              <Page pageNumber={1} onLoadSuccess={onPageLoadSuccess} />
            </Document>

            {pdfSize.width > 0 && signatureText.trim() && (
              <div
                onMouseDown={handleMouseDown}
                style={{
                  position: 'absolute',
                  top: `${dragPos.y}px`,
                  left: `${dragPos.x}px`,
                  fontSize: `${fontSize}px`,
                  color,
                  fontWeight: 'bold',
                  cursor: placed ? 'default' : 'move',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 200
                }}
              >
                {signatureText.trim()}
              </div>
            )}
          </div>
        )}

        {fileUrl && placed && (
          <button
            onClick={handleSign}
            className="w-full bg-[#d90429] hover:bg-red-700 text-white font-semibold py-2 rounded"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing...' : 'Confirm & Sign Document'}
          </button>
        )}

      </div>
    </div>
  );
};

export default PublicSign;

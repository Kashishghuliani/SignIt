import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { pdfjs } from 'react-pdf';
import PDFEditor from './PDFEditor';
import { useNavigate } from 'react-router-dom';
import {
  FaEye, FaPaperPlane, FaFilePdf, FaClipboardList, FaTrash, FaPaintBrush
} from 'react-icons/fa';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [showStyleModal, setShowStyleModal] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [fontColor, setFontColor] = useState('#000000');

  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  const FRONTEND_URL = 'https://sign-it-5656.vercel.app';

  useEffect(() => {
    if (!token) navigate('/login');
    else fetchDocuments();

    setSignerName(localStorage.getItem('signatureText') || '');
    setFontSize(parseFloat(localStorage.getItem('fontSize')) || 14);
    setFontColor(localStorage.getItem('fontColor') || '#000000');
  }, []);

  const saveStyle = () => {
    localStorage.setItem('signatureText', signerName);
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('fontColor', fontColor);
    alert('✅ Signature Style Saved');
    setShowStyleModal(false);
  };

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/docs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(res.data);
      if (res.data.length > 0) {
        const latest = res.data[res.data.length - 1];
        setSelectedDoc(latest);
        setSelectedDocId(latest._id);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        alert("Error fetching documents.");
      }
    }
  };

  const handleFileChange = (e) => setPdfFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) setPdfFile(e.dataTransfer.files[0]); };
  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = () => setDragActive(false);

  const handleUpload = async () => {
    if (!pdfFile) return alert("Please select a PDF file.");
    setUploading(true);
    const formData = new FormData();
    formData.append('pdf', pdfFile);

    try {
      await axios.post(`${BACKEND_URL}/api/docs/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      alert("PDF uploaded successfully!");
      setPdfFile(null);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      alert("Error uploading PDF.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDoc) return;
    if (!window.confirm("Are you sure you want to delete this PDF?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/docs/${selectedDoc._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("PDF deleted successfully!");
      setSelectedDoc(null);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      alert("Error deleting PDF.");
    }
  };

  const finalizePdf = async () => {
    if (!selectedDoc) return;
    try {
      const res = await axios.post(`${BACKEND_URL}/api/signatures/finalize`, {
        documentId: selectedDoc._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.open(res.data.signedPdfUrl, '_blank');
    } catch (err) {
      console.error(err);
      alert("Error generating signed PDF.");
    }
  };

  const sendPublicLink = async () => {
    if (!selectedDoc) return;
    const recipientEmail = prompt("Enter recipient's email to send signing link:");
    if (!recipientEmail) return;
    try {
      await axios.post(`${BACKEND_URL}/api/docs/send-link`, {
        documentId: selectedDoc._id,
        recipientEmail
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Public signing link sent!");
      fetchDocuments();
    } catch (err) {
      console.error(err);
      alert("Error sending signing link.");
    }
  };

  const viewAuditTrail = () => {
    if (!selectedDoc) return;
    navigate(`/audit/${selectedDoc._id}`);
  };

  const viewPdf = () => {
    if (!selectedDoc) return;
    setSelectedPdf(`${BACKEND_URL}/uploads/${selectedDoc.filepath.split('/').pop()}`);
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen text-gray-800">

      {/* Sidebar */}
      <div className="md:w-64 w-full bg-gradient-to-b from-[#c31432] to-[#ff5f5f] text-white p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center md:text-left">SignIt</h2>
          <button
            className="block w-full text-left mb-4 hover:bg-white hover:text-red-600 px-3 py-2 rounded transition"
            onClick={fetchDocuments}
          >
            All Documents
          </button>

          <div className="mt-6 border-t border-red-300 pt-4">
            <h3 className="font-semibold text-lg mb-3 text-center md:text-left">Quick Actions</h3>
            {[{
              icon: <FaEye />, label: 'Preview', onClick: viewPdf, disabled: !selectedDoc
            }, {
              icon: <FaPaintBrush />, label: 'Signature Style', onClick: () => setShowStyleModal(true)
            }, {
              icon: <FaPaperPlane />, label: 'Send Link', onClick: sendPublicLink, disabled: !selectedDoc
            }, {
              icon: <FaFilePdf />, label: 'Download Signed', onClick: finalizePdf, disabled: !selectedDoc
            }, {
              icon: <FaClipboardList />, label: 'Audit Trail', onClick: viewAuditTrail, disabled: !selectedDoc
            }, {
              icon: <FaTrash />, label: 'Delete', onClick: handleDelete, disabled: !selectedDoc
            }].map(({ icon, label, onClick, disabled = false }) => (
              <button
                key={label}
                onClick={onClick}
                disabled={disabled}
                className="flex items-center gap-2 mb-3 px-2 py-1 hover:bg-white hover:text-red-600 disabled:opacity-50 rounded transition w-full justify-center md:justify-start"
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={logout}
          className="bg-white text-red-600 font-bold px-4 py-2 rounded mt-6 w-full"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-center md:text-left">My PDF Dashboard</h1>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed p-6 text-center rounded mb-8 cursor-pointer ${dragActive ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
        >
          <p className="mb-4">Drag & Drop PDF here or select manually</p>
          <input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-4 mx-auto block" />
          <button
            onClick={handleUpload}
            disabled={!pdfFile || uploading}
            className={`px-5 py-2 rounded ${pdfFile && !uploading ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-500'}`}
          >
            {uploading ? 'Uploading...' : 'Upload PDF'}
          </button>
          {pdfFile && <p className="text-sm mt-2">{pdfFile.name}</p>}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm table-auto">
            <thead>
              <tr>
                <th className="border px-4 py-2">Filename</th>
                <th className="border px-4 py-2">Total</th>
                <th className="border px-4 py-2">Signed</th>
                <th className="border px-4 py-2">Pending</th>
                <th className="border px-4 py-2">Rejected</th>
                <th className="border px-4 py-2">Public Link</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr
                  key={doc._id}
                  className={`cursor-pointer ${selectedDoc?._id === doc._id ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
                  onClick={() => { setSelectedDoc(doc); setSelectedDocId(doc._id); setSelectedPdf(null); }}
                >
                  <td className="border px-4 py-2 truncate max-w-[200px]">{doc.filename}</td>
                  <td className="border px-4 py-2 text-center">{doc.signatureSummary?.total || 0}</td>
                  <td className="border px-4 py-2 text-green-600 text-center">{doc.signatureSummary?.signed || 0}</td>
                  <td className="border px-4 py-2 text-yellow-600 text-center">{doc.signatureSummary?.pending || 0}</td>
                  <td className="border px-4 py-2 text-red-500 text-center">{doc.signatureSummary?.rejected || 0}</td>
                  <td className="border px-4 py-2 text-center">
                    {doc.token ? (
                      <a href={`${FRONTEND_URL}/sign/${doc.token}`} target="_blank" rel="noreferrer" className="text-blue-500 underline">
                        Open Link
                      </a>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedPdf && <PDFEditor fileUrl={selectedPdf} documentId={selectedDocId} />}
      </div>

      {/* Signature Style Modal */}
      {showStyleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80 text-center">
            <h2 className="text-xl font-bold mb-4">🎨 Design Your Signature</h2>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Your Name"
              className="border px-3 py-2 rounded w-full mb-3"
            />
            <label className="block mb-1">Font Size: {fontSize}px</label>
            <input
              type="range"
              min="10"
              max="30"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="w-full mb-3"
            />
            <label className="block mb-1">Color:</label>
            <input
              type="color"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              className="w-full h-10 mb-4"
            />
            <div className="mb-4" style={{ color: fontColor, fontSize: `${fontSize}px` }}>
              {signerName || 'Your Signature Preview'}
            </div>
            <button onClick={saveStyle} className="bg-red-500 text-white px-4 py-2 rounded w-full mb-2">
              ✅ Save Style
            </button>
            <button onClick={() => setShowStyleModal(false)} className="bg-gray-300 px-4 py-2 rounded w-full">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

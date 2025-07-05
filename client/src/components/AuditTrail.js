import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AuditTrail = ({ documentId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      try {
        const res = await axios.get(`${API_URL}/api/audit/${documentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!Array.isArray(res.data)) {
          throw new Error('Invalid response format');
        }

        setLogs(res.data);
      } catch (err) {
        console.error("Error fetching audit logs:", err);
        setError('Unable to load audit trail. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchLogs();
    } else {
      setError('No document ID provided.');
      setLoading(false);
    }
  }, [documentId, API_URL]);

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      {loading && (
        <div className="text-center text-gray-500 py-4">
          Loading audit trail...
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded shadow mb-4 text-center">
          {error}
        </div>
      )}

      {!loading && !error && logs.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          No audit logs found for this document.
        </div>
      )}

      {!loading && !error && logs.length > 0 && (
        <div className="space-y-4">
          {logs.map((log, index) => (
            <div
              key={index}
              className="border rounded-md p-4 shadow-sm hover:shadow transition duration-150 ease-in-out bg-gray-50"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                <span className="font-semibold text-gray-800">
                  {log.action}
                </span>
                <span className="text-sm text-gray-500 mt-1 sm:mt-0">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-gray-700">
                By <span className="text-blue-600 font-medium">{log.user || 'Unknown'}</span>
                {' '}({log.ip === '::1' ? 'localhost' : log.ip})
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditTrail;

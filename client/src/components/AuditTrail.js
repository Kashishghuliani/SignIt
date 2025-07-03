import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AuditTrail = ({ documentId }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`http://localhost:5000/api/audit/${documentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLogs(res.data);
      } catch (err) {
        console.error("Error fetching audit logs:", err);
      }
    };

    fetchLogs();
  }, [documentId]);

  return (
    <div className="bg-white shadow p-4 rounded">
      {logs.length === 0 ? (
        <p>No audit logs found for this document.</p>
      ) : (
        <ul className="space-y-2">
          {logs.map((log, i) => (
            <li key={i} className="border-b pb-2">
              <strong>{log.action}</strong> by <span className="text-blue-600">{log.user}</span> 
              ({log.ip === "::1" ? "localhost" : log.ip})<br />
              <span className="text-gray-500 text-sm">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AuditTrail;

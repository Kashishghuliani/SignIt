import React from 'react';
import { useParams } from 'react-router-dom';
import AuditTrail from '../components/AuditTrail';

const AuditTrailPage = () => {
  const { documentId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-red-500 mb-6 text-center">
        Document Audit Trail
      </h2>

      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-4">
        <AuditTrail documentId={documentId} />
      </div>
    </div>
  );
};

export default AuditTrailPage;

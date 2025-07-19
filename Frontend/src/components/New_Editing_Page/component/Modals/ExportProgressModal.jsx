import React from 'react';

const ExportProgressModal = ({ open, progress, previewUrl }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96 flex flex-col items-center">
        <h2 className="text-lg font-bold mb-4">Exporting...</h2>
        <div className="w-full bg-gray-200 rounded h-4 mb-4">
          <div
            className="bg-blue-600 h-4 rounded"
            style={{ width: `${progress}%`, transition: 'width 0.2s' }}
          />
        </div>
        <div className="text-gray-700 mb-2">{progress}%</div>
        {previewUrl && (
          <video
            src={previewUrl}
            controls
            className="w-full rounded mt-4"
            style={{ maxHeight: 200 }}
          />
        )}
      </div>
    </div>
  );
};

export default ExportProgressModal; 
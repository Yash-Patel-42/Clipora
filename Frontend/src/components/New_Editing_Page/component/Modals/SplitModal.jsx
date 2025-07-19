import React from 'react';

const SplitModal = ({ open, onClose, onConfirm, splitTime, setSplitTime, selectedClip }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-lg font-bold mb-2">Split Video</h2>
        <div className="mb-2 text-gray-700 text-sm">Video duration: {selectedClip?.duration ? selectedClip.duration.toFixed(2) : 'Loading...'} seconds</div>
        <label className="block mb-4">Split Time (seconds):
          <input type="number" min="1" max={selectedClip?.duration - 1 || 1} value={splitTime} onChange={e => setSplitTime(Number(e.target.value))} className="ml-2 border rounded px-2 py-1" />
        </label>
        {(splitTime <= 0 || splitTime >= selectedClip?.duration) && (
          <div className="text-red-600 mb-2">Split time must be between 1 and video duration - 1.</div>
        )}
        <div className="mt-4 flex gap-2">
          <button onClick={onConfirm} className={`bg-blue-600 text-white px-4 py-2 rounded ${(splitTime <= 0 || splitTime >= selectedClip?.duration) ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={splitTime <= 0 || splitTime >= selectedClip?.duration}>Split</button>
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default SplitModal; 
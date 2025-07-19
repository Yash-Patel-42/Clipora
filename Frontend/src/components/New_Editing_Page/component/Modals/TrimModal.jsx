import React from 'react';

const TrimModal = ({ open, onClose, onConfirm, trimStart, setTrimStart, trimEnd, setTrimEnd, selectedClip }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-lg font-bold mb-2">Trim Video</h2>
        <div className="mb-2 text-gray-700 text-sm">Video duration: {selectedClip?.duration ? selectedClip.duration.toFixed(2) : 'Loading...'} seconds</div>
        <label className="block mb-2">Start Time (seconds):
          <input type="number" min="0" max={selectedClip?.duration || 0} value={trimStart} onChange={e => {
            const value = Number(e.target.value);
            setTrimStart(value);
            if (trimEnd <= value) setTrimEnd(Math.min((selectedClip?.duration || 0), value + 0.1));
          }} className="ml-2 border rounded px-2 py-1" />
        </label>
        <label className="block mb-4">End Time (seconds):
          <input type="number" min={trimStart + 0.1} max={selectedClip?.duration || 0} value={trimEnd} onChange={e => setTrimEnd(Number(e.target.value))} className="ml-2 border rounded px-2 py-1" />
        </label>
        {(trimEnd <= trimStart) && (
          <div className="text-red-600 mb-2">End time must be greater than start time.</div>
        )}
        <div className="mt-4 flex gap-2">
          <button onClick={onConfirm} className={`bg-blue-600 text-white px-4 py-2 rounded ${(trimEnd <= trimStart || !selectedClip?.duration || selectedClip.duration <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={trimEnd <= trimStart || !selectedClip?.duration || selectedClip.duration <= 0}>Trim</button>
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default TrimModal; 
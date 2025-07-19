import React from 'react';

const TextOverlayModal = ({
  open,
  onClose,
  onConfirm,
  overlayText,
  setOverlayText,
  textStart,
  setTextStart,
  textEnd,
  setTextEnd,
  fontSize,
  setFontSize,
  fontColor,
  setFontColor,
  textAlignment,
  setTextAlignment,
  selectedClip
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-lg font-bold mb-2">Add Text Overlay</h2>
        <div className="mb-2 text-gray-700 text-sm">Video duration: {selectedClip?.duration ? selectedClip.duration.toFixed(2) : 'Loading...'} seconds</div>
        <label className="block mb-2">Text:
          <input type="text" value={overlayText} onChange={e => setOverlayText(e.target.value)} className="ml-2 border rounded px-2 py-1 w-full" />
        </label>
        <label className="block mb-2">Start Time (seconds):
          <input type="number" min="0" max={selectedClip?.duration || 0} value={textStart} onChange={e => setTextStart(Number(e.target.value))} className="ml-2 border rounded px-2 py-1" />
        </label>
        <label className="block mb-2">End Time (seconds):
          <input type="number" min={textStart + 0.1} max={selectedClip?.duration || 0} value={textEnd} onChange={e => setTextEnd(Number(e.target.value))} className="ml-2 border rounded px-2 py-1" />
        </label>
        <label className="block mb-2">Font Size:
          <input type="number" min="8" max="128" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="ml-2 border rounded px-2 py-1 w-20" />
        </label>
        <label className="block mb-2">Font Color:
          <input type="color" value={fontColor} onChange={e => setFontColor(e.target.value)} className="ml-2 border rounded px-2 py-1 w-10 h-8 align-middle" />
        </label>
        <label className="block mb-4">Alignment:
          <select value={textAlignment} onChange={e => setTextAlignment(Number(e.target.value))} className="ml-2 border rounded px-2 py-1">
            <option value={2}>Bottom Center</option>
            <option value={8}>Top Center</option>
            <option value={5}>Middle Center</option>
            <option value={1}>Bottom Left</option>
            <option value={3}>Bottom Right</option>
            <option value={4}>Middle Left</option>
            <option value={6}>Middle Right</option>
            <option value={7}>Top Left</option>
            <option value={9}>Top Right</option>
          </select>
        </label>
        {(overlayText.trim() === '' || textEnd <= textStart) && (
          <div className="text-red-600 mb-2">Text is required and end time must be greater than start time.</div>
        )}
        <div className="mt-4 flex gap-2">
          <button onClick={onConfirm} className={`bg-blue-600 text-white px-4 py-2 rounded ${(overlayText.trim() === '' || textEnd <= textStart) ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={overlayText.trim() === '' || textEnd <= textStart}>Apply</button>
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default TextOverlayModal; 
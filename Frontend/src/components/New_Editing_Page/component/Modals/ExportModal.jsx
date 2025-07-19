import React from 'react';

const ExportModal = ({
  open,
  onClose,
  onExport,
  exportSettings,
  setExportSettings,
  EXPORT_PRESETS
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Export Settings</h2>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Preset:</label>
          <select
            value={exportSettings.preset}
            onChange={e => {
              const preset = EXPORT_PRESETS.find(p => p.label === e.target.value);
              setExportSettings({
                ...exportSettings,
                preset: preset.label,
                resolution: preset.resolution,
                aspect: preset.aspect,
                format: preset.format,
              });
            }}
            className="w-full px-2 py-1 border rounded"
          >
            {EXPORT_PRESETS.map(p => (
              <option key={p.label} value={p.label}>{p.label}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1">Resolution:</label>
          <input
            type="text"
            value={exportSettings.resolution}
            onChange={e => setExportSettings({ ...exportSettings, resolution: e.target.value })}
            className="w-full px-2 py-1 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Aspect Ratio:</label>
          <input
            type="text"
            value={exportSettings.aspect}
            onChange={e => setExportSettings({ ...exportSettings, aspect: e.target.value })}
            className="w-full px-2 py-1 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Format:</label>
          <select
            value={exportSettings.format}
            onChange={e => setExportSettings({ ...exportSettings, format: e.target.value })}
            className="w-full px-2 py-1 border rounded"
          >
            <option value="mp4">MP4</option>
            <option value="mov">MOV</option>
            <option value="webm">WebM</option>
          </select>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onExport}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Export
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal; 
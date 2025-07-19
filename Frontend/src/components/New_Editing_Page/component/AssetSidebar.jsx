import React from 'react';

const AssetSidebar = ({
  assets,
  onAssetDragStart,
  onSaveProject,
  onLoadProject,
  fileInputRef,
  onAddTextAsset,
  TRANSITIONS,
  onTransitionDragStart
}) => {
  return (
    <div className="w-56 bg-gray-800 border-r border-gray-700 flex flex-col p-2 overflow-y-auto min-w-0">
      <h2 className="text-white text-lg font-bold mb-2">Assets</h2>
      {assets.length === 0 && <div className="text-gray-400 text-sm">No assets imported yet.</div>}
      {assets.map(asset => (
        <div
          key={asset.id}
          className="mb-2 p-2 bg-gray-700 rounded cursor-grab hover:bg-gray-600 text-white"
          draggable
          onDragStart={e => onAssetDragStart(e, asset)}
        >
          <div className="font-medium truncate">{asset.name}</div>
          <div className="text-xs text-gray-300">{asset.type} {asset.duration ? `(${asset.duration.toFixed(2)}s)` : ''}</div>
        </div>
      ))}
      {/* Project Save/Load Buttons */}
      <button
        className="mt-4 bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-600"
        onClick={onSaveProject}
      >
        Save Project
      </button>
      <button
        className="mt-2 bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600"
        onClick={onLoadProject}
      >
        Load Project
      </button>
      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={onLoadProject}
      />
      {/* Transition Palette */}
      <h2 className="text-white text-lg font-bold mt-6 mb-2">Transitions</h2>
      {TRANSITIONS.map(tr => (
        <div
          key={tr.type}
          className={`mb-2 p-2 rounded cursor-grab text-white ${tr.color}`}
          draggable
          onDragStart={e => onTransitionDragStart(e, tr)}
        >
          {tr.label}
        </div>
      ))}
      {/* Add text asset button */}
      <button
        className="mt-4 bg-pink-700 text-white px-3 py-1 rounded hover:bg-pink-600"
        onClick={onAddTextAsset}
      >
        Add Text Asset
      </button>
    </div>
  );
};

export default AssetSidebar; 
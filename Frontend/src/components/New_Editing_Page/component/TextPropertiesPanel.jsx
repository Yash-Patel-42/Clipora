import React from 'react';

const TextPropertiesPanel = ({ selectedClip, handleUpdateTextClip }) => {
  if (!selectedClip || selectedClip.type !== 'text') return null;
  return (
    <div className="bg-gray-800 p-4 border-t border-gray-700">
      <h3 className="text-white font-bold mb-2">Text Properties</h3>
      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          value={selectedClip.text}
          onChange={e => handleUpdateTextClip({ text: e.target.value })}
          className="px-2 py-1 rounded border border-gray-600 bg-gray-900 text-white w-48"
          placeholder="Text"
        />
        <select
          value={selectedClip.font}
          onChange={e => handleUpdateTextClip({ font: e.target.value })}
          className="px-2 py-1 rounded border border-gray-600 bg-gray-900 text-white"
        >
          <option value="Arial">Arial</option>
          <option value="Roboto">Roboto</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
          <option value="Impact">Impact</option>
        </select>
        <input
          type="number"
          min={8}
          max={128}
          value={selectedClip.fontSize}
          onChange={e => handleUpdateTextClip({ fontSize: Number(e.target.value) })}
          className="w-20 px-2 py-1 rounded border border-gray-600 bg-gray-900 text-white"
          placeholder="Font Size"
        />
        <input
          type="color"
          value={selectedClip.color}
          onChange={e => handleUpdateTextClip({ color: e.target.value })}
          className="w-10 h-8 border rounded"
        />
        <select
          value={selectedClip.alignment}
          onChange={e => handleUpdateTextClip({ alignment: e.target.value })}
          className="px-2 py-1 rounded border border-gray-600 bg-gray-900 text-white"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
        <label className="flex items-center gap-1 text-white">
          <input
            type="checkbox"
            checked={selectedClip.shadow}
            onChange={e => handleUpdateTextClip({ shadow: e.target.checked })}
          />
          Shadow
        </label>
        <label className="flex items-center gap-1 text-white">
          <input
            type="checkbox"
            checked={selectedClip.outline}
            onChange={e => handleUpdateTextClip({ outline: e.target.checked })}
          />
          Outline
        </label>
      </div>
    </div>
  );
};

export default TextPropertiesPanel; 
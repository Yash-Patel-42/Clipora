import React, { useState } from 'react';

const PROPERTIES = [
  { key: 'opacity', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  { key: 'position', label: 'Position (X,Y)', min: -1000, max: 1000, step: 1 },
  { key: 'scale', label: 'Scale', min: 0.1, max: 10, step: 0.01 },
  { key: 'rotation', label: 'Rotation', min: -180, max: 180, step: 1 },
];

export default function KeyframePanel({ clip, onUpdate }) {
  const [time, setTime] = useState(0);
  const [property, setProperty] = useState('opacity');
  const [value, setValue] = useState(1);
  const keyframes = clip.keyframes || [];

  const handleAdd = () => {
    if (property === 'position') {
      // For position, value is "x,y"
      const [x, y] = value.split(',').map(Number);
      onUpdate([...keyframes, { time: Number(time), property, value: [x, y] }]);
    } else {
      onUpdate([...keyframes, { time: Number(time), property, value: Number(value) }]);
    }
  };
  const handleRemove = idx => {
    onUpdate(keyframes.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          type="number"
          min={0}
          max={clip.duration || 1000}
          step={0.01}
          value={time}
          onChange={e => setTime(e.target.value)}
          className="w-20 px-2 py-1 rounded border border-gray-600 bg-gray-900 text-white"
          placeholder="Time (s)"
        />
        <select
          value={property}
          onChange={e => setProperty(e.target.value)}
          className="px-2 py-1 rounded border border-gray-600 bg-gray-900 text-white"
        >
          {PROPERTIES.map(p => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
        {property === 'position' ? (
          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            className="w-24 px-2 py-1 rounded border border-gray-600 bg-gray-900 text-white"
            placeholder="x,y"
          />
        ) : (
          <input
            type="number"
            min={PROPERTIES.find(p => p.key === property).min}
            max={PROPERTIES.find(p => p.key === property).max}
            step={PROPERTIES.find(p => p.key === property).step}
            value={value}
            onChange={e => setValue(e.target.value)}
            className="w-20 px-2 py-1 rounded border border-gray-600 bg-gray-900 text-white"
            placeholder="Value"
          />
        )}
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500"
        >
          Add Keyframe
        </button>
      </div>
      <table className="w-full text-xs text-white bg-gray-900 rounded">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="py-1">Time (s)</th>
            <th className="py-1">Property</th>
            <th className="py-1">Value</th>
            <th className="py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {keyframes.length === 0 && (
            <tr><td colSpan={4} className="text-gray-400 text-center py-2">No keyframes yet.</td></tr>
          )}
          {keyframes.map((kf, i) => (
            <tr key={i} className="border-b border-gray-800">
              <td className="py-1">{kf.time}</td>
              <td className="py-1">{PROPERTIES.find(p => p.key === kf.property)?.label || kf.property}</td>
              <td className="py-1">{Array.isArray(kf.value) ? kf.value.join(',') : kf.value}</td>
              <td className="py-1">
                <button
                  onClick={() => handleRemove(i)}
                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-500"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 
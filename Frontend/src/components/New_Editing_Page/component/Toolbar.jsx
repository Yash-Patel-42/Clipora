import React from 'react';

const ICONS = {
  import: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
  ),
  export: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
  ),
  trim: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /></svg>
  ),
  split: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14" /></svg>
  ),
  text: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M4 20h16M4 4h16M12 4v16" /></svg>
  ),
  splitPlayhead: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 3v18M5 12h14" /></svg>
  ),
  trimStart: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M4 4v16M4 12h16" /></svg>
  ),
  trimEnd: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M20 4v16M4 12h16" /></svg>
  ),
  undo: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 14l-5-5 5-5M4 9h11a4 4 0 110 8h-1" /></svg>
  ),
  redo: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 10l5 5-5 5M20 15H9a4 4 0 110-8h1" /></svg>
  ),
};

const Toolbar = ({ onImport, onExport, onTrim, onSplit, onTextOverlay, onSplitAtPlayhead, onTrimStartAtPlayhead, onTrimEndAtPlayhead, onUndo, onRedo, canUndo, canRedo }) => {
  return (
    <div className="h-14 bg-gray-900 border-b border-gray-800 px-4 flex items-center gap-2">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`p-2 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 ${!canUndo ? 'text-gray-500' : 'text-white'}`}
        title="Undo (Ctrl+Z)"
        aria-label="Undo"
      >
        {ICONS.undo}
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`p-2 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 ${!canRedo ? 'text-gray-500' : 'text-white'}`}
        title="Redo (Ctrl+Y)"
        aria-label="Redo"
      >
        {ICONS.redo}
      </button>
      <div className="w-px h-6 bg-gray-800 mx-2" />
      <button
        onClick={onImport}
        className="p-2 rounded hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        title="Import"
        aria-label="Import"
      >
        {ICONS.import}
      </button>
      <button
        onClick={onExport}
        className="p-2 rounded hover:bg-green-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
        title="Export"
        aria-label="Export"
      >
        {ICONS.export}
      </button>
      <button
        onClick={onTrim}
        className="p-2 rounded hover:bg-yellow-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        title="Trim (Modal)"
        aria-label="Trim"
      >
        {ICONS.trim}
      </button>
      <button
        onClick={onSplit}
        className="p-2 rounded hover:bg-purple-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
        title="Split (Modal)"
        aria-label="Split"
      >
        {ICONS.split}
      </button>
      <button
        onClick={onTextOverlay}
        className="p-2 rounded hover:bg-pink-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
        title="Text Overlay"
        aria-label="Text Overlay"
      >
        {ICONS.text}
      </button>
      <button
        onClick={onSplitAtPlayhead}
        className="p-2 rounded hover:bg-indigo-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        title="Split at Playhead"
        aria-label="Split at Playhead"
      >
        {ICONS.splitPlayhead}
      </button>
      <button
        onClick={onTrimStartAtPlayhead}
        className="p-2 rounded hover:bg-orange-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
        title="Trim Start at Playhead"
        aria-label="Trim Start at Playhead"
      >
        {ICONS.trimStart}
      </button>
      <button
        onClick={onTrimEndAtPlayhead}
        className="p-2 rounded hover:bg-red-700 text-white focus:outline-none focus:ring-2 focus:ring-red-400"
        title="Trim End at Playhead"
        aria-label="Trim End at Playhead"
      >
        {ICONS.trimEnd}
      </button>
    </div>
  );
};

export default Toolbar; 
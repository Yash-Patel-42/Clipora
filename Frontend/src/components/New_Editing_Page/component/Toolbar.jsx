import React from 'react';

const Toolbar = ({ onImport }) => {
  return (
    <div className="h-14 bg-gray-900 border-b border-gray-800 px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button 
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
          onClick={onImport}
          title="Import Media"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
        </button>

        <div className="h-6 w-px bg-gray-800" />
        
        <button 
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
          title="Video"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>

        <button 
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
          title="Image"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15l-5-5L5 21" />
          </svg>
        </button>

        <button 
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
          title="Text"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </button>

        <button 
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
          title="Audio"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </button>

        <button 
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
          title="Transitions"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </button>

        <div className="h-6 w-px bg-gray-800" />

        <button 
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
          title="Split"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243zm0 0L9.121 9.121" />
          </svg>
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
          title="Undo"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 010 10H3" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l6-6M3 10l6 6" />
          </svg>
        </button>

        <button 
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
          title="Redo"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a5 5 0 000 10h10" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10l-6-6M21 10l-6 6" />
          </svg>
        </button>

        <div className="h-6 w-px bg-gray-800" />

        <button className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
          <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Export
        </button>
      </div>
    </div>
  );
};

export default Toolbar; 
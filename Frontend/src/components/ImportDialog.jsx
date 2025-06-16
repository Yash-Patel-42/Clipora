import React, { useState } from 'react';

const ImportDialog = ({ 
  open, 
  onOpenChange,
  onImport 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleImport = () => {
    if (onImport && files.length > 0) {
      onImport(files);
      setFiles([]);
      onOpenChange(false);
    }
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15l-5-5L5 21" />
        </svg>
      );
    }
    if (file.type.startsWith('video/')) {
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    }
    if (file.type.startsWith('audio/')) {
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative bg-gray-800 border border-gray-700 rounded-lg w-full max-w-md p-6">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-white">Import Media</h2>
          <p className="text-gray-400 text-sm">
            Upload your video, audio, or image files
          </p>
        </div>
        
        <div 
          className={`flex flex-col justify-center items-center border-2 border-dashed rounded-md p-6 transition-all duration-200 ${
            dragActive ? "border-blue-500 bg-blue-500/5" : "border-gray-700"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <svg className="w-10 h-10 text-gray-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <p className="text-gray-400 text-sm mb-1">Drag and drop your files here</p>
          <p className="text-gray-400 text-xs mb-4">Support for videos, images, and audio</p>
          
          <label htmlFor="file-upload" className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer transition-colors">
            Select Files
            <input
              id="file-upload"
              type="file"
              multiple
              accept="video/*,image/*,audio/*"
              className="hidden"
              onChange={handleFileInput}
            />
          </label>
        </div>
        
        {files.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2 text-white">Selected Files</h4>
            <div className="max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-900 p-2 rounded mb-1">
                  <div className="flex items-center gap-2">
                    {getFileIcon(file)}
                    <span className="text-sm truncate max-w-[200px] text-gray-300">{file.name}</span>
                  </div>
                  <button 
                    onClick={() => removeFile(index)}
                    className="text-gray-500 hover:text-white"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-2 mt-4">
          <button 
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleImport}
            disabled={files.length === 0}
            className={`px-4 py-2 rounded-md transition-colors ${
              files.length === 0 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportDialog; 
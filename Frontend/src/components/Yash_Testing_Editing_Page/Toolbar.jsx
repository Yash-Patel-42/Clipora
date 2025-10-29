
import React from 'react';

const Toolbar = ({ onFileChange, fileInputRef }) => {
    return (
        <header className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
            <h1 className="text-xl font-bold text-blue-300">Clipora - AI Video Editor</h1>
            <div>
                <label htmlFor="media-upload" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition cursor-pointer">
                    Upload Media
                </label>
                <input
                    id="media-upload"
                    type="file"
                    accept="video/mp4,image/png,image/jpeg,image/gif"
                    onChange={onFileChange}
                    ref={fileInputRef}
                    className="hidden"
                />
            </div>
        </header>
    );
};

export default Toolbar;

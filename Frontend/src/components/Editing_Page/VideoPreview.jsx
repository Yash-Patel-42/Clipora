import React, { useState } from 'react';

const VideoPreview = ({ hasContent }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newValue) => {
    setVolume(newValue[0]);
    if (newValue[0] === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleProgressChange = (newValue) => {
    setProgress(newValue[0]);
  };

  return (
    <div className="flex-1 bg-gray-900 flex flex-col">
      <div className="flex-1 flex items-center justify-center overflow-hidden relative">
        {hasContent ? (
          <div className="w-full h-full bg-black relative">
            {/* Video would be here */}
            <div className="absolute bottom-4 left-4 text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
              00:00:00
            </div>
          </div>
        ) : (
          <div className="text-center p-8 animate-fade-in">
            <div className="animate-float">
              <svg 
                width="80" 
                height="80" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mx-auto mb-4 text-gray-500"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1 text-white">Drag material here to start creating</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Import videos, images, or audio files to start your project
            </p>
          </div>
        )}
      </div>

      <div className="p-2 bg-gray-800 border-t border-gray-700">
        <div className="mb-1">
          <input
            type="range"
            value={progress}
            max={100}
            step={1}
            onChange={(e) => handleProgressChange([parseInt(e.target.value)])}
            className="w-full cursor-pointer"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-150 text-gray-400 hover:text-white"
            >
              {isPlaying ? (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>
            <button
              className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-150 text-gray-400 hover:text-white"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="19 20 9 12 19 4 19 20" />
                <line x1="5" y1="19" x2="5" y2="5" />
              </svg>
            </button>
            <button
              className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-150 text-gray-400 hover:text-white"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="5 4 15 12 5 20 5 4" />
                <line x1="19" y1="5" x2="19" y2="19" />
              </svg>
            </button>
            <span className="text-xs text-gray-500 ml-2">
              00:00 / 00:00
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-150 text-gray-400 hover:text-white"
            >
              {isMuted || volume === 0 ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              )}
            </button>
            <input
              type="range"
              value={volume}
              max={100}
              step={1}
              onChange={(e) => handleVolumeChange([parseInt(e.target.value)])}
              className="w-24 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview; 
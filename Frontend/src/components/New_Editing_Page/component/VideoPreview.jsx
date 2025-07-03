import React, { useState, useRef, useEffect } from 'react';

const VideoPreview = ({ videoUrl, onTimeUpdate, seekTo }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (videoRef.current && isPlaying) {
      videoRef.current.play();
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isPlaying, videoUrl]);

  // Seek video when seekTo prop changes
  useEffect(() => {
    if (videoRef.current && typeof seekTo === 'number') {
      videoRef.current.currentTime = seekTo;
    }
  }, [seekTo]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
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
    if (videoRef.current) {
      const duration = videoRef.current.duration || 0;
      const seekTime = (newValue[0] / 100) * duration;
      videoRef.current.currentTime = seekTime;
      setProgress(newValue[0]);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration || 0;
      const current = videoRef.current.currentTime || 0;
      setProgress(duration ? (current / duration) * 100 : 0);
      if (onTimeUpdate) onTimeUpdate(current, duration);
    }
  };

  const handleVideoError = () => {
    setError(true);
  };

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col">
      <div className="w-full h-full flex items-center justify-center relative">
        {error ? (
          <div className="flex flex-col items-center justify-center w-full h-full text-red-400">
            <svg width="60" height="60" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4">
              <circle cx="30" cy="30" r="28" stroke="currentColor" strokeWidth="3" fill="none" />
              <line x1="20" y1="20" x2="40" y2="40" stroke="currentColor" strokeWidth="3" />
              <line x1="40" y1="20" x2="20" y2="40" stroke="currentColor" strokeWidth="3" />
            </svg>
            <span className="text-lg font-semibold">Failed to load video</span>
            <span className="text-sm text-gray-400 mt-2">The video could not be played. Please try re-importing or re-processing.</span>
          </div>
        ) : videoUrl ? (
          <div className="w-full h-full bg-black relative flex items-center justify-center">
            <video
              ref={videoRef}
              src={videoUrl}
              className="max-h-full max-w-full h-full w-full rounded shadow-lg bg-black object-contain"
              style={{ display: 'block', margin: '0 auto' }}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              controls={false}
              onError={handleVideoError}
            />
            {/* Controls overlay */}
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-2 z-10">
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
                    {/* Optionally show time here */}
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
    </div>
  );
};

export default VideoPreview; 
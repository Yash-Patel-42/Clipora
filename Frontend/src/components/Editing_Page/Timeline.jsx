import React from 'react';

const Timeline = ({ clips = [] }) => {
  const getClipColor = (type) => {
    switch (type) {
      case 'video': return 'bg-blue-500/20 border-blue-500/50';
      case 'audio': return 'bg-green-500/20 border-green-500/50';
      case 'image': return 'bg-purple-500/20 border-purple-500/50';
      case 'text': return 'bg-yellow-500/20 border-yellow-500/50';
      default: return 'bg-gray-500/20 border-gray-500/50';
    }
  };
  
  return (
    <div className="bg-gray-800 border-t border-gray-700 animate-fade-in">
      {/* Timeline tools */}
      <div className="flex items-center justify-between p-2 border-b border-gray-700">
        <div className="flex items-center space-x-1">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors" title="Split clip">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243zm0 0L9.121 9.121" />
            </svg>
          </button>
          
          <span className="text-xs text-gray-500 ml-2">
            00:00:00.000
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors" title="Zoom out">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
          
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors" title="Zoom in">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Timeline tracks */}
      <div className="h-64 overflow-y-auto timeline-scroll relative">
        {/* Time markers */}
        <div className="h-8 border-b border-gray-700 flex">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex-1 flex items-center border-r border-gray-700 last:border-r-0">
              <span className="text-xs text-gray-500 ml-1">
                {`${Math.floor(i / 60)}:${(i % 60).toString().padStart(2, '0')}`}
              </span>
            </div>
          ))}
        </div>
        
        {/* Video track */}
        <div className="timeline-track">
          <div className="h-full flex items-center pl-2 text-xs text-gray-500">
            Video
          </div>
          
          {clips.filter(clip => clip.type === 'video' || clip.type === 'image').map((clip) => (
            <div 
              key={clip.id}
              className={`timeline-clip ${getClipColor(clip.type)}`}
              style={{ 
                left: `${clip.start * 100}px`, 
                width: `${clip.duration * 100}px` 
              }}
            >
              <span className="text-xs truncate px-2">{clip.name}</span>
            </div>
          ))}
        </div>
        
        {/* Audio track */}
        <div className="timeline-track">
          <div className="h-full flex items-center pl-2 text-xs text-gray-500">
            Audio
          </div>
          
          {clips.filter(clip => clip.type === 'audio').map((clip) => (
            <div 
              key={clip.id}
              className={`timeline-clip ${getClipColor(clip.type)}`}
              style={{ 
                left: `${clip.start * 100}px`, 
                width: `${clip.duration * 100}px` 
              }}
            >
              <span className="text-xs truncate px-2">{clip.name}</span>
            </div>
          ))}
        </div>
        
        {/* Text track */}
        <div className="timeline-track">
          <div className="h-full flex items-center pl-2 text-xs text-gray-500">
            Text
          </div>
          
          {clips.filter(clip => clip.type === 'text').map((clip) => (
            <div 
              key={clip.id}
              className={`timeline-clip ${getClipColor(clip.type)}`}
              style={{ 
                left: `${clip.start * 100}px`, 
                width: `${clip.duration * 100}px` 
              }}
            >
              <span className="text-xs truncate px-2">{clip.name}</span>
            </div>
          ))}
        </div>
        
        {/* Timeline playhead */}
        <div 
          className="absolute top-0 bottom-0 w-px bg-blue-500 z-10"
          style={{ left: '100px' }}
        >
          <div className="w-3 h-3 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1" />
        </div>
      </div>
    </div>
  );
};

export default Timeline; 
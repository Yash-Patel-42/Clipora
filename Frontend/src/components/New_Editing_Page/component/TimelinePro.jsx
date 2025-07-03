import React, { useRef, useEffect } from 'react';
import interact from '@interactjs/interactjs';
import clsx from 'clsx';

const TRACKS = [
  { type: 'video', label: 'Video', color: 'bg-blue-500/20 border-blue-500/50' },
  { type: 'audio', label: 'Audio', color: 'bg-green-500/20 border-green-500/50' },
  { type: 'text',  label: 'Text',  color: 'bg-yellow-500/20 border-yellow-500/50' },
];

const BASE_PIXELS_PER_SECOND = 100;
const MIN_CLIP_WIDTH = 40;

const TimelinePro = ({ playhead, duration, onSeek, clips = [], zoom = 1 }) => {
  const timelineRef = useRef();
  const playheadRef = useRef();

  const PIXELS_PER_SECOND = BASE_PIXELS_PER_SECOND * zoom;

  // Playhead drag
  useEffect(() => {
    if (!playheadRef.current) return;
    interact(playheadRef.current)
      .draggable({
        axis: 'x',
        listeners: {
          move (event) {
            const timelineRect = timelineRef.current.getBoundingClientRect();
            let x = event.client.x - timelineRect.left;
            x = Math.max(0, Math.min(x, timelineRect.width));
            const newTime = (x / (PIXELS_PER_SECOND));
            if (onSeek) onSeek(newTime);
          },
        },
      });
    return () => {
      if (playheadRef.current) interact(playheadRef.current).unset();
    };
  }, [onSeek, PIXELS_PER_SECOND]);

  // Timeline length (seconds)
  const timelineLength = Math.max(
    ...clips.map((c) => c.start + (c.duration || 0)),
    duration || 10
  );

  return (
    <div className="w-full bg-gray-900 border-t border-gray-800 p-4">
      {/* Video thumbnail strip placeholder */}
      <div className="w-full h-12 bg-gray-700 rounded mb-2 flex items-center overflow-x-hidden relative">
        {/* Render video thumbnails as a strip for the first video clip */}
        {clips.filter(c => c.type === 'video' && c.thumbnails && c.thumbnails.length > 0).length > 0 ? (
          <div className="flex h-12 w-full absolute left-0 top-0" style={{ width: `${timelineLength * PIXELS_PER_SECOND}px` }}>
            {(() => {
              const videoClip = clips.find(c => c.type === 'video' && c.thumbnails && c.thumbnails.length > 0);
              if (!videoClip) return null;
              const thumbCount = videoClip.thumbnails.length;
              const thumbWidth = (videoClip.duration || 1) * PIXELS_PER_SECOND / thumbCount;
              return videoClip.thumbnails.map((thumb, i) => (
                <img
                  key={i}
                  src={thumb}
                  alt={`frame-${i}`}
                  className="h-12 object-cover"
                  style={{ width: `${thumbWidth}px`, minWidth: '2px' }}
                />
              ));
            })()}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">Video Thumbnails (import a video to see frames)</div>
        )}
      </div>
      <div className="flex items-center mb-2">
        <span className="text-white">Timeline</span>
        <span className="ml-6 text-gray-400">Playhead: {playhead.toFixed(2)}s</span>
      </div>
      <div
        ref={timelineRef}
        className="relative bg-gray-800 rounded-lg overflow-x-auto"
        style={{ height: 180, minWidth: 600, width: '100%' }}
        onClick={e => {
          // Only seek if not clicking on the playhead (avoid conflict with drag)
          if (e.target === timelineRef.current) {
            const rect = timelineRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const time = x / PIXELS_PER_SECOND;
            if (onSeek) onSeek(time);
          }
        }}
      >
        {/* Time markers */}
        <div className="absolute top-0 left-0 h-8 flex z-10" style={{ width: timelineLength * PIXELS_PER_SECOND }}>
          {Array.from({ length: Math.ceil(timelineLength) + 1 }).map((_, i) => (
            <div key={i} style={{ width: PIXELS_PER_SECOND }} className="border-r border-gray-700 last:border-r-0 relative h-full">
              <span className="absolute left-1 top-1 text-xs text-gray-400">{i}s</span>
            </div>
          ))}
        </div>
        {/* Tracks */}
        <div className="absolute left-0 top-8 bottom-0 flex flex-col" style={{ width: timelineLength * PIXELS_PER_SECOND }}>
          {TRACKS.map((track, idx) => (
            <div key={track.type} className="flex-1 flex items-center border-b border-gray-700 last:border-b-0 relative">
              <div className="w-16 text-xs text-gray-400 pl-2">{track.label}</div>
              <div className="flex-1 h-full relative">
                {clips.filter(c => c.type === track.type).length === 0 ? null :
                  clips.filter(c => c.type === track.type).map((clip) => (
                    <div
                      key={clip.id}
                      id={`clip-${clip.id}`}
                      className={clsx(
                        'absolute top-1 h-10 rounded shadow-md border cursor-move select-none flex items-center px-2',
                        track.color
                      )}
                      style={{
                        left: `${clip.start * PIXELS_PER_SECOND}px`,
                        width: `${Math.max(MIN_CLIP_WIDTH, (clip.duration || 1) * PIXELS_PER_SECOND)}px`,
                      }}
                    >
                      <span className="truncate text-xs text-white">{clip.name}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          ))}
        </div>
        {/* Playhead */}
        <div
          ref={playheadRef}
          className="absolute top-0 bottom-0 w-1 bg-blue-400 z-20 cursor-ew-resize"
          style={{ left: `${playhead * PIXELS_PER_SECOND}px` }}
        >
          <div className="w-4 h-4 bg-blue-400 rounded-full -translate-x-1/2 absolute top-0 left-1/2" />
        </div>
      </div>
    </div>
  );
};

export default TimelinePro; 
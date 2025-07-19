import React, { useRef, useEffect, useState } from 'react';
import interact from '@interactjs/interactjs';
import clsx from 'clsx';

const TRACKS = [
  { type: 'video', label: 'Video', color: 'bg-blue-500/20 border-blue-500/50' },
  { type: 'audio', label: 'Audio', color: 'bg-green-500/20 border-green-500/50' },
  { type: 'text',  label: 'Text',  color: 'bg-yellow-500/20 border-yellow-500/50' },
];

const BASE_PIXELS_PER_SECOND = 100;
const MIN_CLIP_WIDTH = 40;

const SNAP_THRESHOLD_SEC = 0.1; // 0.1s snap threshold

// Accept a new prop: tracks (object with arrays for each type and track)
const TimelinePro = ({ playhead, duration, onSeek, tracks = {}, zoom = 1, selectedClip, selectedClips = [], onSelectClip, onSelectClips, onClipUpdate, onGroupClipUpdate, transitions = [], onClipContextAction, onUndo, onRedo, canUndo, canRedo, onSplitAtPlayhead, onDuplicateClip, onDeleteClip }) => {
  const timelineRef = useRef();
  const playheadRef = useRef();
  const [tooltip, setTooltip] = useState(null); // { x, y, value }
  const [contextMenu, setContextMenu] = useState(null); // {x, y, clip}
  const PIXELS_PER_SECOND = BASE_PIXELS_PER_SECOND * zoom;

  // Helper: flatten all clips for drag/resize logic
  const allClips = Object.entries(tracks).flatMap(([type, trackArr]) =>
    trackArr.flatMap((track, trackIndex) =>
      track.map(clip => ({ ...clip, type, trackIndex }))
    )
  );

  // Helper: get transition between two clips
  const getTransition = (fromId, toId) => transitions.find(t => t.fromClipId === fromId && t.toClipId === toId);

  // Playhead drag (unchanged)
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

  // Drag-to-move/resize for all tracks and vertical drag to move between tracks
  useEffect(() => {
    allClips.forEach(clip => {
      const el = document.getElementById(`clip-${clip.id}`);
      if (!el) return;
      interact(el)
        .draggable({
          axis: 'xy',
          listeners: {
            move (event) {
              const timelineRect = timelineRef.current.getBoundingClientRect();
              let dx = event.dx;
              let dy = event.dy;
              let left = parseFloat(el.style.left || '0');
              let width = parseFloat(el.style.width || '0');
              let top = parseFloat(el.style.top || '0');
              let newLeft = left + dx;
              let newTop = top + dy;
              // Clamp to timeline
              newLeft = Math.max(0, Math.min(newLeft, timelineRect.width - width));
              // Convert to seconds
              let newStart = newLeft / PIXELS_PER_SECOND;
              let newEnd = (clip.end ? clip.end : (clip.start + (clip.duration || 1))) + (newStart - clip.start);
              // Snapping to playhead
              if (Math.abs(newStart - playhead) < SNAP_THRESHOLD_SEC) newStart = playhead;
              if (Math.abs(newEnd - playhead) < SNAP_THRESHOLD_SEC) newEnd = playhead;
              // Snapping to other clips in the same track
              allClips.filter(c => c.id !== clip.id && c.type === clip.type && c.trackIndex === clip.trackIndex).forEach(c => {
                const cStart = c.start;
                const cEnd = c.end ?? (c.start + (c.duration || 1));
                if (Math.abs(newStart - cEnd) < SNAP_THRESHOLD_SEC) newStart = cEnd;
                if (Math.abs(newEnd - cStart) < SNAP_THRESHOLD_SEC) newEnd = cStart;
              });
              // Determine new trackIndex by vertical position
              const trackHeight = 44; // px per track row
              let newTrackIndex = Math.round(newTop / trackHeight);
              newTrackIndex = Math.max(0, newTrackIndex);
              // Prevent overlap in new track
              const overlapping = allClips.some(c => c.id !== clip.id && c.type === clip.type && c.trackIndex === newTrackIndex &&
                ((newStart < (c.end ?? (c.start + (c.duration || 1)))) && (newEnd > c.start))
              );
              if (!overlapping) {
                if (selectedClips.length > 1 && selectedClips.includes(clip.id) && onGroupClipUpdate) {
                  const deltaStart = newStart - clip.start;
                  onGroupClipUpdate(clip, deltaStart);
                } else if (onClipUpdate) {
                  onClipUpdate({ ...clip, start: newStart, end: newEnd, trackIndex: newTrackIndex });
                }
                // Tooltip
                setTooltip({ x: newLeft + width/2, y: timelineRect.top - 30, value: `${newStart.toFixed(2)}s` });
              }
            },
            end () {
              setTooltip(null);
            }
          },
        })
        .resizable({
          edges: { left: true, right: true, top: false, bottom: false },
          listeners: {
            move (event) {
              let { x, width } = event.rect;
              const timelineRect = timelineRef.current.getBoundingClientRect();
              // Clamp
              x = Math.max(0, Math.min(x, timelineRect.width - width));
              width = Math.max(MIN_CLIP_WIDTH, Math.min(width, timelineRect.width - x));
              // Convert to seconds
              let newStart = x / PIXELS_PER_SECOND;
              let newEnd = (x + width) / PIXELS_PER_SECOND;
              // Snapping to playhead
              if (Math.abs(newStart - playhead) < SNAP_THRESHOLD_SEC) newStart = playhead;
              if (Math.abs(newEnd - playhead) < SNAP_THRESHOLD_SEC) newEnd = playhead;
              // Snapping to other clips in the same track
              allClips.filter(c => c.id !== clip.id && c.type === clip.type && c.trackIndex === clip.trackIndex).forEach(c => {
                const cStart = c.start;
                const cEnd = c.end ?? (c.start + (c.duration || 1));
                if (Math.abs(newStart - cEnd) < SNAP_THRESHOLD_SEC) newStart = cEnd;
                if (Math.abs(newEnd - cStart) < SNAP_THRESHOLD_SEC) newEnd = cStart;
              });
              // Prevent overlap
              const overlapping = allClips.some(c => c.id !== clip.id && c.type === clip.type && c.trackIndex === clip.trackIndex &&
                ((newStart < (c.end ?? (c.start + (c.duration || 1)))) && (newEnd > c.start))
              );
              if (!overlapping && newEnd > newStart) {
                if (onClipUpdate) onClipUpdate({ ...clip, start: newStart, end: newEnd });
                // Tooltip
                setTooltip({ x: x + width/2, y: timelineRect.top - 30, value: `${newStart.toFixed(2)}s - ${newEnd.toFixed(2)}s` });
              }
            },
            end () {
              setTooltip(null);
            }
          },
          modifiers: [
            interact.modifiers.restrictEdges({
              outer: 'parent',
            }),
            interact.modifiers.restrictSize({
              min: { width: MIN_CLIP_WIDTH, height: 0 },
            }),
          ],
        });
    });
    // Cleanup
    return () => {
      allClips.forEach(clip => {
        const el = document.getElementById(`clip-${clip.id}`);
        if (el) interact(el).unset();
      });
    };
  }, [allClips, PIXELS_PER_SECOND, onClipUpdate, playhead, selectedClips, onGroupClipUpdate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      if (e.key === 'Delete' && selectedClips.length > 0) {
        onDeleteClip && onDeleteClip(selectedClips);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedClips.length > 0) {
        e.preventDefault();
        onDuplicateClip && onDuplicateClip(selectedClips);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        onUndo && onUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        onRedo && onRedo();
      } else if (e.key.toLowerCase() === 's' && onSplitAtPlayhead) {
        e.preventDefault();
        onSplitAtPlayhead();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClips, onDeleteClip, onDuplicateClip, onUndo, onRedo, onSplitAtPlayhead]);

  // Timeline length (seconds)
  const timelineLength = Math.max(
    ...allClips.map((c) => c.start + (c.end ? (c.end - c.start) : (c.duration || 0))),
    duration || 10
  );

  // Render tracks for each type
  return (
    <div className="w-full bg-gray-900 border-t border-gray-800 p-4">
      {/* Video thumbnail strip placeholder (unchanged) */}
      <div className="w-full h-12 bg-gray-700 rounded mb-2 flex items-center overflow-x-hidden relative">
        {/* Render video thumbnails as a strip for the first video clip */}
        {allClips.filter(c => c.type === 'video' && c.thumbnails && c.thumbnails.length > 0).length > 0 ? (
          <div className="flex h-12 w-full absolute left-0 top-0" style={{ width: `${timelineLength * PIXELS_PER_SECOND}px` }}>
            {(() => {
              const videoClip = allClips.find(c => c.type === 'video' && c.thumbnails && c.thumbnails.length > 0);
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
        {/* Tooltip for drag/resize */}
        {tooltip && (
          <div
            className="absolute z-50 px-2 py-1 bg-black text-white text-xs rounded shadow-lg pointer-events-none"
            style={{ left: tooltip.x, top: 0, transform: 'translate(-50%, -100%)' }}
          >
            {tooltip.value}
          </div>
        )}
        {/* Time markers */}
        <div className="absolute top-0 left-0 h-8 flex z-10" style={{ width: timelineLength * PIXELS_PER_SECOND }}>
          {Array.from({ length: Math.ceil(timelineLength) + 1 }).map((_, i) => (
            <div key={i} style={{ width: PIXELS_PER_SECOND }} className="border-r border-gray-700 last:border-r-0 relative h-full">
              <span className="absolute left-1 top-1 text-xs text-gray-400">{i}s</span>
            </div>
          ))}
        </div>
        {/* Tracks for each type and track index */}
        <div className="absolute left-0 top-8 bottom-0 flex flex-col" style={{ width: timelineLength * PIXELS_PER_SECOND }}>
          {Object.entries(tracks).map(([type, trackArr], typeIdx) => (
            trackArr.map((track, trackIndex) => (
              <div key={type + '-' + trackIndex} className="flex-1 flex items-center border-b border-gray-700 last:border-b-0 relative" style={{ height: 44 }}>
                <div className="w-16 text-xs text-gray-400 pl-2">{TRACKS.find(t => t.type === type)?.label || type} {trackArr.length > 1 ? trackIndex + 1 : ''}</div>
                <div className="flex-1 h-full relative">
                  {track.length === 0 ? null :
                    track.map((clip, i, arr) => {
                      // Visual split: if this is not the first clip and its start matches the previous clip's end, show a split marker
                      const isSelected = selectedClip && selectedClip.id === clip.id;
                      const prevClip = arr[i - 1];
                      const showSplit = prevClip && prevClip.end === clip.start;
                      // Transition between prevClip and this clip
                      const transition = prevClip ? getTransition(prevClip.id, clip.id) : null;
                      return (
                        <React.Fragment key={clip.id}>
                          {showSplit && (
                            <div
                              className="absolute top-0 bottom-0 w-1 bg-pink-400 z-30 rounded-full opacity-70"
                              style={{ left: `${clip.start * PIXELS_PER_SECOND - 2}px` }}
                            />
                          )}
                          {/* Transition marker */}
                          {transition && (
                            <div
                              className={`absolute top-0 bottom-0 w-4 flex flex-col items-center justify-center z-40 cursor-pointer group ${transition.type === 'fade' ? 'bg-gradient-to-b from-gray-400 to-gray-900' : transition.type === 'slide' ? 'bg-gradient-to-b from-blue-400 to-blue-900' : 'bg-gray-500'}`}
                              style={{ left: `${clip.start * PIXELS_PER_SECOND - 10}px` }}
                              title={transition.type.charAt(0).toUpperCase() + transition.type.slice(1) + ' Transition'}
                            >
                              <span className="w-3 h-3 rounded-full bg-white opacity-80 group-hover:opacity-100 border border-gray-700" />
                              <span className="absolute left-5 top-1/2 -translate-y-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                                {transition.type.charAt(0).toUpperCase() + transition.type.slice(1)}
                              </span>
                            </div>
                          )}
                          <div
                            id={`clip-${clip.id}`}
                            className={clsx(
                              'absolute top-1 h-10 rounded shadow-md border cursor-pointer select-none flex items-center px-2 transition-all',
                              TRACKS.find(t => t.type === type)?.color,
                              isSelected ? 'ring-4 ring-blue-400 border-blue-500 z-20' : selectedClips.includes(clip.id) ? 'ring-2 ring-blue-300 border-blue-400 z-10' : 'z-10'
                            )}
                            style={{
                              left: `${clip.start * PIXELS_PER_SECOND}px`,
                              width: `${Math.max(MIN_CLIP_WIDTH, (clip.end ? (clip.end - clip.start) : (clip.duration || 1)) * PIXELS_PER_SECOND)}px`,
                              background: isSelected ? 'rgba(59,130,246,0.2)' : selectedClips.includes(clip.id) ? 'rgba(59,130,246,0.08)' : undefined,
                              top: 0,
                            }}
                            onClick={e => {
                              e.stopPropagation();
                              if (onSelectClip) onSelectClip(clip, e);
                            }}
                            onContextMenu={e => {
                              e.preventDefault();
                              setContextMenu({ x: e.clientX, y: e.clientY, clip });
                            }}
                          >
                            {/* Resize handles for all tracks */}
                            <>
                              <div className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize z-40" style={{ background: 'rgba(0,0,0,0.1)' }} />
                              <div className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize z-40" style={{ background: 'rgba(0,0,0,0.1)' }} />
                            </>
                            <span className="truncate text-xs text-white">{clip.name}</span>
                            {clip.type === 'audio' && (
                              <div className="absolute left-2 right-2 top-2 bottom-2 flex items-center pointer-events-none">
                                {clip.waveform && clip.waveform.length > 0 ? (
                                  <svg width="100%" height="24" viewBox={`0 0 ${clip.waveform.length} 24`} preserveAspectRatio="none" className="h-6 w-full">
                                    {clip.waveform.map((v, i) => (
                                      <rect key={i} x={i} y={12 - v * 12} width="1" height={v * 24} fill="#4ade80" />
                                    ))}
                                  </svg>
                                ) : (
                                  <div className="w-full h-6 bg-green-900/30 rounded" />
                                )}
                              </div>
                            )}
                          </div>
                        </React.Fragment>
                      );
                    })
                  }
                </div>
              </div>
            ))
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
      {/* Render context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white border border-gray-400 rounded shadow-lg text-sm"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={() => setContextMenu(null)}
        >
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-200"
            onClick={() => { onClipContextAction && onClipContextAction('delete', contextMenu.clip); setContextMenu(null); }}
          >Delete</button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-200"
            onClick={() => { onClipContextAction && onClipContextAction('duplicate', contextMenu.clip); setContextMenu(null); }}
          >Duplicate</button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-200"
            onClick={() => { onClipContextAction && onClipContextAction('properties', contextMenu.clip); setContextMenu(null); }}
          >Properties</button>
        </div>
      )}
    </div>
  );
};

export default TimelinePro; 
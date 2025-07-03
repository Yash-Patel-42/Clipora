import React, { useState, useRef } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import Sidebar from '../components/Editing_Page/Sidebar';
import Toolbar from '../components/New_Editing_Page/component/Toolbar';
import VideoPreview from '../components/New_Editing_Page/component/VideoPreview';
import ImportDialog from '../components/New_Editing_Page/component/ImportDialog';
import { processTimeline } from '../components/New_Editing_Page/logic/ffmpegWorker';
import TimelinePro from '../components/New_Editing_Page/component/TimelinePro';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const NewEditingPage = () => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [clips, setClips] = useState([]); // {id, file, url, start, end, duration}
  const [selectedClip, setSelectedClip] = useState(null);
  const [outputUrl, setOutputUrl] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [seekTo, setSeekTo] = useState(null);
  const [zoom, setZoom] = useState(1);
  const videoExtractorRef = useRef();

  // Helper: Extract thumbnails from a video file
  const extractThumbnails = (file, duration, count = 20) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.src = URL.createObjectURL(file);
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.currentTime = 0;
      const canvas = document.createElement('canvas');
      const thumbnails = [];
      let loaded = false;
      video.addEventListener('loadeddata', async () => {
        if (loaded) return;
        loaded = true;
        const interval = duration / count;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        for (let i = 0; i < count; i++) {
          video.currentTime = Math.min(duration, i * interval);
          await new Promise(res => {
            video.onseeked = () => {
              canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
              thumbnails.push(canvas.toDataURL('image/jpeg', 0.6));
              res();
            };
          });
        }
        resolve(thumbnails);
      });
    });
  };

  // Import handler
  const handleImport = async (files) => {
    const newClips = await Promise.all(files.map(async (file, idx) => {
      const url = URL.createObjectURL(file);
      // Get video duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = url;
      await new Promise(res => { video.onloadedmetadata = res; });
      const duration = video.duration;
      // Extract thumbnails
      const thumbnails = await extractThumbnails(file, duration, 20);
      return {
        id: `clip-${Date.now()}-${idx}`,
        file,
        url,
        name: file.name,
        start: 0,
        end: null, // null means till end
        duration,
        thumbnails,
        type: 'video',
      };
    }));
    setClips(prev => [...prev, ...newClips]);
    // Automatically select the first imported clip for preview
    if (newClips.length > 0) {
      setSelectedClip(newClips[0]);
    }
  };

  // Remove timeline UI: just use the clips array as the timeline
  const handleExport = async () => {
    setProcessing(true);
    // Use the clips array as the timeline
    const timeline = clips.map((clip, i) => ({
      id: `timeline-${clip.id}`,
      clipId: clip.id,
      start: clip.start || 0,
      end: clip.end,
    }));
    const blob = await processTimeline(timeline, clips);
    setOutputUrl(URL.createObjectURL(blob));
    setProcessing(false);
  };

  // Handler for sidebar tool clicks
  const handleToolClick = async (tool) => {
    if (!selectedClip) {
      alert('Please import and select a video first.');
      return;
    }
    if (tool === 'bg_removal' || tool === 'noise_reduction' || tool === 'caption_generator') {
      setProcessing(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedClip.file);
        let endpoint = '';
        if (tool === 'bg_removal') endpoint = 'bg_remover';
        if (tool === 'noise_reduction') endpoint = 'noise_reduction';
        if (tool === 'caption_generator') endpoint = 'caption_generator';
        const response = await fetch(`${BACKEND_URL}/process/${endpoint}`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error('Processing failed');
        const blob = await response.blob();
        console.log('Processed blob:', blob);
        if (!blob || blob.size === 0 || !blob.type.startsWith('video/')) {
          alert('Processing failed: Received invalid or empty video file.');
          return;
        }
        setOutputUrl(null);
        const url = URL.createObjectURL(blob);
        // Re-extract thumbnails for the new video
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = url;
        await new Promise(res => { video.onloadedmetadata = res; });
        const duration = video.duration;
        const thumbnails = await extractThumbnails(blob, duration, 20);
        const processedClip = {
          id: `clip-processed-${Date.now()}`,
          file: blob,
          url,
          name: 'Processed Video',
          start: 0,
          end: null,
          duration,
          thumbnails,
          type: 'video',
        };
        setClips([processedClip]);
        setSelectedClip(processedClip);
        setOutputUrl(url);
      } catch (err) {
        alert('Processing failed.');
      } finally {
        setProcessing(false);
      }
    }
    // TODO: Add other tool integrations here
  };

  // Sync playhead from video
  const handleVideoTimeUpdate = (current, duration) => {
    setPlayhead(current);
    setVideoDuration(duration);
  };

  // Sync playhead from timeline
  const handleTimelineSeek = (time) => {
    setSeekTo(time);
    setPlayhead(time);
  };

  return (
    <div className="h-screen bg-gray-900">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={20} minSize={15} maxSize={30}>
          <Sidebar onToolClick={handleToolClick} processing={processing} />
        </Panel>
        <PanelResizeHandle className="bg-gray-700 w-1 cursor-col-resize" />
        <Panel minSize={40}>
          <div className="flex flex-col h-full w-full">
            <Toolbar onImport={() => setImportDialogOpen(true)} onExport={handleExport} />
            {/* Zoom controls */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
              <button onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} className="px-2 py-1 bg-gray-700 rounded text-white">-</button>
              <span className="text-white">Zoom: {zoom.toFixed(2)}x</span>
              <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} className="px-2 py-1 bg-gray-700 rounded text-white">+</button>
            </div>
            <PanelGroup direction="vertical">
              <Panel defaultSize={40} minSize={20} maxSize={60}>
                <VideoPreview
                  videoUrl={outputUrl || (selectedClip && selectedClip.url)}
                  onTimeUpdate={handleVideoTimeUpdate}
                  seekTo={seekTo}
                />
              </Panel>
              <PanelResizeHandle className="bg-gray-700 h-1 cursor-row-resize" />
              <Panel minSize={20}>
                <TimelinePro
                  playhead={playhead}
                  duration={videoDuration}
                  onSeek={handleTimelineSeek}
                  clips={clips}
                  zoom={zoom}
                />
              </Panel>
            </PanelGroup>
            <ImportDialog
              open={importDialogOpen}
              onOpenChange={setImportDialogOpen}
              onImport={handleImport}
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default NewEditingPage;
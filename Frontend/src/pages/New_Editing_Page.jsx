import React, { useState, useRef } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import Sidebar from '../components/New_Editing_Page/component/Sidebar';
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
  const [trimModalOpen, setTrimModalOpen] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [splitTime, setSplitTime] = useState(0);
  const [textModalOpen, setTextModalOpen] = useState(false);
  const [overlayText, setOverlayText] = useState("");
  const [textStart, setTextStart] = useState(0);
  const [textEnd, setTextEnd] = useState(0);
  const [fontSize, setFontSize] = useState(28);
  const [fontColor, setFontColor] = useState("#ffffff");
  const [textAlignment, setTextAlignment] = useState(2); // 2 = bottom center
  const [aiMusicModalOpen, setAiMusicModalOpen] = useState(false);
  const [videoMood, setVideoMood] = useState(null);
  const [musicLibrary, setMusicLibrary] = useState({});
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [aiMusicGenerating, setAiMusicGenerating] = useState(false);

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
    
    if (tool === 'bg_removal' || tool === 'noise_reduction' || tool === 'caption_generator' || tool === 'export' || tool === 'transition' || tool.startsWith('export_') || tool.startsWith('transition_')) {
      setProcessing(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedClip.file);
        
        let endpoint = '';
        let additionalParams = {};
        
        if (tool === 'bg_removal') endpoint = 'bg_remover';
        if (tool === 'noise_reduction') endpoint = 'noise_reduction';
        if (tool === 'caption_generator') endpoint = 'caption_generator';
        if (tool === 'export') {
          endpoint = 'export';
          additionalParams.resolution = '1080p'; // Default to 1080p
        }
        if (tool.startsWith('export_')) {
          endpoint = 'export';
          const resolution = tool.replace('export_', '');
          additionalParams.resolution = resolution;
        }
        if (tool === 'transition') {
          endpoint = 'transition';
          additionalParams.transition_type = 'fade'; // Default to fade
          additionalParams.transition_duration = 1.0;
        }
        if (tool.startsWith('transition_')) {
          endpoint = 'transition';
          const transitionType = tool.replace('transition_', '');
          additionalParams.transition_type = transitionType;
          additionalParams.transition_duration = 1.0;
        }
        
        // Add additional parameters to form data
        Object.entries(additionalParams).forEach(([key, value]) => {
          formData.append(key, value);
        });
        
        const response = await fetch(`${BACKEND_URL}/process/${endpoint}`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Processing failed: ${errorText}`);
        }
        
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
          name: `${tool.charAt(0).toUpperCase() + tool.slice(1)} Video`,
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
        console.error('Processing error:', err);
        alert(`Processing failed: ${err.message}`);
      } finally {
        setProcessing(false);
      }
    }
    if (tool === 'smart_trim') {
      setProcessing(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedClip.file);
        const response = await fetch(`${BACKEND_URL}/sniply_smart_trim_silence_part/auto_trim`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Processing failed: ${errorText}`);
        }
        const blob = await response.blob();
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
          name: 'Smart Trimmed Video',
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
        console.error('Processing error:', err);
        alert(`Processing failed: ${err.message}`);
      } finally {
        setProcessing(false);
      }
    }
    if (tool === 'color_grading') {
      setProcessing(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedClip.file);
        const response = await fetch(`${BACKEND_URL}/process/color_grading`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Processing failed: ${errorText}`);
        }
        const blob = await response.blob();
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
          name: 'Color Graded Video',
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
        console.error('Processing error:', err);
        alert(`Processing failed: ${err.message}`);
      } finally {
        setProcessing(false);
      }
    }
    if (tool === 'trim') {
      if (!selectedClip) {
        alert('Please select a video to trim.');
        return;
      }
      if (!selectedClip.duration || selectedClip.duration <= 0) {
        alert('Video metadata is still loading. Please wait until the video is ready.');
        return;
      }
      setTrimStart(0);
      setTrimEnd(selectedClip.duration);
      setTrimModalOpen(true);
      return;
    }
    if (tool === 'split') {
      if (!selectedClip) {
        alert('Please select a video to split.');
        return;
      }
      if (!selectedClip.duration || selectedClip.duration <= 0) {
        alert('Video metadata is still loading. Please wait until the video is ready.');
        return;
      }
      setSplitTime(Math.floor(selectedClip.duration / 2)); // default to middle
      setSplitModalOpen(true);
      return;
    }
    if (tool === 'text_overlay') {
      handleTextOverlay();
      return;
    }
    if (tool === 'ai_music') {
      handleAiMusic();
      return;
    }
    // TODO: Add other tool integrations here
  };

  // Handler to open the trim modal
  const handleTrim = () => {
    if (!selectedClip) {
      alert('Please select a video to trim.');
      return;
    }
    if (!selectedClip.duration || selectedClip.duration <= 0) {
      alert('Video metadata is still loading. Please wait until the video is ready.');
      return;
    }
    setTrimStart(0);
    setTrimEnd(selectedClip.duration);
    setTrimModalOpen(true);
  };

  // Handler to confirm trim
  const handleTrimConfirm = async () => {
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedClip.file);
      formData.append('start', trimStart);
      formData.append('end', trimEnd);
      const response = await fetch(`${BACKEND_URL}/manual_trim`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error(await response.text());
      const blob = await response.blob();
      if (!blob || blob.size === 0 || !blob.type.startsWith('video/')) {
        alert('Processing failed: Received invalid or empty video file.');
        return;
      }
      setOutputUrl(null);
      const url = URL.createObjectURL(blob);
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
        name: 'Trimmed Video',
        start: 0,
        end: null,
        duration,
        thumbnails,
        type: 'video',
      };
      setClips([processedClip]);
      setSelectedClip(processedClip);
      setOutputUrl(url);
      setTrimModalOpen(false);
    } catch (err) {
      alert(`Trim failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Handler to open the split modal
  const handleSplit = () => {
    if (!selectedClip) {
      alert('Please select a video to split.');
      return;
    }
    if (!selectedClip.duration || selectedClip.duration <= 0) {
      alert('Video metadata is still loading. Please wait until the video is ready.');
      return;
    }
    setSplitTime(Math.floor(selectedClip.duration / 2)); // default to middle
    setSplitModalOpen(true);
  };

  // Handler to confirm split
  const handleSplitConfirm = async () => {
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedClip.file);
      formData.append('split_time', splitTime);
      const response = await fetch(`${BACKEND_URL}/manual_split`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error(await response.text());
      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        alert('Processing failed: Received invalid or empty zip file.');
        return;
      }
      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'split_videos.zip';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      setSplitModalOpen(false);
    } catch (err) {
      alert(`Split failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Handler to open the text modal
  const handleTextOverlay = () => {
    if (!selectedClip) {
      alert('Please select a video to add text overlay.');
      return;
    }
    if (!selectedClip.duration || selectedClip.duration <= 0) {
      alert('Video metadata is still loading. Please wait until the video is ready.');
      return;
    }
    setOverlayText("");
    setTextStart(0);
    setTextEnd(selectedClip.duration);
    setFontSize(28);
    setFontColor("#ffffff");
    setTextAlignment(2);
    setTextModalOpen(true);
  };

  // Handler to confirm text overlay
  const handleTextOverlayConfirm = async () => {
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedClip.file);
      formData.append('text', overlayText);
      formData.append('start_time', textStart);
      formData.append('end_time', textEnd);
      formData.append('fontname', 'Arial');
      formData.append('fontsize', fontSize);
      // Convert hex color to r,g,b
      const hex = fontColor.replace('#', '');
      const r = parseInt(hex.substring(0,2), 16);
      const g = parseInt(hex.substring(2,4), 16);
      const b = parseInt(hex.substring(4,6), 16);
      formData.append('color_r', r);
      formData.append('color_g', g);
      formData.append('color_b', b);
      formData.append('color_a', 0);
      formData.append('alignment', textAlignment);
      const response = await fetch(`${BACKEND_URL}/manual_text_apply`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error(await response.text());
      const blob = await response.blob();
      if (!blob || blob.size === 0 || !blob.type.startsWith('video/')) {
        alert('Processing failed: Received invalid or empty video file.');
        return;
      }
      setOutputUrl(null);
      const url = URL.createObjectURL(blob);
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
        name: 'Text Overlay Video',
        start: 0,
        end: null,
        duration,
        thumbnails,
        type: 'video',
      };
      setClips([processedClip]);
      setSelectedClip(processedClip);
      setOutputUrl(url);
      setTextModalOpen(false);
    } catch (err) {
      alert(`Text overlay failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Handler to open the AI Music modal
  const handleAiMusic = async () => {
    if (!selectedClip) {
      alert('Please select a video to add music.');
      return;
    }
    setAiMusicModalOpen(true);
    
    // Analyze video mood
    try {
      const formData = new FormData();
      formData.append('file', selectedClip.file);
      const response = await fetch(`${BACKEND_URL}/analyze_video_mood`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const moodData = await response.json();
        setVideoMood(moodData);
        
        // Load music library for the detected mood
        const musicResponse = await fetch(`${BACKEND_URL}/music_library/${moodData.mood}`);
        if (musicResponse.ok) {
          const musicData = await musicResponse.json();
          setMusicLibrary(prev => ({ ...prev, [moodData.mood]: musicData.tracks }));
        }
      }
    } catch (err) {
      console.error('Mood analysis failed:', err);
    }
  };

  // Handler to apply selected music
  const handleApplyMusic = async () => {
    if (!selectedMusic) {
      alert('Please select a music track.');
      return;
    }
    
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedClip.file);
      formData.append('music_id', selectedMusic.id);
      formData.append('volume', musicVolume);
      formData.append('fade_in', 2.0);
      formData.append('fade_out', 2.0);
      
      const response = await fetch(`${BACKEND_URL}/apply_music`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error(await response.text());
      const blob = await response.blob();
      
      if (!blob || blob.size === 0 || !blob.type.startsWith('video/')) {
        alert('Processing failed: Received invalid or empty video file.');
        return;
      }
      
      setOutputUrl(null);
      const url = URL.createObjectURL(blob);
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
        name: 'Music Added Video',
        start: 0,
        end: null,
        duration,
        thumbnails,
        type: 'video',
      };
      setClips([processedClip]);
      setSelectedClip(processedClip);
      setOutputUrl(url);
      setAiMusicModalOpen(false);
    } catch (err) {
      alert(`Music application failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Handler to generate AI music
  const handleGenerateAiMusic = async () => {
    if (!videoMood) {
      alert('Please analyze video mood first.');
      return;
    }
    
    setAiMusicGenerating(true);
    try {
      const formData = new FormData();
      formData.append('mood', videoMood.mood);
      formData.append('duration', videoMood.duration);
      formData.append('style', 'modern');
      
      const response = await fetch(`${BACKEND_URL}/generate_ai_music`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error(await response.text());
      const aiMusicData = await response.json();
      
      // For demo, create a placeholder music track
      const aiTrack = {
        id: aiMusicData.music_id,
        name: `AI Generated ${videoMood.mood} Music`,
        duration: aiMusicData.duration,
        isAi: true
      };
      
      setSelectedMusic(aiTrack);
      alert('AI music generated! You can now apply it to your video.');
    } catch (err) {
      alert(`AI music generation failed: ${err.message}`);
    } finally {
      setAiMusicGenerating(false);
    }
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
            <Toolbar onImport={() => setImportDialogOpen(true)} onExport={handleExport} onTrim={handleTrim} onSplit={handleSplit} onTextOverlay={handleTextOverlay} />
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
      {/* Trim Modal */}
      {trimModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-2">Trim Video</h2>
            <div className="mb-2 text-gray-700 text-sm">Video duration: {selectedClip?.duration ? selectedClip.duration.toFixed(2) : 'Loading...'} seconds</div>
            <label className="block mb-2">Start Time (seconds):
              <input type="number" min="0" max={selectedClip?.duration || 0} value={trimStart} onChange={e => {
                const value = Number(e.target.value);
                setTrimStart(value);
                // If end is less than or equal to new start, auto-adjust end
                if (trimEnd <= value) setTrimEnd(Math.min((selectedClip?.duration || 0), value + 0.1));
              }} className="ml-2 border rounded px-2 py-1" />
            </label>
            <label className="block mb-4">End Time (seconds):
              <input type="number" min={trimStart + 0.1} max={selectedClip?.duration || 0} value={trimEnd} onChange={e => setTrimEnd(Number(e.target.value))} className="ml-2 border rounded px-2 py-1" />
            </label>
            {(trimEnd <= trimStart) && (
              <div className="text-red-600 mb-2">End time must be greater than start time.</div>
            )}
            <div className="mt-4 flex gap-2">
              <button onClick={handleTrimConfirm} className={`bg-blue-600 text-white px-4 py-2 rounded ${(trimEnd <= trimStart || !selectedClip?.duration || selectedClip.duration <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={trimEnd <= trimStart || !selectedClip?.duration || selectedClip.duration <= 0}>Trim</button>
              <button onClick={() => setTrimModalOpen(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Split Modal */}
      {splitModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-2">Split Video</h2>
            <div className="mb-2 text-gray-700 text-sm">Video duration: {selectedClip?.duration ? selectedClip.duration.toFixed(2) : 'Loading...'} seconds</div>
            <label className="block mb-4">Split Time (seconds):
              <input type="number" min="1" max={selectedClip?.duration - 1 || 1} value={splitTime} onChange={e => setSplitTime(Number(e.target.value))} className="ml-2 border rounded px-2 py-1" />
            </label>
            {(splitTime <= 0 || splitTime >= selectedClip?.duration) && (
              <div className="text-red-600 mb-2">Split time must be between 1 and video duration - 1.</div>
            )}
            <div className="mt-4 flex gap-2">
              <button onClick={handleSplitConfirm} className={`bg-blue-600 text-white px-4 py-2 rounded ${(splitTime <= 0 || splitTime >= selectedClip?.duration) ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={splitTime <= 0 || splitTime >= selectedClip?.duration}>Split</button>
              <button onClick={() => setSplitModalOpen(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Text Overlay Modal */}
      {textModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-2">Add Text Overlay</h2>
            <div className="mb-2 text-gray-700 text-sm">Video duration: {selectedClip?.duration ? selectedClip.duration.toFixed(2) : 'Loading...'} seconds</div>
            <label className="block mb-2">Text:
              <input type="text" value={overlayText} onChange={e => setOverlayText(e.target.value)} className="ml-2 border rounded px-2 py-1 w-full" />
            </label>
            <label className="block mb-2">Start Time (seconds):
              <input type="number" min="0" max={selectedClip?.duration || 0} value={textStart} onChange={e => setTextStart(Number(e.target.value))} className="ml-2 border rounded px-2 py-1" />
            </label>
            <label className="block mb-2">End Time (seconds):
              <input type="number" min={textStart + 0.1} max={selectedClip?.duration || 0} value={textEnd} onChange={e => setTextEnd(Number(e.target.value))} className="ml-2 border rounded px-2 py-1" />
            </label>
            <label className="block mb-2">Font Size:
              <input type="number" min="8" max="128" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="ml-2 border rounded px-2 py-1 w-20" />
            </label>
            <label className="block mb-2">Font Color:
              <input type="color" value={fontColor} onChange={e => setFontColor(e.target.value)} className="ml-2 border rounded px-2 py-1 w-10 h-8 align-middle" />
            </label>
            <label className="block mb-4">Alignment:
              <select value={textAlignment} onChange={e => setTextAlignment(Number(e.target.value))} className="ml-2 border rounded px-2 py-1">
                <option value={2}>Bottom Center</option>
                <option value={8}>Top Center</option>
                <option value={5}>Middle Center</option>
                <option value={1}>Bottom Left</option>
                <option value={3}>Bottom Right</option>
                <option value={4}>Middle Left</option>
                <option value={6}>Middle Right</option>
                <option value={7}>Top Left</option>
                <option value={9}>Top Right</option>
              </select>
            </label>
            {(overlayText.trim() === '' || textEnd <= textStart) && (
              <div className="text-red-600 mb-2">Text is required and end time must be greater than start time.</div>
            )}
            <div className="mt-4 flex gap-2">
              <button onClick={handleTextOverlayConfirm} className={`bg-blue-600 text-white px-4 py-2 rounded ${(overlayText.trim() === '' || textEnd <= textStart) ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={overlayText.trim() === '' || textEnd <= textStart}>Apply</button>
              <button onClick={() => setTextModalOpen(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* AI Music Modal */}
      {aiMusicModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[600px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">AI Music</h2>
            
            {/* Video Mood Analysis */}
            {videoMood && (
              <div className="mb-4 p-3 bg-blue-50 rounded">
                <h3 className="font-semibold mb-2">Video Analysis</h3>
                <p>Detected Mood: <span className="font-bold text-blue-600">{videoMood.mood}</span></p>
                <p>Confidence: <span className="font-bold">{videoMood.confidence * 100}%</span></p>
                <p>Duration: <span className="font-bold">{videoMood.duration}s</span></p>
              </div>
            )}
            
            {/* Music Options */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Choose Music Option:</h3>
              
              {/* AI Music Generation */}
              <div className="mb-3 p-3 border rounded">
                <h4 className="font-medium mb-2">🎵 Generate AI Music</h4>
                <p className="text-sm text-gray-600 mb-2">Create custom music based on your video's mood</p>
                <button 
                  onClick={handleGenerateAiMusic}
                  disabled={aiMusicGenerating || !videoMood}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                >
                  {aiMusicGenerating ? 'Generating...' : 'Generate AI Music'}
                </button>
              </div>
              
              {/* Music Library */}
              {videoMood && musicLibrary[videoMood.mood] && (
                <div className="mb-3 p-3 border rounded">
                  <h4 className="font-medium mb-2">📚 Music Library</h4>
                  <p className="text-sm text-gray-600 mb-2">Choose from curated tracks for {videoMood.mood} mood</p>
                  <div className="space-y-2">
                    {musicLibrary[videoMood.mood].map((track) => (
                      <div 
                        key={track.id}
                        className={`p-2 border rounded cursor-pointer ${selectedMusic?.id === track.id ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'}`}
                        onClick={() => setSelectedMusic(track)}
                      >
                        <div className="font-medium">{track.name}</div>
                        <div className="text-sm text-gray-600">{track.duration}s</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Music Settings */}
            {selectedMusic && (
              <div className="mb-4 p-3 border rounded">
                <h3 className="font-semibold mb-2">Music Settings</h3>
                <div className="mb-2">
                  <label className="block text-sm">Selected: <span className="font-medium">{selectedMusic.name}</span></label>
                  {selectedMusic.isAi && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded ml-2">AI Generated</span>}
                </div>
                <label className="block text-sm mb-1">Music Volume: {Math.round(musicVolume * 100)}%</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={musicVolume} 
                  onChange={(e) => setMusicVolume(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={handleApplyMusic} 
                disabled={!selectedMusic}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Apply Music
              </button>
              <button 
                onClick={() => setAiMusicModalOpen(false)} 
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewEditingPage;
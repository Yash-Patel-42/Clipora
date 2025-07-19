import React, { useState, useRef } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import Sidebar from '../components/New_Editing_Page/component/Sidebar';
import Toolbar from '../components/New_Editing_Page/component/Toolbar';
import VideoPreview from '../components/New_Editing_Page/component/VideoPreview';
import ImportDialog from '../components/New_Editing_Page/component/ImportDialog';
import { processTimeline } from '../components/New_Editing_Page/logic/ffmpegWorker';
import TimelinePro from '../components/New_Editing_Page/component/TimelinePro';
import KeyframePanel from '../components/New_Editing_Page/component/KeyframePanel';
import { extractThumbnails } from '../components/New_Editing_Page/logic/utils';
import { EXPORT_PRESETS } from '../components/New_Editing_Page/constants/exportPresets';
import { TRANSITIONS } from '../components/New_Editing_Page/constants/transitions';
import { BACKEND_URL } from '../components/New_Editing_Page/constants/backend';
import TrimModal from '../components/New_Editing_Page/component/Modals/TrimModal';
import SplitModal from '../components/New_Editing_Page/component/Modals/SplitModal';
import TextOverlayModal from '../components/New_Editing_Page/component/Modals/TextOverlayModal';
import AiMusicModal from '../components/New_Editing_Page/component/Modals/AiMusicModal';
import ExportModal from '../components/New_Editing_Page/component/Modals/ExportModal';
import ExportProgressModal from '../components/New_Editing_Page/component/Modals/ExportProgressModal';
import AssetSidebar from '../components/New_Editing_Page/component/AssetSidebar';
import TextPropertiesPanel from '../components/New_Editing_Page/component/TextPropertiesPanel';

const NewEditingPage = () => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  // Refactor clips state to support multiple tracks per type
  const [tracks, setTracks] = useState({
    video: [[]], // array of video tracks, each is an array of clips
    audio: [[]],
    text: [[]],
    image: [[]],
  });
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
  // Add asset library state
  const [assets, setAssets] = useState([]); // {id, file, url, name, type, duration, thumbnails}

  // Undo/redo stacks
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Add transition types
  const [transitions, setTransitions] = useState([]); // {fromClipId, toClipId, type}

  // Handler to add a transition between two clips
  const handleAddTransition = (fromClipId, toClipId, type) => {
    setTransitions(prev => [
      ...prev.filter(t => !(t.fromClipId === fromClipId && t.toClipId === toClipId)),
      { fromClipId, toClipId, type }
    ]);
  };

  // Import handler
  const handleImport = async (files) => {
    pushUndo();
    const newAssets = await Promise.all(files.map(async (file, idx) => {
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
        id: `asset-${Date.now()}-${idx}`,
        file,
        url,
        name: file.name,
        type: 'video',
        duration,
        thumbnails,
      };
    }));
    setAssets(prev => [...prev, ...newAssets]);
    // Optionally, auto-add to timeline as before
    setTracks(prev => ({
      ...prev,
      video: [
        [...prev.video[0], ...newAssets.map(asset => ({
          ...asset,
          id: `clip-${asset.id}`,
          start: 0,
          end: null,
          trackIndex: 0,
        }))],
        ...prev.video.slice(1)
      ]
    }));
    if (newAssets.length > 0) {
      setSelectedClip({ ...newAssets[0], id: `clip-${newAssets[0].id}`, start: 0, end: null, trackIndex: 0 });
    }
  };

  // Remove timeline UI: just use the clips array as the timeline
  const handleExport = async () => {
    setProcessing(true);
    // Use the clips array as the timeline
    const timeline = tracks.video[0].map((clip, i) => ({
      id: `timeline-${clip.id}`,
      clipId: clip.id,
      start: clip.start || 0,
      end: clip.end,
    }));
    const blob = await processTimeline(timeline, tracks.video[0]);
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
        
        setTracks(prev => ({
          ...prev,
          video: [
            [...prev.video[0], processedClip],
            ...prev.video.slice(1)
          ]
        }));
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
        setTracks(prev => ({
          ...prev,
          video: [
            [...prev.video[0], processedClip],
            ...prev.video.slice(1)
          ]
        }));
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
        setTracks(prev => ({
          ...prev,
          video: [
            [...prev.video[0], processedClip],
            ...prev.video.slice(1)
          ]
        }));
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
      setTracks(prev => ({
        ...prev,
        video: [
          [...prev.video[0], processedClip],
          ...prev.video.slice(1)
        ]
      }));
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
      setTracks(prev => ({
        ...prev,
        video: [
          [...prev.video[0], processedClip],
          ...prev.video.slice(1)
        ]
      }));
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
      setTracks(prev => ({
        ...prev,
        video: [
          [...prev.video[0], processedClip],
          ...prev.video.slice(1)
        ]
      }));
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

  // Add new handlers for split and trim at playhead
  const handleSplitAtPlayhead = () => {
    if (!selectedClip) return;
    const splitTime = playhead;
    const clipStart = selectedClip.start || 0;
    const clipEnd = selectedClip.end ?? selectedClip.duration;
    if (splitTime <= clipStart || splitTime >= clipEnd) return;
    const firstPart = { ...selectedClip, end: splitTime, id: selectedClip.id + '-1' };
    const secondPart = { ...selectedClip, start: splitTime, id: selectedClip.id + '-2' };
    setTracks(prev => ({
      ...prev,
      video: [
        [...prev.video[0], firstPart, secondPart],
        ...prev.video.slice(1)
      ]
    }));
    setSelectedClip(secondPart);
  };

  const handleTrimStartAtPlayhead = () => {
    if (!selectedClip) return;
    const clipEnd = selectedClip.end ?? selectedClip.duration;
    if (playhead < clipEnd) {
      setTracks(prev => ({
        ...prev,
        video: [
          [...prev.video[0], ...prev.video[0].map(c =>
            c.id === selectedClip.id ? { ...c, start: playhead } : c
          )],
          ...prev.video.slice(1)
        ]
      }));
    }
  };

  const handleTrimEndAtPlayhead = () => {
    if (!selectedClip) return;
    const clipStart = selectedClip.start || 0;
    if (playhead > clipStart) {
      setTracks(prev => ({
        ...prev,
        video: [
          [...prev.video[0], ...prev.video[0].map(c =>
            c.id === selectedClip.id ? { ...c, end: playhead } : c
          )],
          ...prev.video.slice(1)
        ]
      }));
    }
  };

  // Handler for updating a clip (move/resize/track change)
  const handleClipUpdate = (updatedClip) => {
    pushUndo();
    setTracks(prev => {
      const type = updatedClip.type || 'video';
      const oldTrackIndex = selectedClip?.trackIndex ?? 0;
      const newTrackIndex = updatedClip.trackIndex ?? 0;
      // Remove from old track
      let newTracks = { ...prev };
      newTracks[type] = newTracks[type].map((track, idx) =>
        idx === oldTrackIndex ? track.filter(c => c.id !== updatedClip.id) : track
      );
      // Add to new track (create if needed)
      while (newTracks[type].length <= newTrackIndex) {
        newTracks[type].push([]);
      }
      newTracks[type][newTrackIndex] = [...newTracks[type][newTrackIndex], updatedClip];
      return newTracks;
    });
    setSelectedClip(updatedClip);
  };

  // Handler to add asset to timeline (drag from library)
  const handleAddAssetToTimeline = (asset, start = 0, trackType = 'video', trackIndex = 0) => {
    pushUndo();
    setTracks(prev => {
      let newTracks = { ...prev };
      while (newTracks[trackType].length <= trackIndex) {
        newTracks[trackType].push([]);
      }
      newTracks[trackType][trackIndex] = [
        ...newTracks[trackType][trackIndex],
        {
          ...asset,
          id: `clip-${asset.id}-${Date.now()}`,
          start,
          end: asset.duration ? Math.min(asset.duration, start + asset.duration) : null,
          trackIndex,
        }
      ];
      return newTracks;
    });
  };

  // Add text asset import handler (for demo, allow adding a text asset)
  const handleAddTextAsset = (text = 'Sample Text') => {
    const asset = {
      id: `asset-text-${Date.now()}`,
      type: 'text',
      name: text,
      text,
      font: 'Arial',
      fontSize: 32,
      color: '#ffffff',
      alignment: 'center',
      shadow: false,
      outline: false,
      duration: 5,
    };
    setAssets(prev => [...prev, asset]);
    // Optionally, add to timeline
    setTracks(prev => ({
      ...prev,
      text: [
        [...(prev.text[0] || []), {
          ...asset,
          id: `clip-${asset.id}`,
          start: 0,
          end: 5,
          trackIndex: 0,
        }],
        ...prev.text.slice(1)
      ]
    }));
  };

  // Text property editing panel
  const handleUpdateTextClip = updatedProps => {
    setTracks(prev => {
      const trackIndex = selectedClip?.trackIndex ?? 0;
      return {
        ...prev,
        text: prev.text.map((track, idx) =>
          idx === trackIndex
            ? track.map(c => c.id === selectedClip.id ? { ...c, ...updatedProps } : c)
            : track
        )
      };
    });
    setSelectedClip(clip => clip ? { ...clip, ...updatedProps } : clip);
  };

  // Handler to delete a clip
  const handleDeleteClip = (clip) => {
    pushUndo();
    setTracks(prev => {
      const type = clip.type || 'video';
      const trackIndex = clip.trackIndex ?? 0;
      return {
        ...prev,
        [type]: prev[type].map((track, idx) =>
          idx === trackIndex ? track.filter(c => c.id !== clip.id) : track
        )
      };
    });
    if (selectedClip && selectedClip.id === clip.id) setSelectedClip(null);
  };
  // Handler to duplicate a clip
  const handleDuplicateClip = (clip) => {
    pushUndo();
    setTracks(prev => {
      const type = clip.type || 'video';
      const trackIndex = clip.trackIndex ?? 0;
      const newClip = { ...clip, id: `clip-${clip.id}-copy-${Date.now()}`, start: (clip.end || clip.start + 1), end: (clip.end || clip.start + 1) + ((clip.end || clip.duration || 1) - (clip.start || 0)), trackIndex };
      return {
        ...prev,
        [type]: prev[type].map((track, idx) =>
          idx === trackIndex ? [...track, newClip] : track
        )
      };
    });
  };
  // Handler for context menu actions
  const handleClipContextAction = (action, clip) => {
    if (action === 'delete') handleDeleteClip(clip);
    else if (action === 'duplicate') handleDuplicateClip(clip);
    else if (action === 'properties') {
      setSelectedClip(clip);
      // Optionally scroll to clip or open a properties modal
    }
  };

  // Helper to push current state to undo stack
  const pushUndo = () => {
    setUndoStack(stack => [
      { tracks: JSON.parse(JSON.stringify(tracks)), selectedClip, assets: JSON.parse(JSON.stringify(assets)) },
      ...stack
    ]);
    setRedoStack([]); // Clear redo on new action
  };

  // Undo handler
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[0];
    setRedoStack(stack => [
      { tracks: JSON.parse(JSON.stringify(tracks)), selectedClip, assets: JSON.parse(JSON.stringify(assets)) },
      ...stack
    ]);
    setTracks(prev.tracks);
    setSelectedClip(prev.selectedClip);
    setAssets(prev.assets);
    setUndoStack(stack => stack.slice(1));
  };

  // Redo handler
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setUndoStack(stack => [
      { tracks: JSON.parse(JSON.stringify(tracks)), selectedClip, assets: JSON.parse(JSON.stringify(assets)) },
      ...stack
    ]);
    setTracks(next.tracks);
    setSelectedClip(next.selectedClip);
    setAssets(next.assets);
    setRedoStack(stack => stack.slice(1));
  };

  // Project Save
  const handleSaveProject = () => {
    const data = {
      tracks,
      assets,
      selectedClip,
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sniply_project.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Project Load
  const handleLoadProject = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (data.tracks && data.assets) {
          setTracks(data.tracks);
          setAssets(data.assets);
          setSelectedClip(data.selectedClip || null);
        } else {
          alert('Invalid project file.');
        }
      } catch (err) {
        alert('Failed to load project: ' + err.message);
      }
    };
    reader.readAsText(file);
  };
  const fileInputRef = useRef();

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportSettings, setExportSettings] = useState({
    resolution: '1920x1080',
    aspect: '16:9',
    format: 'mp4',
    preset: 'YouTube (1080p, 16:9)',
  });

  // Show export modal on export
  const handleExportClick = () => setExportModalOpen(true);

  // Export progress state
  const [exportProgress, setExportProgress] = useState(0);
  const [exportPreviewUrl, setExportPreviewUrl] = useState(null);

  // Update export handler to show progress and preview
  const handleExportWithSettings = async () => {
    setExportModalOpen(false);
    setProcessing(true);
    setExportProgress(0);
    setExportPreviewUrl(null);
    // Simulate export progress
    for (let i = 1; i <= 10; i++) {
      await new Promise(res => setTimeout(res, 200));
      setExportProgress(i * 10);
    }
    // Simulate export preview (use outputUrl or a placeholder)
    setExportPreviewUrl(outputUrl || null);
    setProcessing(false);
  };

  // Multi-select state
  const [selectedClips, setSelectedClips] = useState([]); // array of clip ids

  // Update single selection logic to use selectedClips
  const handleSelectClip = (clip, e) => {
    if (e && (e.ctrlKey || e.metaKey)) {
      // Toggle selection
      setSelectedClips(prev => prev.includes(clip.id) ? prev.filter(id => id !== clip.id) : [...prev, clip.id]);
      setSelectedClip(clip); // for property panel
    } else if (e && e.shiftKey && selectedClips.length > 0) {
      // Range select (same track)
      const type = clip.type || 'video';
      const trackIndex = clip.trackIndex ?? 0;
      const track = tracks[type][trackIndex];
      const lastSelected = track.findIndex(c => c.id === selectedClips[selectedClips.length - 1]);
      const thisIdx = track.findIndex(c => c.id === clip.id);
      if (lastSelected !== -1 && thisIdx !== -1) {
        const [start, end] = [lastSelected, thisIdx].sort((a, b) => a - b);
        const rangeIds = track.slice(start, end + 1).map(c => c.id);
        setSelectedClips(prev => Array.from(new Set([...prev, ...rangeIds])));
        setSelectedClip(clip);
      }
    } else {
      setSelectedClips([clip.id]);
      setSelectedClip(clip);
    }
  };

  // Group move/trim logic (for now, just move all selected clips by the same delta)
  const handleGroupClipUpdate = (updatedClip, deltaStart) => {
    pushUndo();
    setTracks(prev => {
      const type = updatedClip.type || 'video';
      const trackIndex = updatedClip.trackIndex ?? 0;
      return {
        ...prev,
        [type]: prev[type].map((track, idx) =>
          idx === trackIndex
            ? track.map(c => selectedClips.includes(c.id)
              ? { ...c, start: c.start + deltaStart, end: c.end ? c.end + deltaStart : null }
              : c)
            : track
        )
      };
    });
  };

  // Update TimelinePro usage
  return (
    <div className="h-screen bg-gray-900 flex flex-row min-w-0">
      {/* Asset Library Sidebar - always visible on the left */}
      <div className="flex-shrink-0 w-56 bg-gray-800 border-r border-gray-700 min-h-0">
        <AssetSidebar
          assets={assets}
          onAssetDragStart={(e, asset) => {
            e.dataTransfer.setData('assetId', asset.id);
          }}
          onSaveProject={handleSaveProject}
          onLoadProject={() => fileInputRef.current && fileInputRef.current.click()}
          fileInputRef={fileInputRef}
          onAddTextAsset={() => handleAddTextAsset('New Text Overlay')}
          TRANSITIONS={TRANSITIONS}
          onTransitionDragStart={(e, tr) => {
            e.dataTransfer.setData('transitionType', tr.type);
          }}
        />
      </div>
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={20} minSize={15} maxSize={30}>
            <Sidebar onToolClick={handleToolClick} processing={processing} />
          </Panel>
          <PanelResizeHandle className="bg-gray-700 w-1 cursor-col-resize" />
          <Panel minSize={40}>
            <div className="flex flex-col h-full w-full">
              <Toolbar
                onImport={() => setImportDialogOpen(true)}
                onExport={handleExportClick}
                onTrim={handleTrim}
                onSplit={handleSplit}
                onTextOverlay={handleTextOverlay}
                onSplitAtPlayhead={handleSplitAtPlayhead}
                onTrimStartAtPlayhead={handleTrimStartAtPlayhead}
                onTrimEndAtPlayhead={handleTrimEndAtPlayhead}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={undoStack.length > 0}
                canRedo={redoStack.length > 0}
              />
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
                  {/* TimelinePro drop handler for assets and transitions */}
                  <div
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      const assetId = e.dataTransfer.getData('assetId');
                      const transitionType = e.dataTransfer.getData('transitionType');
                      if (assetId) {
                        const asset = assets.find(a => a.id === assetId);
                        if (asset) {
                          // For now, add to first track at playhead
                          handleAddAssetToTimeline(asset, playhead, asset.type, 0);
                        }
                      } else if (transitionType) {
                        // Find the two adjacent clips at the drop position
                        // For simplicity, use the first video track
                        const videoClips = tracks.video[0].slice().sort((a, b) => (a.start || 0) - (b.start || 0));
                        const dropX = e.nativeEvent.offsetX;
                        const PIXELS_PER_SECOND = 100 * zoom;
                        const dropTime = dropX / PIXELS_PER_SECOND;
                        for (let i = 0; i < videoClips.length - 1; i++) {
                          const a = videoClips[i];
                          const b = videoClips[i + 1];
                          if ((a.end ?? a.duration) <= dropTime && b.start >= dropTime) {
                            handleAddTransition(a.id, b.id, transitionType);
                            break;
                          }
                        }
                      }
                    }}
                    className="h-full w-full"
                  >
                    <TimelinePro
                      playhead={playhead}
                      duration={videoDuration}
                      onSeek={handleTimelineSeek}
                      tracks={tracks}
                      zoom={zoom}
                      selectedClip={selectedClip}
                      selectedClips={selectedClips}
                      onSelectClip={handleSelectClip}
                      onSelectClips={setSelectedClips}
                      onClipUpdate={handleClipUpdate}
                      onGroupClipUpdate={handleGroupClipUpdate}
                      transitions={transitions}
                      onClipContextAction={handleClipContextAction}
                      onUndo={handleUndo}
                      onRedo={handleRedo}
                      canUndo={undoStack.length > 0}
                      canRedo={redoStack.length > 0}
                      onSplitAtPlayhead={handleSplitAtPlayhead}
                      onDuplicateClip={handleDuplicateClip}
                      onDeleteClip={handleDeleteClip}
                    />
                  </div>
                </Panel>
              </PanelGroup>
              {/* Add keyframe editing UI below the timeline */}
              {selectedClip && (
                <div className="bg-gray-800 p-4 border-t border-gray-700">
                  <h3 className="text-white font-bold mb-2">Keyframes for {selectedClip.name}</h3>
                  <KeyframePanel
                    clip={selectedClip}
                    onUpdate={updatedKeyframes => {
                      // Update keyframes for the selected clip in tracks
                      setTracks(prev => {
                        const type = selectedClip.type || 'video';
                        const trackIndex = selectedClip.trackIndex ?? 0;
                        return {
                          ...prev,
                          [type]: prev[type].map((track, idx) =>
                            idx === trackIndex
                              ? track.map(c => c.id === selectedClip.id ? { ...c, keyframes: updatedKeyframes } : c)
                              : track
                          )
                        };
                      });
                      setSelectedClip(clip => clip ? { ...clip, keyframes: updatedKeyframes } : clip);
                    }}
                  />
                </div>
              )}
              {/* Text property editing panel */}
              {selectedClip && selectedClip.type === 'text' && (
                <TextPropertiesPanel
                  selectedClip={selectedClip}
                  handleUpdateTextClip={handleUpdateTextClip}
                />
              )}
              <ImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                onImport={handleImport}
              />
            </div>
          </Panel>
        </PanelGroup>
        {/* Trim Modal */}
        <TrimModal
          open={trimModalOpen}
          onClose={() => setTrimModalOpen(false)}
          onConfirm={handleTrimConfirm}
          trimStart={trimStart}
          setTrimStart={setTrimStart}
          trimEnd={trimEnd}
          setTrimEnd={setTrimEnd}
          selectedClip={selectedClip}
        />
        {/* Split Modal */}
        <SplitModal
          open={splitModalOpen}
          onClose={() => setSplitModalOpen(false)}
          onConfirm={handleSplitConfirm}
          splitTime={splitTime}
          setSplitTime={setSplitTime}
          selectedClip={selectedClip}
        />
        {/* Text Overlay Modal */}
        <TextOverlayModal
          open={textModalOpen}
          onClose={() => setTextModalOpen(false)}
          onConfirm={handleTextOverlayConfirm}
          overlayText={overlayText}
          setOverlayText={setOverlayText}
          textStart={textStart}
          setTextStart={setTextStart}
          textEnd={textEnd}
          setTextEnd={setTextEnd}
          fontSize={fontSize}
          setFontSize={setFontSize}
          fontColor={fontColor}
          setFontColor={setFontColor}
          textAlignment={textAlignment}
          setTextAlignment={setTextAlignment}
          selectedClip={selectedClip}
        />
        {/* AI Music Modal */}
        <AiMusicModal
          open={aiMusicModalOpen}
          onClose={() => setAiMusicModalOpen(false)}
          videoMood={videoMood}
          musicLibrary={musicLibrary}
          selectedMusic={selectedMusic}
          setSelectedMusic={setSelectedMusic}
          musicVolume={musicVolume}
          setMusicVolume={setMusicVolume}
          aiMusicGenerating={aiMusicGenerating}
          handleGenerateAiMusic={handleGenerateAiMusic}
          handleApplyMusic={handleApplyMusic}
        />
        {/* Export Modal */}
        <ExportModal
          open={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          onExport={handleExportWithSettings}
          exportSettings={exportSettings}
          setExportSettings={setExportSettings}
          EXPORT_PRESETS={EXPORT_PRESETS}
        />
        {/* Export Progress Modal */}
        <ExportProgressModal
          open={processing}
          progress={exportProgress}
          previewUrl={exportPreviewUrl}
        />
      </div>
    </div>
  );
};

export default NewEditingPage;
"use client"
import { useState } from 'react';
import { useSelectedFiles } from "@/context/SelectedFilesContext";
import Sidebar from './Sidebar';

export default function SidebarHandled() {
    const { selectedFiles } = useSelectedFiles();
    const [processing, setProcessing] = useState(false);
    // Handler for sidebar tool clicks
    const handleToolClick = async (tool) => {
        if (!selectedFiles || selectedFiles.length === 0) {
            alert('Please import and select a video first.');
            return;
        }

        if (tool === 'bg_removal' || tool === 'noise_reduction' || tool === 'caption_generator' || tool === 'export' || tool === 'transition' || tool.startsWith('export_') || tool.startsWith('transition_')) {
            setProcessing(true);
            try {
                const formData = new FormData();
                formData.append('file', selectedFiles[0]);

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
                const response = await fetch(`${BACKEND_URL}/clipora_smart_trim_silence_part/auto_trim`, {
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


    return (
        <Sidebar onToolClick={handleToolClick} processing={processing} />
    )
}
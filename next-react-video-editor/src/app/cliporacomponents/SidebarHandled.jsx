"use client"
import { useState, useEffect } from "react"
import { useSelectedFiles } from "@/context/SelectedFilesContext"
import Sidebar from "./Sidebar"
import ModalUpload from "@/components/modal-upload"

export default function SidebarHandled({ stateManager }) {
  const { selectedFiles, setSelectedFiles } = useSelectedFiles()
  const [processing, setProcessing] = useState(false)
  const [outputUrl, setOutputUrl] = useState(null)
  const [tracks, setTracks] = useState({
    video: [[]], // array of video tracks, each is an array of clips
    audio: [[]],
    text: [[]],
    image: [[]],
  })
  useEffect(() => {
  stateManager.subscribeToActiveIds(({ activeIds }) => {
      console.log("Active items:", activeIds);

      // Look up the actual video object(s)
      const state = stateManager.getState();
      const selectedVideos = activeIds.map(id => state.trackItemsMap[id]);

      // Example: send to your server
      selectedVideos.forEach(video => {
        if (video.type === "video") {
          console.log("video", video)
        }
      });
    });
  }, [stateManager]);
  const [selectedClip, setSelectedClip] = useState(null)
  const setToSource = (blob) => {
    setSelectedFiles(blob);
  }
  // Handler for sidebar tool clicks
  const BACKEND_URL = "http://localhost:8000/"
  const handleToolClick = async (tool) => {

    
  }
  // const handleToolClick = async (tool) => {
  //   if (!selectedFiles || selectedFiles.length === 0) {
  //     alert("Please import and select a video first.")
  //     return
  //   }

  //   if (
  //     tool === "bg_removal" ||
  //     tool === "noise_reduction" ||
  //     tool === "caption_generator" ||
  //     tool === "export" ||
  //     tool === "transition" ||
  //     tool.startsWith("export_") ||
  //     tool.startsWith("transition_")
  //   ) {
  //     setProcessing(true)
  //     try {
  //       const formData = new FormData()
  //       formData.append("file", selectedFiles[0])

  //       let endpoint = ""
  //       let additionalParams = {}

  //       if (tool === "bg_removal") endpoint = "bg_remover"
  //       if (tool === "noise_reduction") endpoint = "noise_reduction"
  //       if (tool === "caption_generator") endpoint = "caption_generator"
  //       if (tool === "export") {
  //         endpoint = "export"
  //         additionalParams.resolution = "1080p" // Default to 1080p
  //       }
  //       if (tool.startsWith("export_")) {
  //         endpoint = "export"
  //         const resolution = tool.replace("export_", "")
  //         additionalParams.resolution = resolution
  //       }
  //       if (tool === "transition") {
  //         endpoint = "transition"
  //         additionalParams.transition_type = "fade" // Default to fade
  //         additionalParams.transition_duration = 1.0
  //       }
  //       if (tool.startsWith("transition_")) {
  //         endpoint = "transition"
  //         const transitionType = tool.replace("transition_", "")
  //         additionalParams.transition_type = transitionType
  //         additionalParams.transition_duration = 1.0
  //       }

  //       // Add additional parameters to form data
  //       Object.entries(additionalParams).forEach(([key, value]) => {
  //         formData.append(key, value)
  //       })
  //       console.log(formData);

  //       const response = await fetch(`${BACKEND_URL}process/${endpoint}`, {
  //         method: "POST",
  //         body: formData,
  //       })

  //       if (!response.ok) {
  //         const errorText = await response.text()
  //         throw new Error(`Processing failed: ${errorText}`)
  //       }

  //       const blob = await response.blob()
  //       // console.log("Processed blob:", blob)
  //       setToSource(blob)

  //       if (!blob || blob.size === 0 || !blob.type.startsWith("video/")) {
  //         alert("Processing failed: Received invalid or empty video file.")
  //         return
  //       }
  //       const extractThumbnails = (file, duration, count = 20) => {
  //         return new Promise((resolve) => {
  //           const video = document.createElement("video")
  //           video.preload = "auto"
  //           video.src = URL.createObjectURL(file)
  //           video.crossOrigin = "anonymous"
  //           video.muted = true
  //           video.currentTime = 0
  //           const canvas = document.createElement("canvas")
  //           const thumbnails = []
  //           let loaded = false
  //           video.addEventListener("loadeddata", async () => {
  //             if (loaded) return
  //             loaded = true
  //             const interval = duration / count
  //             canvas.width = video.videoWidth
  //             canvas.height = video.videoHeight
  //             for (let i = 0; i < count; i++) {
  //               video.currentTime = Math.min(duration, i * interval)
  //               await new Promise((res) => {
  //                 video.onseeked = () => {
  //                   canvas
  //                     .getContext("2d")
  //                     .drawImage(video, 0, 0, canvas.width, canvas.height)
  //                   thumbnails.push(canvas.toDataURL("image/jpeg", 0.6))
  //                   res()
  //                 }
  //               })
  //             }
  //             resolve(thumbnails)
  //           })
  //         })
  //       }

  //       setOutputUrl(null)
  //       const url = URL.createObjectURL(blob)

  //       // Re-extract thumbnails for the new video
  //       const video = document.createElement("video")
  //       video.preload = "metadata"
  //       video.src = url
  //       await new Promise((res) => {
  //         video.onloadedmetadata = res
  //       })
  //       const duration = video.duration
  //       const thumbnails = await extractThumbnails(blob, duration, 20)

  //       const processedClip = {
  //         id: `clip-processed-${Date.now()}`,
  //         file: blob,
  //         url,
  //         name: `${tool.charAt(0).toUpperCase() + tool.slice(1)} Video`,
  //         start: 0,
  //         end: null,
  //         duration,
  //         thumbnails,
  //         type: "video",
  //       }

  //       setTracks((prev) => ({
  //         ...prev,
  //         video: [[...prev.video[0], processedClip], ...prev.video.slice(1)],
  //       }))
  //       setSelectedClip(processedClip)
  //       setOutputUrl(url)
  //     } catch (err) {
  //       console.error("Processing error:", err)
  //       alert(`Processing failed: ${err.message}`)
  //     } finally {
  //       setProcessing(false)
  //     }
  //   }
  //   if (tool === "smart_trim") {
  //     setProcessing(true)
  //     try {
  //       const formData = new FormData()
  //       formData.append("file", selectedClip.file)
  //       const response = await fetch(
  //         `${BACKEND_URL}/clipora_smart_trim_silence_part/auto_trim`,
  //         {
  //           method: "POST",
  //           body: formData,
  //         }
  //       )
  //       if (!response.ok) {
  //         const errorText = await response.text()
  //         throw new Error(`Processing failed: ${errorText}`)
  //       }
  //       const blob = await response.blob()
  //       if (!blob || blob.size === 0 || !blob.type.startsWith("video/")) {
  //         alert("Processing failed: Received invalid or empty video file.")
  //         return
  //       }
  //       setToSource(blob);
  //       setOutputUrl(null)
  //       const url = URL.createObjectURL(blob)
  //       // Re-extract thumbnails for the new video
  //       const video = document.createElement("video")
  //       video.preload = "metadata"
  //       video.src = url
  //       await new Promise((res) => {
  //         video.onloadedmetadata = res
  //       })
  //       const duration = video.duration
  //       const thumbnails = await extractThumbnails(blob, duration, 20)
  //       const processedClip = {
  //         id: `clip-processed-${Date.now()}`,
  //         file: blob,
  //         url,
  //         name: "Smart Trimmed Video",
  //         start: 0,
  //         end: null,
  //         duration,
  //         thumbnails,
  //         type: "video",
  //       }
  //       setTracks((prev) => ({
  //         ...prev,
  //         video: [[...prev.video[0], processedClip], ...prev.video.slice(1)],
  //       }))
  //       setSelectedClip(processedClip)
  //       setOutputUrl(url)
  //     } catch (err) {
  //       console.error("Processing error:", err)
  //       alert(`Processing failed: ${err.message}`)
  //     } finally {
  //       setProcessing(false)
  //     }
  //   }
  //   if (tool === "color_grading") {
  //     setProcessing(true)
  //     try {
  //       const formData = new FormData()
  //       formData.append("file", selectedClip.file)
  //       const response = await fetch(`${BACKEND_URL}/process/color_grading`, {
  //         method: "POST",
  //         body: formData,
  //       })
  //       if (!response.ok) {
  //         const errorText = await response.text()
  //         throw new Error(`Processing failed: ${errorText}`)
  //       }
  //       const blob = await response.blob()
  //       if (!blob || blob.size === 0 || !blob.type.startsWith("video/")) {
  //         alert("Processing failed: Received invalid or empty video file.")
  //         return
  //       }
  //       setToSource(blob);
  //       setOutputUrl(null)
  //       const url = URL.createObjectURL(blob)
  //       // Re-extract thumbnails for the new video
  //       const video = document.createElement("video")
  //       video.preload = "metadata"
  //       video.src = url
  //       await new Promise((res) => {
  //         video.onloadedmetadata = res
  //       })
  //       const duration = video.duration
  //       const thumbnails = await extractThumbnails(blob, duration, 20)
  //       const processedClip = {
  //         id: `clip-processed-${Date.now()}`,
  //         file: blob,
  //         url,
  //         name: "Color Graded Video",
  //         start: 0,
  //         end: null,
  //         duration,
  //         thumbnails,
  //         type: "video",
  //       }
  //       setTracks((prev) => ({
  //         ...prev,
  //         video: [[...prev.video[0], processedClip], ...prev.video.slice(1)],
  //       }))
  //       setSelectedClip(processedClip)
  //       setOutputUrl(url)
  //     } catch (err) {
  //       console.error("Processing error:", err)
  //       alert(`Processing failed: ${err.message}`)
  //     } finally {
  //       setProcessing(false)
  //     }
  //   }
  //   if (tool === "trim") {
  //     if (!selectedClip) {
  //       alert("Please select a video to trim.")
  //       return
  //     }
  //     if (!selectedClip.duration || selectedClip.duration <= 0) {
  //       alert(
  //         "Video metadata is still loading. Please wait until the video is ready."
  //       )
  //       return
  //     }
  //     setTrimStart(0)
  //     setTrimEnd(selectedClip.duration)
  //     setTrimModalOpen(true)
  //     return
  //   }
  //   if (tool === "split") {
  //     if (!selectedClip) {
  //       alert("Please select a video to split.")
  //       return
  //     }
  //     if (!selectedClip.duration || selectedClip.duration <= 0) {
  //       alert(
  //         "Video metadata is still loading. Please wait until the video is ready."
  //       )
  //       return
  //     }
  //     setSplitTime(Math.floor(selectedClip.duration / 2)) // default to middle
  //     setSplitModalOpen(true)
  //     return
  //   }
  //   if (tool === "text_overlay") {
  //     handleTextOverlay()
  //     return
  //   }
  //   if (tool === "ai_music") {
  //     handleAiMusic()
  //     return
  //   }
  //   // TODO: Add other tool integrations here
  // }

  return <Sidebar onToolClick={handleToolClick} processing={processing} />
}

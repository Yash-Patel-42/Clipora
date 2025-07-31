import React, { useState } from "react"
import { BACKEND_URL } from "./backend"
import useStore from "../store/store"

const toolList = [
  {
    key: "bg_removal",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    label: "Background Removal",
  },
  {
    key: "caption_generator",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
        />
      </svg>
    ),
    label: "Auto Captions",
  },
  {
    key: "smart_trim",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-3l-4 4z"
        />
      </svg>
    ),
    label: "Smart Trim",
  },
  {
    key: "color_grading",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" />
        <circle cx="15.5" cy="10.5" r="1.5" fill="currentColor" />
        <path
          d="M8 15c1.333-1 2.667-1 4 0"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    label: "Color Grading",
  },
  {
    key: "export",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
        />
      </svg>
    ),
    label: "Export Options",
  },
  {
    key: "transition_fade",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
    ),
    label: "Auto Transitions",
  },
  {
    key: "ai_music",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
        />
      </svg>
    ),
    label: "AI Music",
  },
  {
    key: "noise_reduction",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
    ),
    label: "Noise Reduction",
  },
]

const toolToEndpoint: Record<string, string> = {
  bg_removal: "/process/bg_remover",
  caption_generator: "/process/captions",
  ai_music: "/process/ai_music",
  color_grading: "/process/color_grading",
  export: "/process/export",
  smart_trim: "/process/smart_trim",
  noise_reduction: "/process/noise_reduction",
  transition_fade: "/process/transition",
}

const Sidebar: React.FC = () => {
  const [loadingTool, setLoadingTool] = useState<string | null>(null)
  const { activeIds, trackItemsMap, trackItemDetailsMap, setState } = useStore()

  let selectedTrackItem = null
  if (activeIds && activeIds.length > 0) {
    const id = activeIds[0]
    const details = trackItemDetailsMap[id]
    const item = trackItemsMap[id]
    if (
      item &&
      item.type === "video" &&
      details &&
      details.details &&
      details.details.src
    ) {
      selectedTrackItem = { ...item, ...details.details }
    }
  }

  const getFileFromSrc = async (src: string) => {
    if (src.startsWith("blob:")) {
      const response = await fetch(src)
      return await response.blob()
    }
    if (src.startsWith("data:")) {
      const res = await fetch(src)
      return await res.blob()
    }
    const response = await fetch(src)
    return await response.blob()
  }

  const handleToolClick = async (tool: string) => {
    if (!selectedTrackItem) {
      alert("Please select a video on the timeline first.")
      return
    }
    setLoadingTool(tool)
    try {
      const endpoint = toolToEndpoint[tool]
      if (!endpoint) {
        alert("No backend endpoint mapped for this tool.")
        setLoadingTool(null)
        return
      }
      let file: File | Blob | null = selectedTrackItem.file || null
      if (!file && selectedTrackItem.src) {
        file = await getFileFromSrc(selectedTrackItem.src)
      }
      if (!file) {
        alert("Could not get video file for processing.")
        setLoadingTool(null)
        return
      }
      const formData = new FormData()
      formData.append("file", file, selectedTrackItem.name || "input.mp4")
      const response = await fetch(BACKEND_URL + endpoint, {
        method: "POST",
        body: formData,
      })
      if (!response.ok) {
        alert("Processing failed: " + (await response.text()))
        setLoadingTool(null)
        return
      }
      const blob = await response.blob()
      if (!blob || blob.size === 0 || !blob.type.startsWith("video/")) {
        alert("Processing failed: Received invalid or empty video file.")
        setLoadingTool(null)
        return
      }
      const url = URL.createObjectURL(blob)
      setState((prev: any) => {
        const id = activeIds[0]
        const processedId = `processed-${Date.now()}`
        // Remove original video from all maps and arrays
        const { [id]: _, ...newTrackItemsMap } = prev.trackItemsMap
        const { [id]: __, ...newTrackItemDetailsMap } = prev.trackItemDetailsMap
        const newTrackItemIds = prev.trackItemIds.filter((itemId: string) => itemId !== id)
        // Add processed video
        const processedClip = {
          ...prev.trackItemsMap[id],
          id: processedId,
          details: {
            ...prev.trackItemsMap[id].details,
            src: url,
            file: blob,
            name: "Processed Video",
          },
        }
        newTrackItemsMap[processedId] = processedClip
        newTrackItemDetailsMap[processedId] = processedClip
        newTrackItemIds.push(processedId)
        return {
          ...prev,
          trackItemsMap: newTrackItemsMap,
          trackItemDetailsMap: newTrackItemDetailsMap,
          trackItemIds: newTrackItemIds,
          activeIds: [processedId],
          lastUpdated: Date.now(),
        }
      })
      setLoadingTool(null)
    } catch (e) {
      alert("Error: " + (e as any).message)
      setLoadingTool(null)
    }
  }

  return (
    <div className="z-[201] absolute top-[15px] right-[10px] bottom-[335px] w-14 bg-background/80 backdrop-blur-lg rounded-lg shadow-lg flex flex-col items-center pointer-events-auto overflow-visible py-2">
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-1 w-full">
        {toolList.map((tool) => (
          <div
            key={tool.key}
            className="relative group w-full flex justify-center"
          >
            <button
              onClick={() => handleToolClick(tool.key)}
              className={`w-9 h-9 flex items-center justify-center text-muted-foreground rounded-lg hover:bg-gray-700 transition-colors ${
                loadingTool === tool.key ? "opacity-60 cursor-not-allowed" : ""
              }`}
              disabled={loadingTool === tool.key}
              aria-label={tool.label}
            >
              {tool.icon}
            </button>

            {/* Tooltip aligned left */}
            <span className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-50">
              {tool.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Sidebar

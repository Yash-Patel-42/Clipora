import { useState, useRef } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function YashTestEditingPage() {
    const [processors, setProcessors] = useState([]);
    const [selectedProcessor, setSelectedProcessor] = useState("");
    const [mediaFile, setMediaFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState("");
    const [resultMediaType, setResultMediaType] = useState("");
    const [error, setError] = useState("");

    // State for text and styling options
    const [text, setText] = useState("Hello, World!");
    const [fontSize, setFontSize] = useState(64);
    const [fontColor, setFontColor] = useState("white");
    const [boxColor, setBoxColor] = useState("black@0.5");
    const [boxBorder, setBoxBorder] = useState(20);
    const [position, setPosition] = useState("bottom");

    const fileInputRef = useRef();

    // Fetch available processors on mount
    useState(() => {
        fetch(`${BACKEND_URL}/processors`)
            .then((res) => res.json())
            .then((data) => setProcessors(data.processors || []))
            .catch(() =>
                setProcessors([
                    "bg_remover",
                    "noise_reduction",
                    "text_apply",
                    "bg_remover_icon",
                ])
            );
    }, []);

    const handleFileChange = (e) => {
        setMediaFile(e.target.files[0]);
        setResultUrl("");
        setError("");
    };

    const handleProcess = async (processor) => {
        if (!mediaFile) {
            setError("Please upload a file first.");
            return;
        }
        if (processor === "text_apply" && !text) {
            setError("Please enter text to apply.");
            return;
        }
        setProcessing(true);
        setError("");
        setResultUrl("");
        setResultMediaType("");
        setSelectedProcessor(processor);

        const formData = new FormData();
        formData.append("file", mediaFile);

        if (processor === "text_apply") {
            formData.append("text", text);
            formData.append("font_size", fontSize);
            formData.append("font_color", fontColor);
            formData.append("box_color", boxColor);
            formData.append("box_border", boxBorder);
            formData.append("position", position);
        }

        try {
            const response = await fetch(
                `${BACKEND_URL}/process/${processor}`,
                {
                    method: "POST",
                    body: formData,
                }
            );
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Processing failed");
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            setResultUrl(url);
            setResultMediaType(blob.type);
        } catch (err) {
            setError(`Processing failed: ${err.message}`);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 py-8 px-2 dark">
            <div className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-800">
                <h1 className="text-3xl font-bold text-center text-blue-300 mb-6">
                    Sniply - AI Video Editor
                </h1>

                {/* Media Upload */}
                <div className="mb-6">
                    <label
                        htmlFor="media-upload"
                        className="block text-gray-300 font-medium mb-2">
                        1. Upload Media
                    </label>
                    <input
                        id="media-upload"
                        type="file"
                        accept="video/mp4,image/png,image/jpeg,image/gif"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        disabled={processing}
                        className="block w-full text-sm text-gray-200 border border-gray-700 rounded-lg cursor-pointer bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
                    />
                </div>

                {/* Text and Styling Controls */}
                <div className="mb-6 p-4 border border-gray-700 rounded-lg">
                    <h2 className="text-xl font-semibold text-blue-300 mb-4">
                        2. Text Overlay Controls
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="text-input"
                                className="block text-gray-300 font-medium mb-2">
                                Text:
                            </label>
                            <input
                                id="text-input"
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                disabled={processing}
                                className="block w-full text-sm text-gray-200 border border-gray-700 rounded-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="font-size"
                                className="block text-gray-300 font-medium mb-2">
                                Font Size:
                            </label>
                            <input
                                id="font-size"
                                type="number"
                                value={fontSize}
                                onChange={(e) => setFontSize(e.target.value)}
                                disabled={processing}
                                className="block w-full text-sm text-gray-200 border border-gray-700 rounded-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="font-color"
                                className="block text-gray-300 font-medium mb-2">
                                Font Color:
                            </label>
                            <input
                                id="font-color"
                                type="text"
                                value={fontColor}
                                onChange={(e) => setFontColor(e.target.value)}
                                disabled={processing}
                                className="block w-full text-sm text-gray-200 border border-gray-700 rounded-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="box-color"
                                className="block text-gray-300 font-medium mb-2">
                                Box Color (e.g., black@0.5):
                            </label>
                            <input
                                id="box-color"
                                type="text"
                                value={boxColor}
                                onChange={(e) => setBoxColor(e.target.value)}
                                disabled={processing}
                                className="block w-full text-sm text-gray-200 border border-gray-700 rounded-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="box-border"
                                className="block text-gray-300 font-medium mb-2">
                                Box Border (px):
                            </label>
                            <input
                                id="box-border"
                                type="number"
                                value={boxBorder}
                                onChange={(e) => setBoxBorder(e.target.value)}
                                disabled={processing}
                                className="block w-full text-sm text-gray-200 border border-gray-700 rounded-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="position"
                                className="block text-gray-300 font-medium mb-2">
                                Position:
                            </label>
                            <select
                                id="position"
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                disabled={processing}
                                className="block w-full text-sm text-gray-200 border border-gray-700 rounded-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60">
                                <option value="top">Top</option>
                                <option value="center">Center</option>
                                <option value="bottom">Bottom</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-blue-300 mb-3 text-center">
                        3. Choose an Action
                    </h3>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {processors.map((proc) => (
                            <button
                                key={proc}
                                onClick={() => handleProcess(proc)}
                                disabled={processing || !mediaFile}
                                className={`px-5 py-2 rounded-lg font-semibold shadow transition-all duration-200
                  ${
                      selectedProcessor === proc && processing
                          ? "bg-blue-700 text-white animate-pulse"
                          : ""
                  }
                  ${
                      selectedProcessor === proc && !processing
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-blue-300 hover:bg-gray-700"
                  }
                  ${
                      processing || !mediaFile
                          ? "opacity-60 cursor-not-allowed"
                          : ""
                  }`}>
                                {processing && selectedProcessor === proc
                                    ? "Processing..."
                                    : proc
                                          .replace(/_/g, " ")
                                          .replace(/\b\w/g, (c) =>
                                              c.toUpperCase()
                                          )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status and Result */}
                {error && (
                    <p className="text-red-400 font-semibold text-center mb-4">
                        {error}
                    </p>
                )}

                {resultUrl && (
                    <div className="mt-6 text-center">
                        <h2 className="text-xl font-bold text-green-400 mb-2">
                            4. Your Processed Media
                        </h2>
                        {resultMediaType.startsWith("video") ? (
                            <video
                                src={resultUrl}
                                controls
                                className="mx-auto rounded-lg shadow-lg mb-3 max-w-full bg-black"
                                width="400"
                            />
                        ) : (
                            <img
                                src={resultUrl}
                                alt="Processed media"
                                className="mx-auto rounded-lg shadow-lg mb-3 max-w-full bg-black"
                                width="400"
                            />
                        )}
                        <br />
                        <a
                            href={resultUrl}
                            download={`processed_${mediaFile.name}`}
                            className="inline-block mt-2 px-6 py-2 bg-green-700 text-white font-semibold rounded-lg shadow hover:bg-green-800 transition">
                            Download Result
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

export default YashTestEditingPage;

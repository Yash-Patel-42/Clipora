
import { useState, useRef } from "react";
import Sidebar from "./Sidebar";
import VideoPreview from "./VideoPreview";
import TextControls from "./TextControls";
import Toolbar from "./Toolbar";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function YashTestEditingPage() {
    const [processors, setProcessors] = useState([]);
    const [selectedProcessor, setSelectedProcessor] = useState("");
    const [mediaFile, setMediaFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState("");
    const [resultMediaType, setResultMediaType] = useState("");
    const [error, setError] = useState("");
    const [isTextControlsVisible, setIsTextControlsVisible] = useState(false);


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
        const file = e.target.files[0];
        if (file) {
            setMediaFile(URL.createObjectURL(file));
        }
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
        if (processor === "text_apply") {
            setIsTextControlsVisible(true);
            return;
        }
        setProcessing(true);
        setError("");
        setResultUrl("");
        setResultMediaType("");
        setSelectedProcessor(processor);

        const fileToProcess = await fetch(mediaFile).then(r => r.blob());


        const formData = new FormData();
        formData.append("file", fileToProcess, "mediafile");

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

    const handleApplyText = async () => {
        if (!mediaFile) {
            setError("Please upload a file first.");
            return;
        }
        if (!text) {
            setError("Please enter text to apply.");
            return;
        }
    
        setProcessing(true);
        setError("");
        setResultUrl("");
        setResultMediaType("");
        setSelectedProcessor("text_apply");
    
        const fileToProcess = await fetch(mediaFile).then(r => r.blob());
    
        const formData = new FormData();
        formData.append("file", fileToProcess, "mediafile");
        formData.append("text", text);
        formData.append("font_size", fontSize);
        formData.append("font_color", fontColor);
        formData.append("box_color", boxColor);
        formData.append("box_border", boxBorder);
        formData.append("position", position);
    
        try {
            const response = await fetch(
                `${BACKEND_URL}/process/text_apply`,
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
            setIsTextControlsVisible(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-gray-900 text-white">
            <Toolbar onFileChange={handleFileChange} fileInputRef={fileInputRef} />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar processors={processors} onProcess={handleProcess} processing={processing} selectedProcessor={selectedProcessor} mediaFile={mediaFile} />
                <main className="flex-1 flex flex-col p-4 overflow-y-auto">
                    <VideoPreview mediaFile={mediaFile} resultUrl={resultUrl} resultMediaType={resultMediaType} />
                    {isTextControlsVisible && (
                        <TextControls
                            text={text}
                            setText={setText}
                            fontSize={fontSize}
                            setFontSize={setFontSize}
                            fontColor={fontColor}
                            setFontColor={setFontColor}
                            boxColor={boxColor}
                            setBoxColor={setBoxColor}
                            boxBorder={boxBorder}
                            setBoxBorder={setBoxBorder}
                            position={position}
                            setPosition={setPosition}
                            onApply={handleApplyText}
                            processing={processing}
                        />
                    )}
                    {error && (
                        <p className="text-red-400 font-semibold text-center mt-4">
                            {error}
                        </p>
                    )}
                </main>
            </div>
        </div>
    );
}

export default YashTestEditingPage;

import { useState, useRef } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; 

function YashTestEditingPage() {
  const [processors, setProcessors] = useState([]);
  const [selectedProcessor, setSelectedProcessor] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  // Fetch available processors on mount
  useState(() => {
    fetch(`${BACKEND_URL}/processors`)
      .then(res => res.json())
      .then(data => setProcessors(data.processors || []))
      .catch(() => setProcessors(['bg_remover', 'noise_reduction'])); // fallback
  }, []);

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
    setResultUrl('');
    setError('');
  };

  const handleProcess = async (processor) => {
    if (!videoFile) {
      setError('Please upload a video file first.');
      return;
    }
    setProcessing(true);
    setError('');
    setResultUrl('');
    setSelectedProcessor(processor);
    const formData = new FormData();
    formData.append('file', videoFile);
    try {
      const response = await fetch(`${BACKEND_URL}/process/${processor}`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Processing failed');
      // Create a blob URL for download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      setError('Processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 py-8 px-2 dark">
      <div className="w-full max-w-lg bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-800">
        <h1 className="text-3xl font-bold text-center text-blue-300 mb-6">Video Editor</h1>
        <div className="mb-6">
          <label htmlFor="video-upload" className="block text-gray-300 font-medium mb-2">Upload Video (MP4):</label>
          <input
            id="video-upload"
            type="file"
            accept="video/mp4"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={processing}
            className="block w-full text-sm text-gray-200 border border-gray-700 rounded-lg cursor-pointer bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
          />
        </div>
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {processors.map((proc) => (
            <button
              key={proc}
              onClick={() => handleProcess(proc)}
              disabled={processing || !videoFile}
              className={`px-5 py-2 rounded-lg font-semibold shadow transition-all duration-200
                ${selectedProcessor === proc ? 'bg-blue-600 text-white' : 'bg-gray-800 text-blue-300 hover:bg-gray-700'}
                ${processing || !videoFile ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {proc.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
        {processing && (
          <div className="flex flex-col items-center mb-4">
            <svg className="animate-spin h-8 w-8 text-blue-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <p className="text-blue-300 font-medium">Processing... Please wait.</p>
          </div>
        )}
        {error && <p className="text-red-400 font-semibold text-center mb-4">{error}</p>}
        {resultUrl && (
          <div className="mt-6 text-center">
            <h2 className="text-xl font-bold text-green-400 mb-2">Processed Video</h2>
            <video src={resultUrl} controls className="mx-auto rounded-lg shadow-lg mb-3 max-w-full bg-black" width="400" />
            <br />
            <a
              href={resultUrl}
              download="output.mp4"
              className="inline-block mt-2 px-6 py-2 bg-green-700 text-white font-semibold rounded-lg shadow hover:bg-green-800 transition"
            >
              Download Result
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default YashTestEditingPage;

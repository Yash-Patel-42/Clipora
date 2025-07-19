import React from 'react';

const AiMusicModal = ({
  open,
  onClose,
  videoMood,
  musicLibrary,
  selectedMusic,
  setSelectedMusic,
  musicVolume,
  setMusicVolume,
  aiMusicGenerating,
  handleGenerateAiMusic,
  handleApplyMusic
}) => {
  if (!open) return null;
  return (
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
            onClick={onClose} 
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiMusicModal; 
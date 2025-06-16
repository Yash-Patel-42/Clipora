import React, { useState } from 'react';
import Toolbar from '../components/Toolbar';
import VideoPreview from '../components/VideoPreview';
import Timeline from '../components/Timeline';
import Sidebar from '../components/Sidebar';
import ImportDialog from '../components/ImportDialog';

const EditingPage = () => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [clips, setClips] = useState([]);

  const handleImport = (files) => {
    // Convert files to clips
    const newClips = files.map((file, index) => ({
      id: `clip-${Date.now()}-${index}`,
      start: index * 5, // Place clips 5 seconds apart
      duration: 10, // Default duration of 10 seconds
      type: file.type.startsWith('video/') ? 'video' : 
            file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('audio/') ? 'audio' : 'text',
      name: file.name
    }));

    setClips(prev => [...prev, ...newClips]);
    setHasContent(true);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <Toolbar onImport={() => setImportDialogOpen(true)} />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <VideoPreview hasContent={hasContent} />
          <Timeline clips={clips} />
        </div>
        <Sidebar />
      </div>

      <ImportDialog 
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImport}
      />
    </div>
  );
};

export default EditingPage; 
import React from 'react';
import FeatureCard from './common/FeatureCard';

const Sidebar = () => {
  return (
    <div className="w-72 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto animate-fade-in">
      <h2 className="text-lg font-medium mb-4 text-white">AI Tools</h2>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        <FeatureCard 
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          }
          title="Background Removal"
          description="Auto-remove backgrounds from videos"
        />
        
        <FeatureCard 
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          }
          title="Auto Captions"
          description="Generate text from speech"
        />
        
        <FeatureCard 
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          }
          title="Color Grading"
          description="Enhance colors automatically"
        />
        
        <FeatureCard 
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243zm0 0L9.121 9.121" />
            </svg>
          }
          title="Smart Trim"
          description="Remove silent sections"
        />
        
        <FeatureCard 
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          }
          title="Export Options"
          description="Multiple formats & quality"
        />
        
        <FeatureCard 
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
          title="Auto Transitions"
          description="Smart scene transitions"
        />
        
        <FeatureCard 
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          }
          title="AI Music"
          description="Generate matching soundtrack"
        />
        
        <FeatureCard 
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          }
          title="Auto Zoom"
          description="Dynamic zoom & pan effects"
        />
        
        <FeatureCard 
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          }
          title="Noise Reduction"
          description="Clean audio automatically"
        />
        
        <FeatureCard 
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          }
          title="Composite Layers"
          description="Manage multiple layers"
        />
      </div>
      
      <h2 className="text-lg font-medium mb-4 text-white">Project</h2>
      
      <div className="bg-gray-700/50 rounded-md p-3 mb-4">
        <h3 className="text-sm font-medium mb-2 text-white">Project Settings</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-400">Resolution</div>
          <div className="text-right text-white">1920 × 1080</div>
          
          <div className="text-gray-400">Framerate</div>
          <div className="text-right text-white">30 fps</div>
          
          <div className="text-gray-400">Duration</div>
          <div className="text-right text-white">00:00:00</div>
        </div>
      </div>
      
      <div className="bg-gray-700/50 rounded-md p-3">
        <h3 className="text-sm font-medium mb-2 text-white">Export Presets</h3>
        <div className="space-y-2">
          <button className="w-full text-left p-2 text-sm rounded bg-gray-700 hover:bg-blue-500/20 transition-colors text-white">
            1080p High Quality (MP4)
          </button>
          <button className="w-full text-left p-2 text-sm rounded hover:bg-gray-700 transition-colors text-gray-400 hover:text-white">
            720p Web Optimized (MP4)
          </button>
          <button className="w-full text-left p-2 text-sm rounded hover:bg-gray-700 transition-colors text-gray-400 hover:text-white">
            Audio Only (MP3)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 
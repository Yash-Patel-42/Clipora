import React from 'react';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <section id="how-it-works" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="relative rounded-3xl overflow-hidden bg-white/50 backdrop-blur-lg shadow-xl">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 z-0"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center p-8 md:p-12">
            <div className="lg:w-1/2 mb-10 lg:mb-0 lg:pr-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Create Video Content <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">10x Faster</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Upload your raw footage and let our AI do the heavy lifting. No complex timelines or confusing tools—just professional results in minutes, not hours.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <span className="font-semibold text-blue-600">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Upload Your Video</h3>
                    <p className="text-gray-600">Drag and drop your video or select from your device.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <span className="font-semibold text-blue-600">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Choose AI Enhancements</h3>
                    <p className="text-gray-600">Select which AI features you want to apply to your video.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <span className="font-semibold text-blue-600">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Export & Share</h3>
                    <p className="text-gray-600">Download your professionally edited video in high resolution.</p>
                  </div>
                </div>
              </div>
              
              <Link 
                to="/edit"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all mt-10"
              >
                Try It Now
                <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="relative z-10 bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-800">
                  <div className="p-3 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-xs text-white">Processing Video...</div>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="w-2/3 h-full bg-blue-600 animate-pulse"></div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white">Background Removal</span>
                          <span className="text-blue-400">67%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="w-4/5 h-full bg-blue-600 animate-pulse"></div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white">Auto Captions</span>
                          <span className="text-blue-400">80%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="w-1/2 h-full bg-blue-600 animate-pulse"></div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white">Color Grading</span>
                          <span className="text-blue-400">50%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="w-1/3 h-full bg-blue-600 animate-pulse"></div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white">Music Selection</span>
                          <span className="text-blue-400">33%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-white font-medium">Estimated Completion</div>
                        <div className="text-sm text-blue-400">1:32</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        Your video is being processed with AI-powered enhancements. 
                        This usually takes 2-3 minutes depending on length.
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Reflection effect */}
                <div className="absolute -bottom-16 left-10 right-10 h-40 bg-gradient-to-b from-gray-900/40 to-transparent blur-xl rounded-xl -z-10 scale-90 opacity-30"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction; 
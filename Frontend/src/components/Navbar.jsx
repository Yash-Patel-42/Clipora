import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-4 px-6 md:px-10 ${
        scrolled ? "bg-white/80 backdrop-blur-lg shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
            <svg 
              className="h-5 w-5 text-white fill-white" 
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">Sniply</span>
        </div>

        <nav className="hidden md:flex items-center space-x-10">
          <a 
            href="#features"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Features
          </a>
          <a 
            href="#how-it-works"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            How It Works
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            to="/edit"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
          >
            Try Sniply Free
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar; 
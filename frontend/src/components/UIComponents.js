import React, { useState, useEffect } from 'react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState('');

  useEffect(() => {
    // Get saved theme or default to system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Auto-detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme = prefersDark ? 'dark' : 'light';
      setTheme(systemTheme);
      document.documentElement.setAttribute('data-theme', systemTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
          <path d="m12 2 0 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="m12 20 0 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="m4.93 4.93 1.41 1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="m17.66 17.66 1.41 1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="m2 12 2 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="m20 12 2 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="m6.34 17.66-1.41 1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="m19.07 4.93-1.41 1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )}
    </button>
  );
};

const ProgressBar = ({ progress, label }) => {
  return (
    <div className="progress-container">
      <div className="flex justify-between items-center mb-2">
        <span className="text-body font-medium">{label}</span>
        <span className="text-muted">{progress}%</span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

const FeatureBadge = ({ icon, children, tooltip }) => {
  return (
    <div className="feature-badge" title={tooltip}>
      <span>{icon}</span>
      <span>{children}</span>
    </div>
  );
};

const Tooltip = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

const Dropzone = ({ onDrop, onDragOver, children, isDragActive }) => {
  return (
    <div 
      className={`dropzone ${isDragActive ? 'drag-active' : ''}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {children}
    </div>
  );
};

const StatusBadge = ({ status, children }) => {
  const statusClasses = {
    ready: 'bg-green-100 text-green-800 border-green-200',
    loading: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200',
    error: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusClasses[status] || statusClasses.ready}`}>
      {children}
    </span>
  );
};

export { ThemeToggle, ProgressBar, FeatureBadge, Tooltip, Dropzone, StatusBadge };
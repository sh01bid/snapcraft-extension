import React, { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    // Optionally trigger some initial animation logic here if needed
  }, []);

  const handleClose = () => {
    if (chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    }
    window.close();
  };

  return (
    <div className="welcome-container">
      <div className="glass-card">
        <div className="logo-container">
          <img src="/icon/128.png" alt="Snapcraft Logo" className="logo bounce" />
        </div>
        
        <h1 className="title">
          Welcome to <br /><span className="gradient-text">Screenshot King</span>
        </h1>
        
        <p className="description">
          We've refreshed our brand with a brand new logo to bring you a more premium, modern, and seamless screen capturing experience.
          <br /><br />
          All your favorite features for capturing and recording are here, and better than ever!
        </p>

        <div className="features">
          <div className="feature-item">📸 Fast Screenshots</div>
          <div className="feature-item">🎥 Screen Recording</div>
          <div className="feature-item">✏️ Powerful Editor</div>
        </div>

        <button className="primary-btn" onClick={handleClose}>
          Start Exploring
        </button>
      </div>

      {/* Decorative background elements */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
    </div>
  );
}

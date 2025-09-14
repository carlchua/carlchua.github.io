import React from 'react';
import './ThemeToggle.css';

const ThemeToggle = ({ darkMode, toggleTheme }) => {
  return (
    <div className="theme-toggle-container">
      <button 
        className={`theme-toggle ${darkMode ? 'dark' : 'light'}`}
        onClick={toggleTheme}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <div className="toggle-track">
          <div className="toggle-icons">
            <img 
              src="/assets/sun.png" 
              alt="Sun icon"
              className="icon sun-icon"
            />
            <img 
              src="/assets/moon.png" 
              alt="Moon icon"
              className="icon moon-icon"
            />
          </div>
          <div className={`toggle-slider ${darkMode ? 'dark' : 'light'}`}>
            <img 
              src={darkMode ? '/assets/moon.png' : '/assets/sun.png'} 
              alt={darkMode ? 'Moon icon' : 'Sun icon'}
              className="slider-icon"
            />
          </div>
        </div>
      </button>
    </div>
  );
};

export default ThemeToggle;
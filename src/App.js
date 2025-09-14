import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import ThemeToggle from './components/ThemeToggle';
import TableOfContents from './components/TableOfContents';
import Intro from './components/Intro';
import Experience from './components/Experience';
import Projects from './components/Projects';
import NotFound from './components/NotFound';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (darkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Router>
      <div className="App">
        <ThemeToggle darkMode={darkMode} toggleTheme={toggleTheme} />
        <TableOfContents />
        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <>
                <Intro />
                <Experience />
                <Projects />
              </>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
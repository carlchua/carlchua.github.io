import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ThemeToggle from './components/control/ThemeToggle';
import TableOfContents from './components/control/TableOfContents';
import Intro from './components/content/Intro';
import Experience from './components/content/Experience';
import Projects from './components/content/Projects';
import RandomStuff from './components/content/RandomStuff';
import NotFound from './components/common/NotFound';

import './App.css';

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
                        <Route
                            path="/"
                            element={
                                <>
                                    <Intro />
                                    <Experience />
                                    <Projects />
                                    <RandomStuff />
                                </>
                            }
                        />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;

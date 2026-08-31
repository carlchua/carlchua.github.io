import { useEffect, useState } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Routes,
    useLocation,
} from 'react-router-dom';

import NotFound from '@/components/common/NotFound';
import Education from '@/components/content/Education';
import Experience from '@/components/content/Experience';
import Intro from '@/components/content/Intro';
import Projects from '@/components/content/Projects';
import RandomStuff from '@/components/content/RandomStuff';
import TableOfContents from '@/components/control/TableOfContents';
import ThemeToggle from '@/components/control/ThemeToggle';
import { cn } from '@/lib/utils';

function AppShell() {
    const location = useLocation();
    const isHome = location.pathname === '/';
    const [darkMode, setDarkMode] = useState(
        () => localStorage.getItem('theme') === 'dark'
    );

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
        document
            .querySelector('meta[name="theme-color"]')
            ?.setAttribute('content', darkMode ? '#111916' : '#F3EEE4');
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode((current) => {
            const next = !current;
            document.documentElement.classList.toggle('dark', next);
            localStorage.setItem('theme', next ? 'dark' : 'light');
            document
                .querySelector('meta[name="theme-color"]')
                ?.setAttribute('content', next ? '#111916' : '#F3EEE4');
            return next;
        });
    };

    return (
        <div className="relative min-h-svh">
            <ThemeToggle darkMode={darkMode} toggleTheme={toggleTheme} />
            {isHome ? <TableOfContents /> : null}
            <main
                className={cn(
                    'mx-auto w-full max-w-3xl px-5 pb-8 md:max-w-[52rem] md:pr-10',
                    isHome
                        ? 'pt-[calc(3.75rem+env(safe-area-inset-top,0px))] md:pt-16 md:pl-48 lg:pl-52'
                        : 'pt-10 md:pl-10'
                )}
            >
                <Routes>
                    <Route
                        path="/"
                        element={
                            <>
                                <Intro darkMode={darkMode} />
                                <Experience />
                                <Education />
                                <Projects />
                                <RandomStuff />
                            </>
                        }
                    />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppShell />
        </Router>
    );
}

export default App;

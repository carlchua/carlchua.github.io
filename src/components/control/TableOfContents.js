import { useState, useEffect } from 'react';
import '../../styles/control/TableOfContents.css';

const sections = [
    { id: 'intro', label: 'Home' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'projects', label: 'Projects' },
    { id: 'random-stuff', label: 'Random Stuff' },
];

const TableOfContents = () => {
    const [activeSection, setActiveSection] = useState('intro');

    useEffect(() => {
        const handleScroll = () => {
            const sectionElements = sections
                .map((section) =>
                    document.querySelector(`[data-section="${section.id}"]`)
                )
                .filter(Boolean);

            if (sectionElements.length === 0) return;

            const scrollPosition = window.scrollY + window.innerHeight / 3;

            let currentSection = 'intro';

            for (let i = 0; i < sectionElements.length; i++) {
                const section = sectionElements[i];
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;

                if (
                    scrollPosition >= sectionTop &&
                    scrollPosition < sectionBottom
                ) {
                    currentSection = section.getAttribute('data-section');
                    break;
                }

                if (
                    i === sectionElements.length - 1 &&
                    scrollPosition >= sectionTop
                ) {
                    currentSection = section.getAttribute('data-section');
                }
            }

            if (
                window.innerHeight + window.scrollY >=
                document.body.offsetHeight - 10
            ) {
                currentSection = 'random-stuff';
            }

            setActiveSection(currentSection);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId) => {
        const element = document.querySelector(`[data-section="${sectionId}"]`);
        if (element) {
            const offsetTop = element.offsetTop - 100;
            window.scrollTo({
                top: Math.max(0, offsetTop),
                behavior: 'smooth',
            });
            setActiveSection(sectionId);
        }
    };

    return (
        <nav className="table-of-contents">
            <div className="toc-container">
                {sections.map((section) => (
                    <button
                        key={section.id}
                        className={`toc-item ${activeSection === section.id ? 'active' : ''}`}
                        onClick={() => scrollToSection(section.id)}
                        title={section.label}
                    >
                        <span className="toc-label">{section.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default TableOfContents;

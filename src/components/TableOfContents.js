import React, { useState, useEffect } from 'react';
import './TableOfContents.css';

const sections = [
  { id: 'intro', label: 'Home' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'random-stuff', label: 'Random Stuff' }
];

const TableOfContents = () => {
  const [activeSection, setActiveSection] = useState('intro');

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(section => 
        document.querySelector(`[data-section="${section.id}"]`)
      ).filter(Boolean);

      if (sectionElements.length === 0) return;

      // Get the current scroll position
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      let currentSection = 'intro';

      // Check each section to see which one we're currently in
      for (let i = 0; i < sectionElements.length; i++) {
        const section = sectionElements[i];
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        // If we're within this section's bounds
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          currentSection = section.getAttribute('data-section');
          break;
        }
        
        // Special case: if we're past all sections, highlight the last one
        if (i === sectionElements.length - 1 && scrollPosition >= sectionTop) {
          currentSection = section.getAttribute('data-section');
        }
      }

      // TODO: Change this when Random Stuff gets more content.
      // Additional check: if we're near the bottom of the page, highlight the last section
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
        currentSection = 'random-stuff';
      }

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`);
    if (element) {
      const offsetTop = element.offsetTop - 100; // Account for any fixed headers/margins
      window.scrollTo({
        top: Math.max(0, offsetTop),
        behavior: 'smooth'
      });
      
      // Immediately update the active section to provide instant feedback
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
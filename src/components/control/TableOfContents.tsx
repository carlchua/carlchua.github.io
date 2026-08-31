import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

const sections = [
    { id: 'intro', label: 'Home' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'projects', label: 'Projects' },
    { id: 'random-stuff', label: 'Random' },
];

const MOBILE_NAV_ID = 'mobile-nav';

function getMobileNavOffset() {
    const nav = document.getElementById(MOBILE_NAV_ID);
    return nav ? nav.getBoundingClientRect().height + 8 : 72;
}

function getActiveSectionFromScroll() {
    const scrollHeight = document.documentElement.scrollHeight;
    const viewportBottom = window.scrollY + window.innerHeight;

    if (viewportBottom >= scrollHeight - 12) {
        return sections[sections.length - 1].id;
    }

    const scrollMarker = window.scrollY + getMobileNavOffset() + 16;
    let currentSection = sections[0].id;

    for (const section of sections) {
        const element = document.querySelector(
            `[data-section="${section.id}"]`
        ) as HTMLElement | null;
        if (!element) continue;

        const sectionTop =
            element.getBoundingClientRect().top + window.scrollY;
        if (sectionTop <= scrollMarker) {
            currentSection = section.id;
        }
    }

    return currentSection;
}

export default function TableOfContents() {
    const [activeSection, setActiveSection] = useState('intro');
    const activeSectionRef = useRef(activeSection);

    useEffect(() => {
        activeSectionRef.current = activeSection;
    }, [activeSection]);

    useEffect(() => {
        let ticking = false;

        const updateActiveSection = () => {
            ticking = false;
            const nextSection = getActiveSectionFromScroll();
            if (nextSection !== activeSectionRef.current) {
                setActiveSection(nextSection);
            }
        };

        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(updateActiveSection);
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        updateActiveSection();

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    const scrollToSection = useCallback((sectionId: string) => {
        const element = document.querySelector(
            `[data-section="${sectionId}"]`
        );
        if (!element) return;

        const offsetTop =
            element.getBoundingClientRect().top +
            window.scrollY -
            getMobileNavOffset();

        window.scrollTo({
            top: Math.max(0, offsetTop),
            behavior: window.matchMedia('(max-width: 767px)').matches
                ? 'auto'
                : 'smooth',
        });
        setActiveSection(sectionId);
    }, []);

    return (
        <nav aria-label="On this page">
            <div
                id={MOBILE_NAV_ID}
                className="fixed inset-x-0 top-0 z-[100] border-b border-border bg-background pt-[env(safe-area-inset-top,0px)] md:hidden"
                style={{ transform: 'translateZ(0)' }}
            >
                <div className="flex gap-1 overflow-x-auto overscroll-x-contain px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [touch-action:pan-x] [&::-webkit-scrollbar]:hidden">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            type="button"
                            onClick={() => scrollToSection(section.id)}
                            className={cn(
                                'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                                activeSection === section.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            {section.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="fixed top-1/2 left-6 z-40 hidden w-36 -translate-y-1/2 md:block lg:left-8">
                <div className="relative ml-1.5 border-l border-border">
                    {sections.map((section) => {
                        const isActive = activeSection === section.id;
                        return (
                            <button
                                key={section.id}
                                type="button"
                                onClick={() => scrollToSection(section.id)}
                                className={cn(
                                    'relative flex w-full items-center py-2 pl-5 text-left text-sm transition-colors',
                                    isActive
                                        ? 'font-medium text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <span
                                    className={cn(
                                        'absolute top-1/2 -left-[5px] size-2.5 -translate-y-1/2 rounded-full border border-primary transition-all',
                                        isActive
                                            ? 'bg-primary'
                                            : 'bg-background'
                                    )}
                                />
                                {section.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}

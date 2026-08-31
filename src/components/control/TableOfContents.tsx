import { useCallback, useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

const sections = [
    { id: 'intro', label: 'Home' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'projects', label: 'Projects' },
    { id: 'random-stuff', label: 'Random' },
];

export default function TableOfContents() {
    const [activeSection, setActiveSection] = useState('intro');

    useEffect(() => {
        const handleScroll = () => {
            const sectionElements = sections
                .map((section) =>
                    document.querySelector(`[data-section="${section.id}"]`)
                )
                .filter((el): el is Element => Boolean(el));

            if (sectionElements.length === 0) return;

            const scrollPosition = window.scrollY + window.innerHeight / 3;
            let currentSection = 'intro';

            for (let i = 0; i < sectionElements.length; i++) {
                const section = sectionElements[i];
                const htmlSection = section as HTMLElement;
                const sectionTop = htmlSection.offsetTop;
                const sectionBottom = sectionTop + htmlSection.offsetHeight;

                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    currentSection = section.getAttribute('data-section') ?? 'intro';
                    break;
                }

                if (i === sectionElements.length - 1 && scrollPosition >= sectionTop) {
                    currentSection = section.getAttribute('data-section') ?? 'intro';
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

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = useCallback((sectionId: string) => {
        const element = document.querySelector(`[data-section="${sectionId}"]`);
        if (element) {
            const offsetTop = (element as HTMLElement).offsetTop - 88;
            window.scrollTo({
                top: Math.max(0, offsetTop),
                behavior: 'smooth',
            });
            setActiveSection(sectionId);
        }
    }, []);

    return (
        <nav aria-label="On this page" className="z-40">
            <div className="fixed top-0 right-0 left-0 border-b border-border/80 bg-background/80 px-4 py-3 backdrop-blur-md md:hidden">
                <div className="flex gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

            <div className="fixed top-1/2 left-6 hidden w-36 -translate-y-1/2 md:block lg:left-8">
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

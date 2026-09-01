import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

const sections = [
    { id: 'intro', label: 'Home' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'projects', label: 'Projects' },
    { id: 'random-stuff', label: 'Random Stuff' },
] as const;

const DESKTOP_SCROLL_OFFSET = 40;
const SCROLL_SPY_LOCK_MS = 900;
const DESKTOP_MEDIA_QUERY = '(min-width: 768px)';

function isDesktopViewport() {
    return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
}

function getScrollSpyRootMargin() {
    // Shrink the viewport to a horizontal band so only one section is "active".
    return '-40% 0px -55% 0px';
}

function getSectionElements() {
    return sections
        .map(({ id }) =>
            document.querySelector(
                `[data-section="${id}"]`
            ) as HTMLElement | null
        )
        .filter((element): element is HTMLElement => element !== null);
}

function getTrailingSectionActive(): string | null {
    const lastSection = sections[sections.length - 1];
    const lastElement = document.querySelector(
        `[data-section="${lastSection.id}"]`
    ) as HTMLElement | null;
    if (!lastElement) return null;

    const rect = lastElement.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
        return null;
    }

    const scrollHeight = document.documentElement.scrollHeight;
    const maxScrollY = scrollHeight - window.innerHeight;
    const activationLine = window.innerHeight * 0.55;

    // Short last sections often never intersect the middle IO band at page bottom.
    if (maxScrollY > 48 && window.scrollY >= maxScrollY - 48) {
        return lastSection.id;
    }

    // Activate once the last section heading enters the lower viewport.
    if (rect.top <= activationLine) {
        return lastSection.id;
    }

    return null;
}

export default function TableOfContents() {
    const [activeSection, setActiveSection] = useState('intro');
    const activeSectionRef = useRef(activeSection);
    const scrollSpyLockRef = useRef<string | null>(null);
    const scrollSpyLockTimerRef = useRef<number | null>(null);

    useEffect(() => {
        activeSectionRef.current = activeSection;
    }, [activeSection]);

    useEffect(() => {
        const visibleSections = new Set<string>();
        let observer: IntersectionObserver | null = null;

        const pickActiveSection = () => {
            if (scrollSpyLockRef.current) {
                return scrollSpyLockRef.current;
            }

            const trailingSection = getTrailingSectionActive();
            if (trailingSection) {
                return trailingSection;
            }

            if (visibleSections.size === 0) {
                return activeSectionRef.current;
            }

            // Last intersecting section in document order wins (standard scroll-spy rule).
            let currentSection: string = sections[0].id;
            for (const section of sections) {
                if (visibleSections.has(section.id)) {
                    currentSection = section.id;
                }
            }

            return currentSection;
        };

        const syncActiveSection = () => {
            if (!isDesktopViewport()) return;

            const nextSection = pickActiveSection();
            if (nextSection !== activeSectionRef.current) {
                setActiveSection(nextSection);
            }
        };

        const mountObserver = () => {
            observer?.disconnect();
            visibleSections.clear();

            if (!isDesktopViewport()) return;

            const sectionElements = getSectionElements();
            if (sectionElements.length === 0) return;

            observer = new IntersectionObserver(
                (entries) => {
                    for (const entry of entries) {
                        const sectionId = entry.target.getAttribute(
                            'data-section'
                        );
                        if (!sectionId) continue;

                        if (entry.isIntersecting) {
                            visibleSections.add(sectionId);
                        } else {
                            visibleSections.delete(sectionId);
                        }
                    }

                    syncActiveSection();
                },
                {
                    rootMargin: getScrollSpyRootMargin(),
                    threshold: 0,
                }
            );

            sectionElements.forEach((element) => observer?.observe(element));
            syncActiveSection();
        };

        mountObserver();

        let scrollTicking = false;
        const onScroll = () => {
            if (!scrollTicking) {
                scrollTicking = true;
                requestAnimationFrame(() => {
                    scrollTicking = false;
                    syncActiveSection();
                });
            }
        };

        const onViewportChange = () => {
            mountObserver();
            syncActiveSection();
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onViewportChange, { passive: true });
        window
            .matchMedia(DESKTOP_MEDIA_QUERY)
            .addEventListener('change', onViewportChange);

        return () => {
            observer?.disconnect();
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onViewportChange);
            window
                .matchMedia(DESKTOP_MEDIA_QUERY)
                .removeEventListener('change', onViewportChange);
        };
    }, []);

    const lockScrollSpy = useCallback((sectionId: string) => {
        scrollSpyLockRef.current = sectionId;

        if (scrollSpyLockTimerRef.current !== null) {
            window.clearTimeout(scrollSpyLockTimerRef.current);
        }

        scrollSpyLockTimerRef.current = window.setTimeout(() => {
            scrollSpyLockRef.current = null;
            scrollSpyLockTimerRef.current = null;
        }, SCROLL_SPY_LOCK_MS);
    }, []);

    const scrollToSection = useCallback(
        (sectionId: string) => {
            const element = document.querySelector(
                `[data-section="${sectionId}"]`
            );
            if (!element) return;

            setActiveSection(sectionId);
            lockScrollSpy(sectionId);

            const offsetTop =
                element.getBoundingClientRect().top +
                window.scrollY -
                DESKTOP_SCROLL_OFFSET;

            window.scrollTo({
                top: Math.max(0, offsetTop),
                behavior: 'smooth',
            });

            const releaseScrollSpyLock = () => {
                scrollSpyLockRef.current = null;
                if (scrollSpyLockTimerRef.current !== null) {
                    window.clearTimeout(scrollSpyLockTimerRef.current);
                    scrollSpyLockTimerRef.current = null;
                }
            };

            if ('onscrollend' in window) {
                window.addEventListener('scrollend', releaseScrollSpyLock, {
                    once: true,
                });
            }
        },
        [lockScrollSpy]
    );

    useEffect(() => {
        return () => {
            if (scrollSpyLockTimerRef.current !== null) {
                window.clearTimeout(scrollSpyLockTimerRef.current);
            }
        };
    }, []);

    return (
        <nav aria-label="On this page">
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

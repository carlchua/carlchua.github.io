import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type KeyboardEvent,
    type TransitionEvent,
} from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import PaperAnimal, { animalDict } from '@/components/game/PaperAnimal';
import PaperButton from '@/components/game/PaperButton';
import { Section, SectionHeading } from '@/components/content/Section';
import { cn } from '@/lib/utils';

type AnimalName = keyof typeof animalDict;

type SpawnedAnimal = {
    id: number;
    name: AnimalName;
    x_pos: number;
    y_pos: number;
};

type SpotlightItem =
    | { id: string; label: string; kind: 'paper' }
    | {
          id: string;
          label: string;
          kind: 'link';
          to: string;
          image?: string | { light: string; dark: string };
      };

const ITEMS: SpotlightItem[] = [
    { id: 'paper', label: 'Paper', kind: 'paper' },
    {
        id: 'chord',
        label: 'Chord Finder',
        kind: 'link',
        to: '/chord-finder',
        image: '/assets/images/guitar.png',
    },
    {
        id: 'pdf',
        label: 'PDF Tool',
        kind: 'link',
        to: '/pdf-tool',
        image: '/assets/images/document.png',
    },
    {
        id: 'music-box',
        label: 'Music Box',
        kind: 'link',
        to: '/music-box',
        image: {
            light: '/assets/images/harmony.png',
            dark: '/assets/images/harmony_dark.png',
        },
    },
];

function resolveItemImage(
    image: NonNullable<Extract<SpotlightItem, { kind: 'link' }>['image']>,
    darkMode: boolean
) {
    return typeof image === 'string'
        ? image
        : darkMode
          ? image.dark
          : image.light;
}

const SPOTLIGHT_QUERY =
    '(hover: hover) and (pointer: fine) and (min-width: 768px)';

function wrap(index: number, length: number) {
    return ((index % length) + length) % length;
}

function useSpotlightMode() {
    const [spotlight, setSpotlight] = useState(() =>
        window.matchMedia(SPOTLIGHT_QUERY).matches
    );

    useEffect(() => {
        const media = window.matchMedia(SPOTLIGHT_QUERY);
        const update = () => setSpotlight(media.matches);
        update();
        media.addEventListener('change', update);
        return () => media.removeEventListener('change', update);
    }, []);

    return spotlight;
}

function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(() =>
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReduced(media.matches);
        update();
        media.addEventListener('change', update);
        return () => media.removeEventListener('change', update);
    }, []);

    return reduced;
}

function ItemFace({
    item,
    interactive,
    darkMode,
    onSpawn,
}: {
    item: SpotlightItem;
    interactive: boolean;
    darkMode: boolean;
    onSpawn: (coords: { x_pos: number; y_pos: number }) => void;
}) {
    const shell =
        'flex h-52 w-full flex-col items-center justify-center px-4 text-center';

    if (item.kind === 'paper') {
        return (
            <div
                className={cn(
                    shell,
                    '[&_.paper-button]:size-36 [&_.paper-sprite]:size-36'
                )}
            >
                {interactive ? (
                    <PaperButton onSpawn={onSpawn} />
                ) : (
                    <img
                        src="/assets/game/paper/paper_0.png"
                        alt=""
                        className="size-36"
                        draggable={false}
                    />
                )}
            </div>
        );
    }

    const className = cn(
        shell,
        'gap-3 text-foreground',
        interactive &&
            'transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring'
    );

    const content = item.image ? (
        <>
            <img
                src={resolveItemImage(item.image, darkMode)}
                alt=""
                className={cn(
                    'h-28 w-auto object-contain',
                    item.id === 'chord' && '[image-rendering:pixelated]'
                )}
                draggable={false}
            />
            <span className="font-heading text-xl leading-tight font-semibold tracking-tight text-balance underline-offset-4 group-hover/item:underline">
                {item.label}
            </span>
        </>
    ) : (
        <span className="font-heading text-[1.65rem] leading-tight font-semibold tracking-tight text-balance underline-offset-4 group-hover/item:underline">
            {item.label}
        </span>
    );

    if (!interactive) {
        return <div className={className}>{content}</div>;
    }

    return (
        <Link to={item.to} className={cn(className, 'group/item')}>
            {content}
        </Link>
    );
}

function Dots({
    active,
    onSelect,
}: {
    active: number;
    onSelect: (index: number) => void;
}) {
    return (
        <div className="mt-5 flex items-center justify-center gap-2">
            {ITEMS.map((item, index) => (
                <button
                    key={item.id}
                    type="button"
                    aria-label={`Show ${item.label}`}
                    aria-current={index === active ? 'true' : undefined}
                    onClick={() => onSelect(index)}
                    className={cn(
                        'h-1.5 rounded-full transition-all',
                        index === active
                            ? 'w-4 bg-primary'
                            : 'w-1.5 bg-foreground/25 hover:bg-foreground/50'
                    )}
                />
            ))}
        </div>
    );
}

function DesktopSpotlight({
    active,
    onActive,
    darkMode,
    onSpawn,
}: {
    active: number;
    onActive: (index: number) => void;
    darkMode: boolean;
    onSpawn: (coords: { x_pos: number; y_pos: number }) => void;
}) {
    const count = ITEMS.length;
    const reduceMotion = usePrefersReducedMotion();
    const stageRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef(count + active);
    const pendingFrameRef = useRef<number | null>(null);
    const [cursor, setCursor] = useState(count + active);
    const [instant, setInstant] = useState(false);
    const [reveal, setReveal] = useState<-1 | 0 | 1>(0);
    const [stageWidth, setStageWidth] = useState(0);

    useEffect(() => {
        cursorRef.current = cursor;
    }, [cursor]);

    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;
        const update = () => setStageWidth(stage.clientWidth);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(stage);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        return () => {
            if (pendingFrameRef.current != null) {
                cancelAnimationFrame(pendingFrameRef.current);
            }
        };
    }, []);

    const cancelPendingNav = useCallback(() => {
        if (pendingFrameRef.current == null) return;
        cancelAnimationFrame(pendingFrameRef.current);
        pendingFrameRef.current = null;
    }, []);

    // Keep the track in the middle clone band. Rapid clicks otherwise walk
    // past the cloned slides and briefly show an empty stage.
    const middleCursor = useCallback(
        (value: number) => wrap(value, count) + count,
        [count]
    );

    const snapTo = useCallback((value: number) => {
        cursorRef.current = value;
        setInstant(true);
        setCursor(value);
        pendingFrameRef.current = requestAnimationFrame(() => {
            pendingFrameRef.current = requestAnimationFrame(() => {
                pendingFrameRef.current = null;
                setInstant(false);
            });
        });
    }, []);

    const animateTo = useCallback(
        (to: number) => {
            cancelPendingNav();
            setReveal(0);

            const raw = cursorRef.current;
            const from = middleCursor(raw);
            const needsRebase = raw !== from;

            const commit = () => {
                cursorRef.current = to;
                setCursor(to);
                onActive(wrap(to, count));
            };

            if (needsRebase) {
                cursorRef.current = from;
                setInstant(true);
                setCursor(from);
                pendingFrameRef.current = requestAnimationFrame(() => {
                    pendingFrameRef.current = requestAnimationFrame(() => {
                        pendingFrameRef.current = null;
                        setInstant(false);
                        commit();
                    });
                });
                return;
            }

            if (instant) {
                setInstant(false);
            }
            commit();
        },
        [cancelPendingNav, count, instant, middleCursor, onActive]
    );

    const goTo = useCallback(
        (index: number) => {
            const current = wrap(cursorRef.current, count);
            if (current === index) return;
            const from = middleCursor(cursorRef.current);
            const forward = wrap(index - current, count);
            const backward = wrap(current - index, count);
            const to =
                forward <= backward ? from + forward : from - backward;
            animateTo(to);
        },
        [animateTo, count, middleCursor]
    );

    const step = useCallback(
        (direction: -1 | 1) => {
            const from = middleCursor(cursorRef.current);
            animateTo(from + direction);
        },
        [animateTo, middleCursor]
    );

    const normalizeCursor = useCallback(() => {
        const current = cursorRef.current;
        if (current >= count && current < count * 2) return;
        cancelPendingNav();
        snapTo(middleCursor(current));
    }, [cancelPendingNav, count, middleCursor, snapTo]);

    const onTrackTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
        if (
            event.propertyName !== 'transform' ||
            event.target !== event.currentTarget
        ) {
            return;
        }
        normalizeCursor();
    };

    useEffect(() => {
        if (!reduceMotion) return;
        normalizeCursor();
    }, [cursor, normalizeCursor, reduceMotion]);

    const slideWidth = stageWidth
        ? Math.round(
              Math.min(210, Math.max(168, (stageWidth - 96) * 0.36))
          )
        : 190;
    const stride = Math.round(slideWidth * 0.98);
    const x = stageWidth / 2 - slideWidth / 2 - cursor * stride;
    const slides = [...ITEMS, ...ITEMS, ...ITEMS];
    const logical = wrap(cursor, count);
    const previousLabel = ITEMS[wrap(logical - 1, count)].label;
    const nextLabel = ITEMS[wrap(logical + 1, count)].label;

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            step(-1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            step(1);
        }
    };

    return (
        <div
            role="region"
            aria-roledescription="carousel"
            aria-label="Random stuff"
            onKeyDown={onKeyDown}
        >
            <div ref={stageRef} className="relative h-72 overflow-hidden">
                <div className="absolute inset-0">
                    <div
                        className="absolute top-1/2 left-0 flex items-center"
                        style={{
                            gap: stride - slideWidth,
                            transform: `translate3d(${x}px, -50%, 0)`,
                            transition:
                                instant || reduceMotion || stageWidth === 0
                                    ? 'none'
                                    : 'transform 560ms cubic-bezier(0.22, 1, 0.36, 1)',
                            opacity: stageWidth === 0 ? 0 : 1,
                        }}
                        onTransitionEnd={onTrackTransitionEnd}
                    >
                        {slides.map((item, index) => {
                            const distance = index - cursor;
                            const isCenter = distance === 0;
                            const isNeighbor = Math.abs(distance) === 1;
                            const isRevealed =
                                (reveal === -1 && distance === -1) ||
                                (reveal === 1 && distance === 1);
                            const scale = isCenter
                                ? 1
                                : isRevealed
                                  ? 0.9
                                  : 0.74;
                            const opacity = isCenter
                                ? 1
                                : isRevealed
                                  ? 1
                                  : isNeighbor
                                    ? 0.55
                                    : 0;

                            return (
                                <div
                                    key={`${item.id}-${index}`}
                                    aria-hidden={!isCenter}
                                    className="relative shrink-0"
                                    style={{
                                        width: slideWidth,
                                        transform: `scale(${scale})`,
                                        opacity,
                                        zIndex: isCenter ? 3 : isRevealed ? 2 : 1,
                                        pointerEvents: isCenter ? 'auto' : 'none',
                                        transition:
                                            instant || reduceMotion
                                                ? 'none'
                                                : 'transform 560ms cubic-bezier(0.22, 1, 0.36, 1), opacity 420ms ease',
                                    }}
                                >
                                    <ItemFace
                                        item={item}
                                        interactive={isCenter}
                                        darkMode={darkMode}
                                        onSpawn={onSpawn}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
                <SideControl
                    direction={-1}
                    label={`Show ${previousLabel}`}
                    inset={slideWidth / 2}
                    onPreview={() => setReveal(-1)}
                    onClear={() => setReveal(0)}
                    onCommit={() => step(-1)}
                />
                <SideControl
                    direction={1}
                    label={`Show ${nextLabel}`}
                    inset={slideWidth / 2}
                    onPreview={() => setReveal(1)}
                    onClear={() => setReveal(0)}
                    onCommit={() => step(1)}
                />
            </div>
            <p className="sr-only" aria-live="polite">
                Showing {ITEMS[logical].label}
            </p>
            <Dots active={logical} onSelect={goTo} />
        </div>
    );
}

function SideControl({
    direction,
    label,
    inset,
    onPreview,
    onClear,
    onCommit,
}: {
    direction: -1 | 1;
    label: string;
    inset: number;
    onPreview: () => void;
    onClear: () => void;
    onCommit: () => void;
}) {
    const Icon = direction === -1 ? ChevronLeft : ChevronRight;

    return (
        <button
            type="button"
            aria-label={label}
            className={cn(
                'group absolute inset-y-0 z-20 flex items-center',
                direction === -1
                    ? 'left-0 justify-start pl-0.5'
                    : 'right-0 justify-end pr-0.5'
            )}
            style={{ width: `calc(50% - ${inset}px)` }}
            onMouseEnter={onPreview}
            onMouseLeave={onClear}
            onFocus={onPreview}
            onBlur={onClear}
            onClick={onCommit}
        >
            <span className="flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground/70 ring-1 ring-foreground/10 backdrop-blur-sm transition group-hover:bg-card group-hover:text-foreground group-focus-visible:ring-ring">
                <Icon className="size-5" aria-hidden />
            </span>
        </button>
    );
}

function MobileReel({
    active,
    onActive,
    darkMode,
    onSpawn,
}: {
    active: number;
    onActive: (index: number) => void;
    darkMode: boolean;
    onSpawn: (coords: { x_pos: number; y_pos: number }) => void;
}) {
    const count = ITEMS.length;
    const slides = [...ITEMS, ...ITEMS, ...ITEMS];
    const scrollerRef = useRef<HTMLDivElement>(null);
    const activeRef = useRef(active);
    const suppressNormalizeRef = useRef(false);
    const scrollEndTimerRef = useRef<number | null>(null);
    const reduceMotion = usePrefersReducedMotion();
    const [frame, setFrame] = useState({ item: 260, pad: 24 });
    const itemGap = 12;

    useEffect(() => {
        activeRef.current = active;
    }, [active]);

    const scrollToClone = useCallback(
        (cloneIndex: number, behavior: ScrollBehavior) => {
            const root = scrollerRef.current;
            const node = root?.querySelector<HTMLElement>(
                `[data-clone="${cloneIndex}"]`
            );
            if (!root || !node) return;
            const left =
                node.offsetLeft - (root.clientWidth - node.clientWidth) / 2;
            root.scrollTo({ left, behavior });
        },
        []
    );

    const scrollToLogical = useCallback(
        (logicalIndex: number, behavior: ScrollBehavior) => {
            scrollToClone(count + logicalIndex, behavior);
        },
        [count, scrollToClone]
    );

    const closestCloneIndex = useCallback(() => {
        const root = scrollerRef.current;
        if (!root) return count;
        const center = root.scrollLeft + root.clientWidth / 2;
        let bestIndex = count;
        let bestDistance = Number.POSITIVE_INFINITY;

        root.querySelectorAll<HTMLElement>('[data-clone]').forEach((node) => {
            const cloneIndex = Number(node.dataset.clone);
            const nodeCenter = node.offsetLeft + node.clientWidth / 2;
            const distance = Math.abs(nodeCenter - center);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestIndex = cloneIndex;
            }
        });

        return bestIndex;
    }, [count]);

    const measureActive = useCallback(() => {
        const bestIndex = closestCloneIndex();
        const logical = wrap(bestIndex, count);
        if (logical !== activeRef.current) {
            onActive(logical);
        }
        return bestIndex;
    }, [closestCloneIndex, count, onActive]);

    const normalizeLoop = useCallback(() => {
        const root = scrollerRef.current;
        if (!root || suppressNormalizeRef.current) return;

        const bestIndex = closestCloneIndex();
        if (bestIndex >= count && bestIndex < count * 2) {
            measureActive();
            return;
        }

        // Settled on a cloned edge copy — jump to the matching middle copy.
        suppressNormalizeRef.current = true;
        scrollToClone(count + wrap(bestIndex, count), 'auto');
        measureActive();
        requestAnimationFrame(() => {
            suppressNormalizeRef.current = false;
        });
    }, [closestCloneIndex, count, measureActive, scrollToClone]);

    useLayoutEffect(() => {
        const root = scrollerRef.current;
        if (!root) return;

        const measure = () => {
            const view = root.clientWidth;
            if (view === 0) return;
            const item = Math.min(Math.round(view * 0.74), 320);
            const pad = Math.max(0, (view - item) / 2);
            setFrame((current) =>
                Math.abs(current.item - item) < 1 &&
                Math.abs(current.pad - pad) < 1
                    ? current
                    : { item, pad }
            );
        };

        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(root);
        return () => observer.disconnect();
    }, []);

    useLayoutEffect(() => {
        suppressNormalizeRef.current = true;
        scrollToLogical(activeRef.current, 'auto');
        measureActive();
        const frameId = requestAnimationFrame(() => {
            suppressNormalizeRef.current = false;
        });
        return () => cancelAnimationFrame(frameId);
    }, [frame, measureActive, scrollToLogical]);

    useEffect(() => {
        const root = scrollerRef.current;
        if (!root) return;

        const onScroll = () => {
            measureActive();
            if (scrollEndTimerRef.current != null) {
                window.clearTimeout(scrollEndTimerRef.current);
            }
            // Safari may not fire scrollend; debounce as a settle signal.
            scrollEndTimerRef.current = window.setTimeout(() => {
                scrollEndTimerRef.current = null;
                normalizeLoop();
            }, 120);
        };

        const onScrollEnd = () => {
            if (scrollEndTimerRef.current != null) {
                window.clearTimeout(scrollEndTimerRef.current);
                scrollEndTimerRef.current = null;
            }
            normalizeLoop();
        };

        root.addEventListener('scroll', onScroll, { passive: true });
        root.addEventListener('scrollend', onScrollEnd);
        return () => {
            root.removeEventListener('scroll', onScroll);
            root.removeEventListener('scrollend', onScrollEnd);
            if (scrollEndTimerRef.current != null) {
                window.clearTimeout(scrollEndTimerRef.current);
            }
        };
    }, [measureActive, normalizeLoop]);

    return (
        <div>
            <div className="relative">
                <div
                    ref={scrollerRef}
                    className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    style={{
                        gap: itemGap,
                        paddingInline: frame.pad,
                        scrollPaddingInline: frame.pad,
                    }}
                >
                    {slides.map((item, cloneIndex) => {
                        const logical = wrap(cloneIndex, count);
                        return (
                            <div
                                key={`${item.id}-${cloneIndex}`}
                                data-clone={cloneIndex}
                                data-logical={logical}
                                className="shrink-0 snap-center"
                                style={{ width: frame.item }}
                            >
                                <div
                                    className={cn(
                                        'transition duration-300',
                                        logical === active
                                            ? 'scale-100 opacity-100'
                                            : 'scale-[0.94] opacity-50'
                                    )}
                                    style={{
                                        transitionDuration: reduceMotion
                                            ? '0ms'
                                            : undefined,
                                    }}
                                >
                                    <ItemFace
                                        item={item}
                                        interactive
                                        darkMode={darkMode}
                                        onSpawn={onSpawn}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent"
                />
            </div>
            <Dots
                active={active}
                onSelect={(index) => {
                    onActive(index);
                    scrollToLogical(
                        index,
                        reduceMotion ? 'auto' : 'smooth'
                    );
                }}
            />
        </div>
    );
}

function SpotlightCarousel({
    darkMode,
    onSpawn,
}: {
    darkMode: boolean;
    onSpawn: (coords: { x_pos: number; y_pos: number }) => void;
}) {
    const spotlight = useSpotlightMode();
    const [active, setActive] = useState(0);

    return spotlight ? (
        <DesktopSpotlight
            active={active}
            onActive={setActive}
            darkMode={darkMode}
            onSpawn={onSpawn}
        />
    ) : (
        <MobileReel
            active={active}
            onActive={setActive}
            darkMode={darkMode}
            onSpawn={onSpawn}
        />
    );
}

export default function RandomStuff({ darkMode }: { darkMode: boolean }) {
    const [, setPossibleAnimals] = useState<AnimalName[]>(
        Object.keys(animalDict) as AnimalName[]
    );
    const [currentAnimals, setAnimals] = useState<SpawnedAnimal[]>([]);

    const spawnAnimal = useCallback(
        ({ x_pos, y_pos }: { x_pos: number; y_pos: number }) => {
            setPossibleAnimals((prevPossible) => {
                setAnimals((prevAnimals) => {
                    if (prevPossible.length === 0) {
                        return prevAnimals;
                    }

                    const randomIndex = Math.floor(
                        Math.random() * prevPossible.length
                    );
                    const randomAnimal = prevPossible[randomIndex];

                    return [
                        ...prevAnimals,
                        {
                            id: Date.now() + Math.random(),
                            name: randomAnimal,
                            x_pos,
                            y_pos,
                        },
                    ];
                });

                if (prevPossible.length === 0) return prevPossible;

                const randomIndex = Math.floor(
                    Math.random() * prevPossible.length
                );
                const randomAnimal = prevPossible[randomIndex];
                return prevPossible.filter((key) => key !== randomAnimal);
            });
        },
        []
    );

    return (
        <Section id="random-stuff" className="pb-24">
            <SectionHeading>Random Stuff</SectionHeading>
            <SpotlightCarousel darkMode={darkMode} onSpawn={spawnAnimal} />
            {currentAnimals.map((animal) => (
                <PaperAnimal
                    key={animal.id}
                    type={animal.name}
                    x_pos={animal.x_pos}
                    y_pos={animal.y_pos}
                />
            ))}
        </Section>
    );
}

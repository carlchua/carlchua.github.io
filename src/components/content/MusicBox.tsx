import {
    useCallback,
    useEffect,
    useId,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
} from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
    canPlaceNote,
    createNoteId,
    hasFlag,
    hasStem,
    isFilledNotehead,
    midiToNoteName,
    midiToStaffIndex,
    rangesOverlap,
    snapBeat,
    STAFF_BOTTOM_LINE,
    STAFF_LINE_INDICES,
    STAFF_TOP_LINE,
    staffIndexToMidi,
} from '@/lib/music-box/notes';
import {
    disposePlayback,
    playScore,
    stopPlayback,
    type PlayMode,
} from '@/lib/music-box/playback';
import {
    BARS,
    BEATS_PER_BAR,
    DEFAULT_BPM,
    NOTE_DURATIONS,
    PART_META,
    STAFF_STEP_COUNT,
    TIME_SIGNATURE,
    TOTAL_BEATS,
    type PartId,
    type ScoreNote,
} from '@/lib/music-box/types';
import { cn } from '@/lib/utils';

type GhostNote = {
    part: PartId;
    midi: number;
    startBeat: number;
    durationBeats: number;
    valid: boolean;
};

/** Geometry for a MuseScore-like treble staff in local SVG units. */
const STAFF = {
    width: 920,
    height: 120,
    leftPad: 72,
    rightPad: 16,
    topPad: 28,
    /** Distance between adjacent staff lines (two diatonic steps). */
    lineGap: 10,
} as const;

const CONTENT_WIDTH = STAFF.width - STAFF.leftPad - STAFF.rightPad;
const STEP_GAP = STAFF.lineGap / 2;
const BOTTOM_LINE_Y =
    STAFF.topPad + (STAFF_TOP_LINE - STAFF_BOTTOM_LINE) * STEP_GAP;

function staffIndexToY(index: number): number {
    return BOTTOM_LINE_Y - (index - STAFF_BOTTOM_LINE) * STEP_GAP;
}

function beatToX(beat: number): number {
    return STAFF.leftPad + (beat / TOTAL_BEATS) * CONTENT_WIDTH;
}

function pointerToPlacement(
    clientX: number,
    clientY: number,
    svg: SVGSVGElement,
    durationBeats: number
) {
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const local = point.matrixTransform(svg.getScreenCTM()?.inverse());
    const x = Math.min(
        Math.max(local.x, STAFF.leftPad),
        STAFF.width - STAFF.rightPad
    );
    const y = Math.min(Math.max(local.y, 8), STAFF.height - 8);
    const rawBeat = ((x - STAFF.leftPad) / CONTENT_WIDTH) * TOTAL_BEATS;
    const startBeat = snapBeat(rawBeat, durationBeats);
    const staffIndex = Math.round(
        STAFF_BOTTOM_LINE + (BOTTOM_LINE_Y - y) / STEP_GAP
    );
    const clampedIndex = Math.max(
        0,
        Math.min(STAFF_STEP_COUNT - 1, staffIndex)
    );
    return {
        midi: staffIndexToMidi(clampedIndex),
        startBeat,
    };
}

function DurationGlyph({
    durationBeats,
    className,
}: {
    durationBeats: number;
    className?: string;
}) {
    const filled = isFilledNotehead(durationBeats);
    const stem = hasStem(durationBeats);
    const flag = hasFlag(durationBeats);

    return (
        <svg
            viewBox="0 0 28 36"
            className={cn('size-8', className)}
            aria-hidden
        >
            <ellipse
                cx="10"
                cy="26"
                rx="7"
                ry="5"
                transform="rotate(-18 10 26)"
                className={filled ? 'fill-current' : 'fill-none stroke-current'}
                strokeWidth={filled ? 0 : 1.6}
            />
            {stem ? (
                <path
                    d="M16.5 24 V8"
                    className="stroke-current"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                />
            ) : null}
            {flag ? (
                <path
                    d="M16.5 8 C22 10 24 14 22 18 C20 15 18 13 16.5 12"
                    className="fill-current"
                />
            ) : null}
        </svg>
    );
}

function NoteGlyph({
    durationBeats,
    x,
    y,
    muted,
    selected,
}: {
    durationBeats: number;
    x: number;
    y: number;
    muted?: boolean;
    selected?: boolean;
}) {
    const filled = isFilledNotehead(durationBeats);
    const stem = hasStem(durationBeats);
    const flag = hasFlag(durationBeats);
    // Stem up when note is on or below the middle line (B4).
    const staffIndexApprox = (BOTTOM_LINE_Y - y) / STEP_GAP + STAFF_BOTTOM_LINE;
    const up = staffIndexApprox <= 6;

    return (
        <g
            className={cn(
                selected && 'text-primary',
                muted && 'opacity-45'
            )}
        >
            <ellipse
                cx={x}
                cy={y}
                rx={7}
                ry={5}
                transform={`rotate(${up ? -20 : 20} ${x} ${y})`}
                className={
                    filled
                        ? 'fill-current'
                        : 'fill-[var(--card)] stroke-current'
                }
                strokeWidth={filled ? 0 : 1.5}
            />
            {stem ? (
                <line
                    x1={up ? x + 6.2 : x - 6.2}
                    y1={y}
                    x2={up ? x + 6.2 : x - 6.2}
                    y2={up ? y - 28 : y + 28}
                    className="stroke-current"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
            ) : null}
            {flag && up ? (
                <path
                    d={`M${x + 6.2} ${y - 28} C${x + 16} ${y - 24} ${x + 18} ${y - 16} ${x + 14} ${y - 10} C${x + 12} ${y - 16} ${x + 9} ${y - 20} ${x + 6.2} ${y - 22}`}
                    className="fill-current"
                />
            ) : null}
            {flag && !up ? (
                <path
                    d={`M${x - 6.2} ${y + 28} C${x - 16} ${y + 24} ${x - 18} ${y + 16} ${x - 14} ${y + 10} C${x - 12} ${y + 16} ${x - 9} ${y + 20} ${x - 6.2} ${y + 22}`}
                    className="fill-current"
                />
            ) : null}
        </g>
    );
}

function LedgerLines({ midi }: { midi: number }) {
    const index = midiToStaffIndex(midi);
    const ledgerIndices: number[] = [];

    // Staff lines sit on even indices 2..10; ledger lines continue that pattern.
    if (index < STAFF_BOTTOM_LINE) {
        for (let i = STAFF_BOTTOM_LINE - 2; i >= index; i -= 2) {
            ledgerIndices.push(i);
        }
    }
    if (index > STAFF_TOP_LINE) {
        for (let i = STAFF_TOP_LINE + 2; i <= index; i += 2) {
            ledgerIndices.push(i);
        }
    }

    return (
        <>
            {ledgerIndices.map((ledgerIndex) => (
                <line
                    key={ledgerIndex}
                    x1={-11}
                    x2={11}
                    y1={staffIndexToY(ledgerIndex)}
                    y2={staffIndexToY(ledgerIndex)}
                    className="stroke-foreground/70"
                    strokeWidth="1.2"
                />
            ))}
        </>
    );
}

function StaffScore({
    part,
    notes,
    ghost,
    selectedNoteId,
    selectedDuration,
    onPlace,
    onSelectNote,
    onGhost,
}: {
    part: PartId;
    notes: ScoreNote[];
    ghost: GhostNote | null;
    selectedNoteId: string | null;
    selectedDuration: number;
    onPlace: (midi: number, startBeat: number) => boolean;
    onSelectNote: (id: string | null) => void;
    onGhost: (ghost: GhostNote | null) => void;
}) {
    const svgRef = useRef<SVGSVGElement>(null);
    const clipId = useId();
    const meta = PART_META[part];
    const partNotes = notes.filter((note) => note.part === part);

    const updateFromPointer = (
        event: ReactPointerEvent<SVGSVGElement>,
        commit: boolean
    ) => {
        const svg = svgRef.current;
        if (!svg) return;
        const placement = pointerToPlacement(
            event.clientX,
            event.clientY,
            svg,
            selectedDuration
        );
        const valid = canPlaceNote(
            notes,
            part,
            placement.startBeat,
            selectedDuration,
            placement.midi
        ).ok;
        onGhost({
            part,
            midi: placement.midi,
            startBeat: placement.startBeat,
            durationBeats: selectedDuration,
            valid,
        });
        if (commit) {
            onPlace(placement.midi, placement.startBeat);
        }
    };

    return (
        <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-3 px-1">
                <h2 className="text-sm font-medium text-muted-foreground">
                    {meta.label}
                </h2>
            </div>
            <svg
                ref={svgRef}
                viewBox={`0 0 ${STAFF.width} ${STAFF.height}`}
                className="w-full cursor-crosshair text-foreground select-none"
                role="img"
                aria-label={`${meta.label} staff in ${TIME_SIGNATURE}`}
                onPointerMove={(event) => updateFromPointer(event, false)}
                onPointerLeave={() => onGhost(null)}
                onPointerDown={(event) => {
                    if (event.button !== 0) return;
                    const target = event.target as Element;
                    if (target.closest('[data-note-id]')) return;
                    updateFromPointer(event, true);
                    onSelectNote(null);
                }}
            >
                <defs>
                    <clipPath id={clipId}>
                        <rect
                            x={STAFF.leftPad - 8}
                            y={0}
                            width={CONTENT_WIDTH + 16}
                            height={STAFF.height}
                        />
                    </clipPath>
                </defs>

                {/* staff lines */}
                {STAFF_LINE_INDICES.map((index) => (
                    <line
                        key={index}
                        x1={STAFF.leftPad - 36}
                        x2={STAFF.width - STAFF.rightPad}
                        y1={staffIndexToY(index)}
                        y2={staffIndexToY(index)}
                        className="stroke-foreground/70"
                        strokeWidth="1.15"
                    />
                ))}

                {/* clef */}
                <text
                    x={18}
                    y={staffIndexToY(6) + 10}
                    className="fill-foreground font-heading"
                    fontSize="54"
                >
                    𝄞
                </text>

                {/* Fixed 4/4 time signature */}
                <g className="fill-foreground font-heading">
                    <text
                        x={STAFF.leftPad - 22}
                        y={staffIndexToY(8) + 5}
                        textAnchor="middle"
                        fontSize="22"
                        fontWeight="600"
                    >
                        4
                    </text>
                    <text
                        x={STAFF.leftPad - 22}
                        y={staffIndexToY(4) + 5}
                        textAnchor="middle"
                        fontSize="22"
                        fontWeight="600"
                    >
                        4
                    </text>
                </g>

                {/* barlines */}
                {Array.from({ length: BARS + 1 }, (_, index) => {
                    const x = beatToX(index * BEATS_PER_BAR);
                    const final = index === BARS;
                    return (
                        <line
                            key={index}
                            x1={x}
                            x2={x}
                            y1={staffIndexToY(STAFF_TOP_LINE)}
                            y2={staffIndexToY(STAFF_BOTTOM_LINE)}
                            className="stroke-foreground/75"
                            strokeWidth={final ? 2.2 : 1.2}
                        />
                    );
                })}
                {/* final double bar */}
                <line
                    x1={beatToX(TOTAL_BEATS) + 4}
                    x2={beatToX(TOTAL_BEATS) + 4}
                    y1={staffIndexToY(STAFF_TOP_LINE)}
                    y2={staffIndexToY(STAFF_BOTTOM_LINE)}
                    className="stroke-foreground/75"
                    strokeWidth="1.2"
                />

                {/* faint beat ticks inside measures */}
                <g className="stroke-foreground/10" strokeWidth="1">
                    {Array.from({ length: TOTAL_BEATS }, (_, beat) => {
                        if (beat % BEATS_PER_BAR === 0) return null;
                        const x = beatToX(beat);
                        return (
                            <line
                                key={beat}
                                x1={x}
                                x2={x}
                                y1={staffIndexToY(STAFF_TOP_LINE)}
                                y2={staffIndexToY(STAFF_BOTTOM_LINE)}
                            />
                        );
                    })}
                </g>

                <g clipPath={`url(#${clipId})`}>
                    {partNotes.map((note) => {
                        const x = beatToX(note.startBeat) + 14;
                        const y = staffIndexToY(midiToStaffIndex(note.midi));
                        const selected = note.id === selectedNoteId;
                        return (
                            <g
                                key={note.id}
                                data-note-id={note.id}
                                className="cursor-pointer"
                                onPointerDown={(event) => {
                                    event.stopPropagation();
                                    onSelectNote(note.id);
                                }}
                                style={{ color: 'currentColor' }}
                            >
                                <title>
                                    {midiToNoteName(note.midi)} · click to
                                    select, Delete to remove
                                </title>
                                <g transform={`translate(${x} 0)`}>
                                    <LedgerLines midi={note.midi} />
                                </g>
                                <NoteGlyph
                                    durationBeats={note.durationBeats}
                                    x={x}
                                    y={y}
                                    selected={selected}
                                />
                                {/* wider hit target */}
                                <rect
                                    x={x - 12}
                                    y={y - 32}
                                    width={28}
                                    height={48}
                                    className="fill-transparent"
                                />
                            </g>
                        );
                    })}

                    {ghost && ghost.part === part ? (
                        <g
                            className={
                                ghost.valid
                                    ? 'text-foreground'
                                    : 'text-destructive'
                            }
                        >
                            <g
                                transform={`translate(${beatToX(ghost.startBeat) + 14} 0)`}
                            >
                                <LedgerLines midi={ghost.midi} />
                            </g>
                            <NoteGlyph
                                durationBeats={ghost.durationBeats}
                                x={beatToX(ghost.startBeat) + 14}
                                y={staffIndexToY(midiToStaffIndex(ghost.midi))}
                                muted
                            />
                        </g>
                    ) : null}
                </g>
            </svg>
        </div>
    );
}

export default function MusicBox() {
    const [notes, setNotes] = useState<ScoreNote[]>([]);
    const [bpm, setBpm] = useState(DEFAULT_BPM);
    const [playing, setPlaying] = useState<PlayMode | null>(null);
    const [ghost, setGhost] = useState<GhostNote | null>(null);
    const [selectedDuration, setSelectedDuration] = useState(1);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const playTimerRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (playTimerRef.current != null) {
                window.clearTimeout(playTimerRef.current);
            }
            disposePlayback();
        };
    }, []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (
                event.target instanceof HTMLElement &&
                (event.target.tagName === 'INPUT' ||
                    event.target.tagName === 'TEXTAREA' ||
                    event.target.isContentEditable)
            ) {
                return;
            }

            const duration = NOTE_DURATIONS.find(
                (item) => item.shortcut === event.key
            );
            if (duration) {
                event.preventDefault();
                setSelectedDuration(duration.durationBeats);
                return;
            }

            if (
                (event.key === 'Backspace' || event.key === 'Delete') &&
                selectedNoteId
            ) {
                event.preventDefault();
                setNotes((current) =>
                    current.filter((note) => note.id !== selectedNoteId)
                );
                setSelectedNoteId(null);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [selectedNoteId]);

    const clearPlayTimer = () => {
        if (playTimerRef.current != null) {
            window.clearTimeout(playTimerRef.current);
            playTimerRef.current = null;
        }
    };

    const placeNote = useCallback(
        (
            part: PartId,
            durationBeats: number,
            midi: number,
            startBeat: number
        ): boolean => {
            let placed = false;
            let reason: string | null = null;

            setNotes((current) => {
                const check = canPlaceNote(
                    current,
                    part,
                    startBeat,
                    durationBeats,
                    midi
                );
                if (!check.ok) {
                    reason = check.reason;
                    return current;
                }

                // Replace same-pitch notes that occupy the same span; keep
                // other chord tones at this onset.
                const nextNotes = current.filter((note) => {
                    if (note.part !== part) return true;
                    if (note.midi !== midi) return true;
                    return !rangesOverlap(
                        startBeat,
                        startBeat + durationBeats,
                        note.startBeat,
                        note.startBeat + note.durationBeats
                    );
                });

                placed = true;
                return [
                    ...nextNotes,
                    {
                        id: createNoteId(),
                        part,
                        midi,
                        startBeat,
                        durationBeats,
                    },
                ];
            });

            setSelectedNoteId(null);
            if (placed) {
                setError(null);
            } else if (reason) {
                setError(reason);
            }
            return placed;
        },
        []
    );

    const handlePlay = async (mode: PlayMode) => {
        if (notes.length === 0) {
            setError('Add some notes first.');
            return;
        }
        const scoped =
            mode === 'both' ? notes : notes.filter((note) => note.part === mode);
        if (scoped.length === 0) {
            setError(
                mode === 'both'
                    ? 'Add some notes first.'
                    : `Add notes to ${PART_META[mode].label} first.`
            );
            return;
        }

        setError(null);
        clearPlayTimer();
        try {
            const endSec = await playScore(notes, bpm, mode);
            setPlaying(mode);
            playTimerRef.current = window.setTimeout(() => {
                setPlaying(null);
                playTimerRef.current = null;
            }, Math.ceil(endSec * 1000) + 120);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Could not start playback.'
            );
            setPlaying(null);
        }
    };

    const handleStop = () => {
        clearPlayTimer();
        stopPlayback();
        setPlaying(null);
    };

    return (
        <div className="pb-16">
            <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
                <Link to="/">← Home</Link>
            </Button>

            <h1 className="font-heading mb-2 text-3xl font-semibold tracking-tight md:text-4xl">
                Music Box
            </h1>
            <p className="mb-6 max-w-2xl text-muted-foreground">
                In Progress
            </p>

            {/* MuseScore-style note input toolbar */}
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-muted/50 px-3 py-2 ring-1 ring-foreground/8">
                <span className="mr-1 text-xs tracking-wide text-muted-foreground uppercase">
                    Duration
                </span>
                {NOTE_DURATIONS.map((duration) => {
                    const selected = selectedDuration === duration.durationBeats;
                    return (
                        <button
                            key={duration.id}
                            type="button"
                            title={`${duration.label} (${duration.shortcut})`}
                            onClick={() =>
                                setSelectedDuration(duration.durationBeats)
                            }
                            className={cn(
                                'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition',
                                selected
                                    ? 'bg-background text-foreground shadow-sm ring-1 ring-foreground/15'
                                    : 'text-muted-foreground hover:bg-background/70 hover:text-foreground'
                            )}
                        >
                            <DurationGlyph durationBeats={duration.durationBeats} />
                            <span className="hidden sm:inline">
                                {duration.label}
                            </span>
                            <kbd className="rounded bg-foreground/5 px-1 font-mono text-[0.65rem] text-muted-foreground">
                                {duration.shortcut}
                            </kbd>
                        </button>
                    );
                })}

                <div className="mx-1 hidden h-6 w-px bg-foreground/10 sm:block" />

                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="sr-only">Tempo</span>
                    <input
                        type="range"
                        min={60}
                        max={160}
                        value={bpm}
                        onChange={(event) => setBpm(Number(event.target.value))}
                        className="w-28 accent-primary"
                    />
                    <span className="tabular-nums text-foreground">
                        {bpm}
                    </span>
                </label>

                <div className="ml-auto flex flex-wrap gap-1.5">
                    <Button
                        type="button"
                        size="sm"
                        disabled={playing !== null}
                        onClick={() => void handlePlay('both')}
                    >
                        {playing === 'both' ? 'Playing…' : 'Play both'}
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={playing !== null}
                        onClick={() => void handlePlay('a')}
                    >
                        Play 1
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={playing !== null}
                        onClick={() => void handlePlay('b')}
                    >
                        Play 2
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={playing === null}
                        onClick={handleStop}
                    >
                        Stop
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            handleStop();
                            setNotes([]);
                            setSelectedNoteId(null);
                            setError(null);
                        }}
                    >
                        Clear
                    </Button>
                </div>
            </div>

            {error ? (
                <p className="mb-3 text-sm text-destructive" role="alert">
                    {error}
                </p>
            ) : null}

            <div className="overflow-x-auto rounded-2xl bg-card px-3 py-5 ring-1 ring-foreground/10 md:px-5">
                <div className="mb-3 flex items-center gap-3 px-1 text-xs text-muted-foreground">
                    <span className="rounded bg-foreground/5 px-1.5 py-0.5 font-medium text-foreground">
                        {TIME_SIGNATURE}
                    </span>
                    <span>{BARS} bars</span>
                    <span className="hidden sm:inline">
                        Click staff to enter · select note + Delete to remove
                    </span>
                </div>

                <div className="space-y-2">
                    {(['a', 'b'] as const).map((part) => (
                        <StaffScore
                            key={part}
                            part={part}
                            notes={notes}
                            ghost={ghost}
                            selectedNoteId={selectedNoteId}
                            selectedDuration={selectedDuration}
                            onGhost={setGhost}
                            onSelectNote={setSelectedNoteId}
                            onPlace={(midi, startBeat) =>
                                placeNote(part, selectedDuration, midi, startBeat)
                            }
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

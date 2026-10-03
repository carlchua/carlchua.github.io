import { cn } from '@/lib/utils';
import { MAX_FRET, STRING_COUNT, type FretValue } from '@/lib/chords';

const STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E'] as const;

/** Display row 0 = high e → data index 5; row 5 = low E → data index 0 */
function dataIndex(displayRow: number): number {
    return STRING_COUNT - 1 - displayRow;
}

type FretboardProps = {
    pattern: FretValue[];
    onChange?: (next: FretValue[]) => void;
    readOnly?: boolean;
    fingers?: number[];
    className?: string;
    /** Compact diagram: fewer frets, auto-windowed around the shape */
    compact?: boolean;
};

function windowForPattern(pattern: FretValue[], compact: boolean) {
    if (!compact) {
        return { start: 0, end: MAX_FRET };
    }

    const fretted = pattern.filter((f): f is number => f !== null && f > 0);
    if (fretted.length === 0) {
        return { start: 0, end: 4 };
    }

    const min = Math.min(...fretted);
    const max = Math.max(...fretted);
    const start = Math.max(0, min <= 1 ? 0 : min - 1);
    const end = Math.min(MAX_FRET, Math.max(start + 4, max));
    return { start, end };
}

export default function Fretboard({
    pattern,
    onChange,
    readOnly = false,
    fingers,
    className,
    compact = false,
}: FretboardProps) {
    const { start, end } = windowForPattern(pattern, compact);
    const frets = Array.from({ length: end - start + 1 }, (_, i) => start + i);

    const setString = (stringIdx: number, value: FretValue) => {
        if (readOnly || !onChange) return;
        const next = [...pattern];
        next[stringIdx] = value;
        onChange(next);
    };

    const toggleFret = (stringIdx: number, fret: number) => {
        if (readOnly || !onChange) return;
        const current = pattern[stringIdx];
        setString(stringIdx, current === fret ? null : fret);
    };

    const toggleMute = (stringIdx: number) => {
        if (readOnly || !onChange) return;
        // Mute is represented as null with a dedicated "muted" flag via
        // treating null as mute when user explicitly mutes; open is 0.
        // We use a sentinel: click mute sets null; if already null and
        // was "intentionally muted", we need distinction...
        // Convention: null = muted; 0 = open; >0 = fretted.
        // Empty start state is all null (muted). Toggle mute: if fretted/open → mute; if mute → open.
        const current = pattern[stringIdx];
        if (current === null) {
            setString(stringIdx, 0);
        } else {
            setString(stringIdx, null);
        }
    };

    return (
        <div className={cn('w-full select-none', className)}>
            <div
                className="grid gap-x-1"
                style={{
                    gridTemplateColumns: compact
                        ? `1.5rem repeat(${frets.length}, minmax(0, 1fr))`
                        : `1.75rem 1.5rem repeat(${frets.length}, minmax(0, 1fr))`,
                }}
            >
                {/* Header: fret numbers */}
                <div />
                {!compact ? <div /> : null}
                {frets.map((fret) => (
                    <div
                        key={`h-${fret}`}
                        className="pb-1 text-center text-[0.65rem] text-muted-foreground"
                    >
                        {fret === 0 ? 'empty' : fret}
                    </div>
                ))}

                {STRING_LABELS.map((label, row) => {
                    const idx = dataIndex(row);
                    const value = pattern[idx] ?? null;
                    const muted = value === null;
                    const finger = fingers?.[idx];

                    return (
                        <div key={label} className="contents">
                            <div className="flex items-center justify-end pr-1 text-xs text-muted-foreground">
                                {label}
                            </div>

                            {!compact ? (
                                <button
                                    type="button"
                                    disabled={readOnly}
                                    onClick={() => toggleMute(idx)}
                                    aria-label={
                                        muted
                                            ? `Unmute ${label} string`
                                            : `Mute ${label} string`
                                    }
                                    className={cn(
                                        'my-0.5 flex size-6 items-center justify-center rounded text-sm font-medium transition-colors',
                                        readOnly
                                            ? 'cursor-default'
                                            : 'hover:bg-muted',
                                        muted
                                            ? 'text-foreground'
                                            : 'text-muted-foreground/50'
                                    )}
                                >
                                    ×
                                </button>
                            ) : null}

                            {frets.map((fret) => {
                                const isOpenCell = fret === 0;
                                const active =
                                    !muted &&
                                    value !== null &&
                                    value === fret;
                                const showOpenMarker =
                                    isOpenCell && value === 0;

                                return (
                                    <button
                                        key={`${label}-${fret}`}
                                        type="button"
                                        disabled={readOnly}
                                        onClick={() => {
                                            if (isOpenCell) {
                                                // Toggle open
                                                if (value === 0) {
                                                    setString(idx, null);
                                                } else {
                                                    setString(idx, 0);
                                                }
                                            } else {
                                                toggleFret(idx, fret);
                                            }
                                        }}
                                        className={cn(
                                            'relative flex h-8 items-center justify-center',
                                            !readOnly && 'cursor-pointer',
                                            readOnly && 'cursor-default'
                                        )}
                                        aria-label={`${label} string fret ${fret}`}
                                    >
                                        {/* String line */}
                                        <span
                                            className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-foreground/35"
                                            aria-hidden
                                        />
                                        {/* Fret line (left edge), skip nut */}
                                        {fret > 0 ? (
                                            <span
                                                className={cn(
                                                    'pointer-events-none absolute inset-y-0 left-0 w-px bg-foreground/25',
                                                    fret === start &&
                                                        start > 0 &&
                                                        'w-0.5 bg-foreground/50'
                                                )}
                                                aria-hidden
                                            />
                                        ) : (
                                            <span
                                                className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-foreground/70"
                                                aria-hidden
                                            />
                                        )}

                                        {muted && isOpenCell && compact ? (
                                            <span className="relative z-10 text-xs font-medium">
                                                ×
                                            </span>
                                        ) : null}

                                        {showOpenMarker ? (
                                            <span
                                                className={cn(
                                                    'relative z-10 size-3.5 rounded-full border-2 border-foreground bg-transparent',
                                                    compact && 'size-3'
                                                )}
                                            />
                                        ) : null}

                                        {active && fret > 0 ? (
                                            <span
                                                className={cn(
                                                    'relative z-10 flex size-5 items-center justify-center rounded-full bg-foreground text-[0.6rem] font-medium text-background',
                                                    compact && 'size-4 text-[0.55rem]'
                                                )}
                                            >
                                                {finger && finger > 0
                                                    ? finger
                                                    : null}
                                            </span>
                                        ) : null}
                                    </button>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

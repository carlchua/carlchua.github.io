export type PartId = 'a' | 'b';

export type ScoreNote = {
    id: string;
    part: PartId;
    /** MIDI note number */
    midi: number;
    /** Beat index from the start of the piece (0-based) */
    startBeat: number;
    /** Length in beats (0.5 = eighth, 1 = quarter, 2 = half, 4 = whole) */
    durationBeats: number;
};

export type NoteDuration = {
    id: string;
    label: string;
    /** MuseScore-style duration shortcut */
    shortcut: string;
    durationBeats: number;
};

/** Fixed score form — always 4/4, four bars. */
export const TIME_SIGNATURE = '4/4' as const;
export const BARS = 4;
export const BEATS_PER_BAR = 4;
export const TOTAL_BEATS = BARS * BEATS_PER_BAR;
/** Rhythmic snap in 4/4 (eighth-note grid, like MuseScore half-beat anchors). */
export const BEAT_SUBDIVISION = 0.5;

export const NOTE_DURATIONS: NoteDuration[] = [
    { id: 'whole', label: 'Whole', shortcut: '7', durationBeats: 4 },
    { id: 'half', label: 'Half', shortcut: '6', durationBeats: 2 },
    { id: 'quarter', label: 'Quarter', shortcut: '5', durationBeats: 1 },
    { id: 'eighth', label: 'Eighth', shortcut: '4', durationBeats: 0.5 },
];

export const PART_META: Record<
    PartId,
    { label: string; short: string }
> = {
    a: { label: 'Instrument 1', short: '1' },
    b: { label: 'Instrument 2', short: '2' },
};

/** Diatonic steps in C major from C4 upward (staff positions). */
export const STAFF_BOTTOM_MIDI = 60; // C4
export const STAFF_STEP_COUNT = 13; // C4 … A5
export const DEFAULT_BPM = 96;

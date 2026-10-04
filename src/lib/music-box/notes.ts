import {
    BEATS_PER_BAR,
    BEAT_SUBDIVISION,
    STAFF_BOTTOM_MIDI,
    STAFF_STEP_COUNT,
    TOTAL_BEATS,
    type PartId,
    type ScoreNote,
} from '@/lib/music-box/types';

const DIATONIC_OFFSETS = [0, 2, 4, 5, 7, 9, 11] as const;

export function staffIndexToMidi(index: number): number {
    const clamped = Math.max(0, Math.min(STAFF_STEP_COUNT - 1, index));
    const octave = Math.floor(clamped / 7);
    const degree = clamped % 7;
    return STAFF_BOTTOM_MIDI + octave * 12 + DIATONIC_OFFSETS[degree];
}

export function midiToStaffIndex(midi: number): number {
    let best = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < STAFF_STEP_COUNT; i += 1) {
        const distance = Math.abs(staffIndexToMidi(i) - midi);
        if (distance < bestDistance) {
            bestDistance = distance;
            best = i;
        }
    }
    return best;
}

export function midiToNoteName(midi: number): string {
    const names = [
        'C',
        'C♯',
        'D',
        'D♯',
        'E',
        'F',
        'F♯',
        'G',
        'G♯',
        'A',
        'A♯',
        'B',
    ];
    const name = names[((midi % 12) + 12) % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${name}${octave}`;
}

/** Staff line indices (0 = bottom pitch) that draw the five treble lines. */
export const STAFF_LINE_INDICES = [2, 4, 6, 8, 10] as const;

/** Bottom staff line index (E4) through top (F5). */
export const STAFF_BOTTOM_LINE = 2;
export const STAFF_TOP_LINE = 10;

export function barIndex(beat: number): number {
    return Math.floor(beat / BEATS_PER_BAR + 1e-9);
}

export function barStartBeat(beat: number): number {
    return barIndex(beat) * BEATS_PER_BAR;
}

export function barEndBeat(beat: number): number {
    return barStartBeat(beat) + BEATS_PER_BAR;
}

/** In 4/4, a note must live entirely inside one measure (no barline crossing). */
export function fitsInMeasure(startBeat: number, durationBeats: number): boolean {
    if (durationBeats > BEATS_PER_BAR + 1e-9) return false;
    return startBeat + durationBeats <= barEndBeat(startBeat) + 1e-9;
}

export function rangesOverlap(
    aStart: number,
    aEnd: number,
    bStart: number,
    bEnd: number
): boolean {
    return aStart < bEnd - 1e-9 && bStart < aEnd - 1e-9;
}

export function clampStartBeat(startBeat: number, durationBeats: number): number {
    const maxStart = Math.max(0, TOTAL_BEATS - durationBeats);
    let next = Math.max(0, Math.min(maxStart, startBeat));
    // Keep the note inside the measure it starts in (4 beats in 4/4).
    const measureEnd = barEndBeat(next);
    if (next + durationBeats > measureEnd + 1e-9) {
        next = measureEnd - durationBeats;
    }
    return Math.max(barStartBeat(next), next);
}

export function snapBeat(rawBeat: number, durationBeats: number): number {
    const step = Math.min(BEAT_SUBDIVISION, durationBeats);
    const snapped = Math.floor(rawBeat / step + 1e-9) * step;
    return clampStartBeat(snapped, durationBeats);
}

/**
 * One voice per staff: rhythms may not overlap inside a measure.
 * Same onset + same duration + different pitch = chord (allowed).
 * Same pitch in an overlapping span is treated as a replace candidate.
 */
export function canPlaceNote(
    notes: ScoreNote[],
    part: PartId,
    startBeat: number,
    durationBeats: number,
    midi: number
): { ok: true } | { ok: false; reason: string } {
    if (!fitsInMeasure(startBeat, durationBeats)) {
        return {
            ok: false,
            reason: `A ${durationLabel(durationBeats)} must fit inside one 4/4 bar.`,
        };
    }

    const endBeat = startBeat + durationBeats;

    for (const note of notes) {
        if (note.part !== part) continue;
        if (
            !rangesOverlap(
                startBeat,
                endBeat,
                note.startBeat,
                note.startBeat + note.durationBeats
            )
        ) {
            continue;
        }

        // Replace the same pitch if it occupies overlapping time.
        if (note.midi === midi) continue;

        const sameOnset = Math.abs(note.startBeat - startBeat) < 1e-9;
        const sameDuration =
            Math.abs(note.durationBeats - durationBeats) < 1e-9;

        // Chord tones share onset and duration.
        if (sameOnset && sameDuration) continue;

        return {
            ok: false,
            reason:
                'That beat is already taken in this bar. In 4/4 each staff voice has 4 beats per measure.',
        };
    }

    return { ok: true };
}

function durationLabel(durationBeats: number): string {
    if (durationBeats >= 4) return 'whole note';
    if (durationBeats >= 2) return 'half note';
    if (durationBeats >= 1) return 'quarter note';
    return 'eighth note';
}

export function notesForPart(notes: ScoreNote[], part: ScoreNote['part']) {
    return notes.filter((note) => note.part === part);
}

export function createNoteId(): string {
    return `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isFilledNotehead(durationBeats: number): boolean {
    return durationBeats < 2;
}

export function hasStem(durationBeats: number): boolean {
    return durationBeats < 4;
}

export function hasFlag(durationBeats: number): boolean {
    return durationBeats <= 0.5;
}

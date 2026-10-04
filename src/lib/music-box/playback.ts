import * as Tone from 'tone';

import type { PartId, ScoreNote } from '@/lib/music-box/types';

export type PlayMode = PartId | 'both';

type PianoVoice = {
    synth: Tone.PolySynth;
    panner: Tone.Panner;
    gain: Tone.Gain;
};

let voiceA: PianoVoice | null = null;
let voiceB: PianoVoice | null = null;
let ready: Promise<void> | null = null;

function createPianoVoice(pan: number, gainDb: number): PianoVoice {
    const gain = new Tone.Gain(Tone.dbToGain(gainDb)).toDestination();
    const panner = new Tone.Panner(pan).connect(gain);
    const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: {
            attack: 0.01,
            decay: 0.35,
            sustain: 0.25,
            release: 0.8,
        },
    }).connect(panner);
    synth.maxPolyphony = 12;
    synth.volume.value = -6;
    return { synth, panner, gain };
}

async function ensureReady(): Promise<void> {
    if (!ready) {
        ready = (async () => {
            await Tone.start();
            if (!voiceA) voiceA = createPianoVoice(-0.25, -2);
            if (!voiceB) voiceB = createPianoVoice(0.25, -4);
        })();
    }
    await ready;
}

function midiToToneNote(midi: number): string {
    return Tone.Frequency(midi, 'midi').toNote();
}

function schedulePart(
    voice: PianoVoice,
    notes: ScoreNote[],
    bpm: number,
    timeOffset: number
): number {
    const beatSec = 60 / bpm;
    let endSec = 0;
    for (const note of notes) {
        const startSec = note.startBeat * beatSec;
        const durationSec = Math.max(0.05, note.durationBeats * beatSec * 0.92);
        voice.synth.triggerAttackRelease(
            midiToToneNote(note.midi),
            durationSec,
            timeOffset + startSec,
            0.7
        );
        endSec = Math.max(endSec, startSec + durationSec);
    }
    return endSec;
}

export async function playScore(
    notes: ScoreNote[],
    bpm: number,
    mode: PlayMode
): Promise<number> {
    await ensureReady();
    stopPlayback();

    const now = Tone.now() + 0.05;
    let endSec = 0;

    if (mode === 'a' || mode === 'both') {
        endSec = Math.max(
            endSec,
            schedulePart(
                voiceA!,
                notes.filter((n) => n.part === 'a'),
                bpm,
                now
            )
        );
    }
    if (mode === 'b' || mode === 'both') {
        endSec = Math.max(
            endSec,
            schedulePart(
                voiceB!,
                notes.filter((n) => n.part === 'b'),
                bpm,
                now
            )
        );
    }

    return endSec;
}

export function stopPlayback(): void {
    voiceA?.synth.releaseAll();
    voiceB?.synth.releaseAll();
}

export function disposePlayback(): void {
    stopPlayback();
    voiceA?.synth.dispose();
    voiceA?.panner.dispose();
    voiceA?.gain.dispose();
    voiceB?.synth.dispose();
    voiceB?.panner.dispose();
    voiceB?.gain.dispose();
    voiceA = null;
    voiceB = null;
    ready = null;
}

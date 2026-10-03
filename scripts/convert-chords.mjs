import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const MAX_FRET = 12;
const KEY_ORDER = [
    'C',
    'C#',
    'Db',
    'D',
    'D#',
    'Eb',
    'E',
    'F',
    'F#',
    'Gb',
    'G',
    'G#',
    'Ab',
    'A',
    'A#',
    'Bb',
    'B',
];

const DEFAULT_SOURCE = path.join(
    process.env.USERPROFILE ?? process.env.HOME ?? '',
    'Downloads',
    'guitar-chords-db-json-master',
    'guitar-chords-db-json-master'
);

const sourceDir = path.resolve(process.argv[2] ?? DEFAULT_SOURCE);
const outDir = path.join(ROOT, 'public', 'data');

/**
 * @param {string} char
 * @returns {number | null}
 */
function parseFretChar(char) {
    if (char === 'x' || char === 'X') return null;
    if (char >= '0' && char <= '9') return Number(char);
    if (char >= 'a' && char <= 'z') return 10 + (char.charCodeAt(0) - 97);
    if (char >= 'A' && char <= 'Z') return 10 + (char.charCodeAt(0) - 65);
    throw new Error(`Unknown fret char: ${char}`);
}

/**
 * @param {string} char
 * @returns {number}
 */
function parseFingerChar(char) {
    if (char >= '0' && char <= '9') return Number(char);
    return 0;
}

/**
 * @param {string} frets
 * @returns {(number | null)[]}
 */
function parseFrets(frets) {
    if (typeof frets !== 'string' || frets.length !== 6) {
        throw new Error(`Invalid frets string: ${frets}`);
    }
    return [...frets].map(parseFretChar);
}

/**
 * @param {string} fingers
 * @returns {number[]}
 */
function parseFingers(fingers) {
    if (typeof fingers !== 'string' || fingers.length !== 6) {
        return [0, 0, 0, 0, 0, 0];
    }
    return [...fingers].map(parseFingerChar);
}

/**
 * @param {(number | null)[]} frets
 * @returns {string}
 */
function fretsKey(frets) {
    return frets.map((f) => (f === null ? 'x' : String(f))).join(',');
}

/**
 * @param {string} key
 * @param {string} suffix
 * @returns {string}
 */
function displayName(key, suffix) {
    if (suffix === 'major') return key;
    if (suffix === 'minor') return `${key}m`;
    if (suffix.startsWith('/')) return `${key}${suffix}`;
    return `${key}${suffix}`;
}

/**
 * @param {unknown} barres
 * @returns {number | undefined}
 */
function parseBarres(barres) {
    if (barres === undefined || barres === null || barres === '') return undefined;
    const n = Number(barres);
    return Number.isFinite(n) ? n : undefined;
}

function walkJsonFiles(dir) {
    /** @type {string[]} */
    const files = [];
    if (!fs.existsSync(dir)) {
        throw new Error(`Source directory not found: ${dir}`);
    }

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...walkJsonFiles(full));
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
            files.push(full);
        }
    }
    return files;
}

function main() {
    console.log(`Reading chords from: ${sourceDir}`);
    const files = walkJsonFiles(sourceDir);
    console.log(`Found ${files.length} JSON files`);

    /** @type {Record<string, any>} */
    const byId = {};
    /** @type {Record<string, Set<string>>} */
    const suffixesByKeySets = {};
    /** @type {Record<string, { id: string, name: string }[]>} */
    const byFrets = {};

    let totalPositions = 0;
    let keptPositions = 0;
    let skippedHigh = 0;

    for (const file of files) {
        let raw;
        try {
            raw = JSON.parse(fs.readFileSync(file, 'utf8'));
        } catch {
            continue;
        }

        if (!raw || typeof raw.key !== 'string' || typeof raw.suffix !== 'string') {
            continue;
        }
        if (!Array.isArray(raw.positions)) continue;

        const key = raw.key;
        const suffix = raw.suffix;
        const id = `${key}:${suffix}`;
        const name = displayName(key, suffix);

        if (!suffixesByKeySets[key]) suffixesByKeySets[key] = new Set();
        suffixesByKeySets[key].add(suffix);

        /** @type {any[]} */
        const kept = [];

        for (const pos of raw.positions) {
            totalPositions += 1;
            if (!pos || typeof pos.frets !== 'string') continue;

            let frets;
            try {
                frets = parseFrets(pos.frets);
            } catch {
                continue;
            }

            const maxFret = frets.reduce(
                (m, f) => (f === null ? m : Math.max(m, f)),
                0
            );
            if (maxFret > MAX_FRET) {
                skippedHigh += 1;
                continue;
            }

            const fingers = parseFingers(pos.fingers ?? '000000');
            const barres = parseBarres(pos.barres);
            /** @type {{ frets: (number|null)[], fingers: number[], barres?: number }} */
            const entry = { frets, fingers };
            if (barres !== undefined && barres <= MAX_FRET) entry.barres = barres;

            kept.push(entry);
            keptPositions += 1;

            const fKey = fretsKey(frets);
            if (!byFrets[fKey]) byFrets[fKey] = [];
            if (!byFrets[fKey].some((c) => c.id === id)) {
                byFrets[fKey].push({ id, name });
            }
        }

        if (kept.length === 0) continue;

        if (!byId[id]) {
            byId[id] = { id, key, suffix, name, positions: kept };
        } else {
            // Merge positions if duplicate ids appear across files
            const existing = new Set(
                byId[id].positions.map((p) => fretsKey(p.frets))
            );
            for (const p of kept) {
                const k = fretsKey(p.frets);
                if (!existing.has(k)) {
                    byId[id].positions.push(p);
                    existing.add(k);
                }
            }
        }
    }

    const keysPresent = KEY_ORDER.filter((k) => suffixesByKeySets[k]);
    // Include any unexpected keys at the end
    for (const k of Object.keys(suffixesByKeySets).sort()) {
        if (!keysPresent.includes(k)) keysPresent.push(k);
    }

    /** @type {Record<string, string[]>} */
    const suffixesByKey = {};
    for (const k of keysPresent) {
        suffixesByKey[k] = [...suffixesByKeySets[k]].sort((a, b) =>
            a.localeCompare(b)
        );
    }

    const meta = {
        source: 'guitar-chords-db-json (filtered from T-vK/chord-collection / tombatossals)',
        license: 'MIT License — Copyright (c) 2019 Zoltán Szabó',
        maxFret: MAX_FRET,
        generatedAt: new Date().toISOString(),
        chordCount: Object.keys(byId).length,
        positionCount: keptPositions,
        patternCount: Object.keys(byFrets).length,
    };

    fs.mkdirSync(outDir, { recursive: true });

    const byNamePath = path.join(outDir, 'chords-by-name.json');
    const byFretsPath = path.join(outDir, 'chords-by-frets.json');

    fs.writeFileSync(
        byNamePath,
        JSON.stringify({ meta, keys: keysPresent, suffixesByKey, byId })
    );
    fs.writeFileSync(byFretsPath, JSON.stringify({ meta, byFrets }));

    const byNameSize = fs.statSync(byNamePath).size;
    const byFretsSize = fs.statSync(byFretsPath).size;

    console.log(`Wrote ${byNamePath} (${(byNameSize / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`Wrote ${byFretsPath} (${(byFretsSize / 1024 / 1024).toFixed(2)} MB)`);
    console.log(
        `Positions: ${keptPositions}/${totalPositions} kept (skipped ${skippedHigh} above fret ${MAX_FRET})`
    );
    console.log(
        `Chords: ${meta.chordCount}, unique fret patterns: ${meta.patternCount}`
    );
}

main();

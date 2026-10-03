export type FretValue = number | null;

export type ChordPosition = {
    frets: FretValue[];
    fingers: number[];
    barres?: number;
};

export type ChordEntry = {
    id: string;
    key: string;
    suffix: string;
    name: string;
    positions: ChordPosition[];
};

export type ChordRef = {
    id: string;
    name: string;
};

export type ChordsMeta = {
    source: string;
    license: string;
    maxFret: number;
    generatedAt: string;
    chordCount: number;
    positionCount: number;
    patternCount: number;
};

export type ChordsByNameData = {
    meta: ChordsMeta;
    keys: string[];
    suffixesByKey: Record<string, string[]>;
    byId: Record<string, ChordEntry>;
};

export type ChordsByFretsData = {
    meta: ChordsMeta;
    byFrets: Record<string, ChordRef[]>;
};

export const MAX_FRET = 12;
export const STRING_COUNT = 6;

let byNameCache: ChordsByNameData | null = null;
let byFretsCache: ChordsByFretsData | null = null;
let byNamePromise: Promise<ChordsByNameData> | null = null;
let byFretsPromise: Promise<ChordsByFretsData> | null = null;

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to load ${url}: ${res.status}`);
    }
    return res.json() as Promise<T>;
}

export function loadChordsByName(): Promise<ChordsByNameData> {
    if (byNameCache) return Promise.resolve(byNameCache);
    if (!byNamePromise) {
        byNamePromise = fetchJson<ChordsByNameData>('/data/chords-by-name.json').then(
            (data) => {
                byNameCache = data;
                return data;
            }
        );
    }
    return byNamePromise;
}

export function loadChordsByFrets(): Promise<ChordsByFretsData> {
    if (byFretsCache) return Promise.resolve(byFretsCache);
    if (!byFretsPromise) {
        byFretsPromise = fetchJson<ChordsByFretsData>(
            '/data/chords-by-frets.json'
        ).then((data) => {
            byFretsCache = data;
            return data;
        });
    }
    return byFretsPromise;
}

/** Normalize a 6-string pattern to the reverse-index key. */
export function fretsToKey(frets: FretValue[]): string {
    return frets.map((f) => (f === null ? 'x' : String(f))).join(',');
}

export function findByFrets(
    data: ChordsByFretsData,
    frets: FretValue[]
): ChordRef[] {
    return data.byFrets[fretsToKey(frets)] ?? [];
}

export function findPositions(
    data: ChordsByNameData,
    id: string
): ChordEntry | undefined {
    return data.byId[id];
}

/** Normalize user input for chord name matching. */
export function normalizeChordQuery(query: string): string {
    return query.trim().toLowerCase().replace(/\s+/g, '');
}

/** Aliases that should resolve to a chord (e.g. C, Cmajor, C major → C major). */
export function chordSearchAliases(entry: ChordEntry): string[] {
    const key = entry.key.toLowerCase();
    const suffix = entry.suffix.toLowerCase();
    const name = entry.name.toLowerCase();
    const aliases = new Set<string>([
        name,
        normalizeChordQuery(name),
        `${key}${suffix}`,
        normalizeChordQuery(`${key} ${suffix}`),
    ]);

    if (suffix === 'major') {
        aliases.add(key);
        aliases.add(`${key}maj`);
        aliases.add(`${key}major`);
    } else if (suffix === 'minor') {
        aliases.add(`${key}m`);
        aliases.add(`${key}min`);
        aliases.add(`${key}minor`);
    }

    return [...aliases];
}

export function chordMatchesQuery(entry: ChordEntry, query: string): boolean {
    const q = normalizeChordQuery(query);
    if (!q) return false;
    return chordSearchAliases(entry).some((alias) => alias === q);
}

/** Ranked name suggestions for typeahead search. */
export function suggestChordsByName(
    data: ChordsByNameData,
    query: string,
    limit = 12
): ChordEntry[] {
    const q = normalizeChordQuery(query);
    if (!q) return [];

    type Ranked = { entry: ChordEntry; rank: number; nameLen: number };
    const ranked: Ranked[] = [];

    for (const entry of Object.values(data.byId)) {
        const aliases = chordSearchAliases(entry);
        const name = entry.name.toLowerCase();

        let rank = -1;
        if (aliases.some((alias) => alias === q)) {
            rank = 0; // exact alias ("C", "Cmajor", …)
        } else if (name.startsWith(q) || aliases.some((a) => a.startsWith(q))) {
            rank = 1; // prefix
        } else if (name.includes(q) || aliases.some((a) => a.includes(q))) {
            rank = 2; // substring
        }

        if (rank >= 0) {
            ranked.push({ entry, rank, nameLen: entry.name.length });
        }
    }

    ranked.sort((a, b) => {
        if (a.rank !== b.rank) return a.rank - b.rank;
        // Prefer shorter display names so "C" beats "C11" for query "C"
        if (a.nameLen !== b.nameLen) return a.nameLen - b.nameLen;
        return a.entry.name.localeCompare(b.entry.name);
    });

    return ranked.slice(0, limit).map((r) => r.entry);
}

export function chordId(key: string, suffix: string): string {
    return `${key}:${suffix}`;
}

/** All strings open (empty / fret 0). */
export function emptyPattern(): FretValue[] {
    return Array.from({ length: STRING_COUNT }, () => 0);
}

/** All strings muted. */
export function mutedPattern(): FretValue[] {
    return Array.from({ length: STRING_COUNT }, () => null);
}

/** True when at least one string has a concrete fretted/open note (not all muted). */
export function patternHasNotes(frets: FretValue[]): boolean {
    return frets.some((f) => f !== null);
}

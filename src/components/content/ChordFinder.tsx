import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import ChordDiagram from '@/components/chords/ChordDiagram';
import Fretboard from '@/components/chords/Fretboard';
import { Button } from '@/components/ui/button';
import {
    chordId,
    chordMatchesQuery,
    emptyPattern,
    findByFrets,
    findPositions,
    loadChordsByFrets,
    loadChordsByName,
    patternHasNotes,
    suggestChordsByName,
    type ChordEntry,
    type ChordRef,
    type ChordsByFretsData,
    type ChordsByNameData,
    type FretValue,
} from '@/lib/chords';
import { cn } from '@/lib/utils';

type Mode = 'findChord' | 'chordDiagrams';
type DiagramsInputMode = 'search' | 'dropdown';

const INITIAL_VISIBLE = 12;

function suffixLabel(suffix: string): string {
    if (suffix === 'major') return 'major';
    if (suffix === 'minor') return 'minor';
    return suffix;
}

export default function ChordFinder() {
    const [mode, setMode] = useState<Mode>('findChord');

    // Find Chord — fingering → name
    const [byFrets, setByFrets] = useState<ChordsByFretsData | null>(null);
    const [findChordError, setFindChordError] = useState<string | null>(null);
    const [pattern, setPattern] = useState<FretValue[]>(() => emptyPattern());

    // Chord Diagrams — name → fingerings
    const [byName, setByName] = useState<ChordsByNameData | null>(null);
    const [chordDiagramsError, setChordDiagramsError] = useState<string | null>(
        null
    );
    const [key, setKey] = useState('C');
    const [suffix, setSuffix] = useState('major');
    const [showAll, setShowAll] = useState(false);
    const [diagramsInputMode, setDiagramsInputMode] =
        useState<DiagramsInputMode>('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const searchWrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (mode !== 'findChord' || byFrets) return;
        let cancelled = false;
        loadChordsByFrets()
            .then((data) => {
                if (!cancelled) setByFrets(data);
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    setFindChordError(
                        err instanceof Error ? err.message : 'Failed to load data'
                    );
                }
            });
        return () => {
            cancelled = true;
        };
    }, [mode, byFrets]);

    useEffect(() => {
        if (mode !== 'chordDiagrams' || byName) return;
        let cancelled = false;
        loadChordsByName()
            .then((data) => {
                if (cancelled) return;
                setByName(data);
                setKey((currentKey) => {
                    if (data.keys.includes(currentKey)) return currentKey;
                    return data.keys[0] ?? 'C';
                });
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    setChordDiagramsError(
                        err instanceof Error ? err.message : 'Failed to load data'
                    );
                }
            });
        return () => {
            cancelled = true;
        };
    }, [mode, byName]);

    useEffect(() => {
        const onPointerDown = (event: MouseEvent) => {
            if (!searchWrapRef.current?.contains(event.target as Node)) {
                setSuggestionsOpen(false);
            }
        };
        document.addEventListener('mousedown', onPointerDown);
        return () => document.removeEventListener('mousedown', onPointerDown);
    }, []);

    const matches: ChordRef[] = useMemo(() => {
        if (!byFrets || !patternHasNotes(pattern)) return [];
        return findByFrets(byFrets, pattern);
    }, [byFrets, pattern]);

    const suffixes = byName?.suffixesByKey[key] ?? [];

    useEffect(() => {
        if (!byName) return;
        const list = byName.suffixesByKey[key] ?? [];
        if (list.length && !list.includes(suffix)) {
            setSuffix(list.includes('major') ? 'major' : list[0]);
        }
        setShowAll(false);
    }, [key, byName, suffix]);

    const selected: ChordEntry | undefined = byName
        ? findPositions(byName, chordId(key, suffix))
        : undefined;

    const suggestions = useMemo(() => {
        if (!byName || diagramsInputMode !== 'search') return [];
        return suggestChordsByName(byName, searchQuery);
    }, [byName, diagramsInputMode, searchQuery]);

    const selectChord = (entry: ChordEntry) => {
        setKey(entry.key);
        setSuffix(entry.suffix);
        setSearchQuery(entry.name);
        setSuggestionsOpen(false);
        setShowAll(false);
    };

    const positions = selected?.positions ?? [];
    const visiblePositions = showAll
        ? positions
        : positions.slice(0, INITIAL_VISIBLE);

    const meta = mode === 'findChord' ? byFrets?.meta : byName?.meta;
    const hasExactSearchSelection =
        !!selected && chordMatchesQuery(selected, searchQuery);

    return (
        <div className="pb-16">
            <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
                <Link to="/">← Home</Link>
            </Button>

            <h1 className="font-heading mb-2 text-3xl font-semibold tracking-tight md:text-4xl">
                Chord Finder
            </h1>
            <p className="mb-8 max-w-xl text-muted-foreground">
                Look up a chord from a fingering, or browse fingerings for a
                chord name.
            </p>

            <div className="mb-8 flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant={mode === 'findChord' ? 'default' : 'outline'}
                    onClick={() => setMode('findChord')}
                >
                    Find Chord
                </Button>
                <Button
                    type="button"
                    variant={mode === 'chordDiagrams' ? 'default' : 'outline'}
                    onClick={() => setMode('chordDiagrams')}
                >
                    Chord Diagrams
                </Button>
            </div>

            {mode === 'findChord' ? (
                <section aria-label="Find Chord">
                    {findChordError ? (
                        <p className="text-destructive">{findChordError}</p>
                    ) : !byFrets ? (
                        <p className="text-muted-foreground">Loading…</p>
                    ) : (
                        <>
                            <p className="mb-3 text-sm text-muted-foreground">
                                Click frets to place fingers. Click a fret
                                number (1–12) to capo every string at that fret.
                                Use × to mute a string, or the empty column for
                                open strings.
                            </p>
                            <Fretboard
                                pattern={pattern}
                                onChange={setPattern}
                                className="mb-4"
                            />
                            <div className="mb-6 flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPattern(emptyPattern())}
                                >
                                    Clear
                                </Button>
                            </div>

                            {matches.length === 0 ? (
                                <p className="text-muted-foreground">
                                    No matching chord for this fingering.
                                </p>
                            ) : (
                                <div>
                                    <h2 className="font-heading mb-3 text-xl font-medium">
                                        {matches.length === 1
                                            ? 'Match'
                                            : 'Matches'}
                                    </h2>
                                    <ul className="flex flex-wrap gap-2">
                                        {matches.map((m) => (
                                            <li key={m.id}>
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        'rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors',
                                                        'hover:bg-muted'
                                                    )}
                                                    onClick={() => {
                                                        const [k, ...rest] =
                                                            m.id.split(':');
                                                        const s = rest.join(':');
                                                        setKey(k);
                                                        setSuffix(s);
                                                        setSearchQuery(m.name);
                                                        setDiagramsInputMode(
                                                            'search'
                                                        );
                                                        setMode('chordDiagrams');
                                                    }}
                                                >
                                                    {m.name}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </section>
            ) : (
                <section aria-label="Chord Diagrams">
                    {chordDiagramsError ? (
                        <p className="text-destructive">{chordDiagramsError}</p>
                    ) : !byName ? (
                        <p className="text-muted-foreground">Loading…</p>
                    ) : (
                        <>
                            {diagramsInputMode === 'search' ? (
                                <div className="mb-6 flex flex-wrap items-start gap-2">
                                    <div
                                        ref={searchWrapRef}
                                        className="relative min-w-[16rem] flex-1"
                                    >
                                        <label className="mb-1 block text-sm text-muted-foreground">
                                            Chord name
                                        </label>
                                        <input
                                            type="search"
                                            value={searchQuery}
                                            placeholder="e.g. G, Cm, Am7…"
                                            autoComplete="off"
                                            spellCheck={false}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setSuggestionsOpen(true);
                                            }}
                                            onFocus={() =>
                                                setSuggestionsOpen(true)
                                            }
                                            onKeyDown={(e) => {
                                                if (
                                                    e.key === 'Enter' &&
                                                    suggestions[0]
                                                ) {
                                                    e.preventDefault();
                                                    selectChord(suggestions[0]);
                                                }
                                                if (e.key === 'Escape') {
                                                    setSuggestionsOpen(false);
                                                }
                                            }}
                                            className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                        />
                                        {suggestionsOpen &&
                                        searchQuery.trim() &&
                                        suggestions.length > 0 ? (
                                            <ul
                                                role="listbox"
                                                className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-border bg-popover py-1 shadow-md"
                                            >
                                                {suggestions.map((entry) => (
                                                    <li key={entry.id}>
                                                        <button
                                                            type="button"
                                                            role="option"
                                                            className="flex w-full px-3 py-1.5 text-left text-sm hover:bg-muted"
                                                            onMouseDown={(e) =>
                                                                e.preventDefault()
                                                            }
                                                            onClick={() =>
                                                                selectChord(
                                                                    entry
                                                                )
                                                            }
                                                        >
                                                            {entry.name}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : null}
                                        {suggestionsOpen &&
                                        searchQuery.trim() &&
                                        suggestions.length === 0 ? (
                                            <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-md">
                                                No chords match.
                                            </div>
                                        ) : null}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-6"
                                        onClick={() => {
                                            if (selected) {
                                                setSearchQuery(selected.name);
                                            }
                                            setDiagramsInputMode('dropdown');
                                            setSuggestionsOpen(false);
                                        }}
                                    >
                                        Dropdown
                                    </Button>
                                </div>
                            ) : (
                                <div className="mb-6 flex flex-wrap items-end gap-3">
                                    <label className="flex flex-col gap-1 text-sm">
                                        <span className="text-muted-foreground">
                                            Key
                                        </span>
                                        <select
                                            value={key}
                                            onChange={(e) =>
                                                setKey(e.target.value)
                                            }
                                            className="h-9 rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                        >
                                            {byName.keys.map((k) => (
                                                <option key={k} value={k}>
                                                    {k}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="flex flex-col gap-1 text-sm">
                                        <span className="text-muted-foreground">
                                            Quality
                                        </span>
                                        <select
                                            value={suffix}
                                            onChange={(e) =>
                                                setSuffix(e.target.value)
                                            }
                                            className="h-9 min-w-[10rem] rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                        >
                                            {suffixes.map((s) => (
                                                <option key={s} value={s}>
                                                    {suffixLabel(s)}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            if (selected) {
                                                setSearchQuery(selected.name);
                                            }
                                            setDiagramsInputMode('search');
                                        }}
                                    >
                                        Text search
                                    </Button>
                                </div>
                            )}

                            {diagramsInputMode === 'search' &&
                            !hasExactSearchSelection ? (
                                <p className="text-muted-foreground">
                                    {searchQuery.trim()
                                        ? 'Choose a suggestion to see fingerings.'
                                        : 'Type a chord name to search.'}
                                </p>
                            ) : (
                                <>
                                    <h2 className="font-heading mb-4 text-2xl font-medium">
                                        {selected?.name ?? `${key}${suffix}`}
                                    </h2>

                                    {positions.length === 0 ? (
                                        <p className="text-muted-foreground">
                                            No fingerings under fret 12 for this
                                            chord.
                                        </p>
                                    ) : (
                                        <>
                                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                {visiblePositions.map(
                                                    (pos, i) => (
                                                        <ChordDiagram
                                                            key={`${fretsKeySafe(pos.frets)}-${i}`}
                                                            position={pos}
                                                            label={`Shape ${i + 1}`}
                                                        />
                                                    )
                                                )}
                                            </div>
                                            {positions.length >
                                            INITIAL_VISIBLE ? (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="mt-6"
                                                    onClick={() =>
                                                        setShowAll((v) => !v)
                                                    }
                                                >
                                                    {showAll
                                                        ? 'Show fewer'
                                                        : `Show more (${positions.length - INITIAL_VISIBLE})`}
                                                </Button>
                                            ) : null}
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </section>
            )}

            <footer className="mt-16 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
                <p>
                    Chord data derived from guitar-chords-db-json (MIT License —
                    Copyright © 2019 Zoltán Szabó), filtered from the
                    T-vK/chord-collection / tombatossals lineage.
                    {meta
                        ? ` ${meta.chordCount.toLocaleString()} chords · ${meta.positionCount.toLocaleString()} positions (max fret ${meta.maxFret}).`
                        : null}
                </p>
            </footer>
        </div>
    );
}

function fretsKeySafe(frets: FretValue[]): string {
    return frets.map((f) => (f === null ? 'x' : String(f))).join(',');
}

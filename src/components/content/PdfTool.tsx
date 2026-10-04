import { useId, useRef, useState, type DragEvent } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { buildOutputPdf, downloadPdfBytes } from '@/lib/pdf-tool/export';
import { parsePageRangeSpec } from '@/lib/pdf-tool/parse-range';
import { loadPdfDocument, renderPageThumbnail } from '@/lib/pdf-tool/pdfjs';
import type { PageEntry, PdfSource, ViewMode } from '@/lib/pdf-tool/types';
import { cn } from '@/lib/utils';

function newId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function PdfTool() {
    const fileInputId = useId();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragIdRef = useRef<string | null>(null);

    const [sources, setSources] = useState<Map<string, PdfSource>>(
        () => new Map()
    );
    const [pages, setPages] = useState<PageEntry[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [rangeSpec, setRangeSpec] = useState('');
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    const setIncluded = (id: string, included: boolean) => {
        setPages((prev) =>
            prev.map((p) => (p.id === id ? { ...p, included } : p))
        );
    };

    const selectAll = (included: boolean) => {
        setPages((prev) => prev.map((p) => ({ ...p, included })));
    };

    const applyRange = (included: boolean) => {
        const spec = rangeSpec.trim();
        if (!spec) {
            setError('Enter list positions, e.g. 5-17 or 1,3,8-10.');
            return;
        }
        try {
            const positions = parsePageRangeSpec(spec);
            setError(null);
            setPages((prev) =>
                prev.map((p, i) =>
                    positions.has(i + 1) ? { ...p, included } : p
                )
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid range');
        }
    };

    const clearAll = () => {
        setPages([]);
        setSources(new Map());
        setStatus(null);
        setError(null);
        setDragOverId(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const addFiles = async (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        setBusy(true);
        setError(null);
        setStatus('Loading PDFs…');

        const nextSources = new Map(sources);
        const added: PageEntry[] = [];

        try {
            for (const file of Array.from(fileList)) {
                if (
                    file.type !== 'application/pdf' &&
                    !file.name.toLowerCase().endsWith('.pdf')
                ) {
                    setError(`Skipped non-PDF: ${file.name}`);
                    continue;
                }

                const bytes = new Uint8Array(await file.arrayBuffer());
                const sourceId = newId();
                nextSources.set(sourceId, {
                    id: sourceId,
                    name: file.name,
                    bytes,
                });

                let pdf;
                try {
                    pdf = await loadPdfDocument(bytes);
                } catch (err) {
                    nextSources.delete(sourceId);
                    throw new Error(
                        `Could not read ${file.name}: ${
                            err instanceof Error ? err.message : String(err)
                        }`
                    );
                }

                try {
                    for (let i = 0; i < pdf.numPages; i++) {
                        let thumbUrl: string | null = null;
                        try {
                            thumbUrl = await renderPageThumbnail(pdf, i);
                        } catch {
                            thumbUrl = null;
                        }
                        added.push({
                            id: newId(),
                            sourceId,
                            pageIndex: i,
                            caption: `${file.name} — p${i + 1}`,
                            included: true,
                            thumbUrl,
                        });
                        if (i % 8 === 0) {
                            setStatus(
                                `Loading ${file.name}… page ${i + 1}/${pdf.numPages}`
                            );
                            await new Promise((r) => setTimeout(r, 0));
                        }
                    }
                } finally {
                    await pdf.cleanup();
                }
            }

            setSources(nextSources);
            setPages((prev) => [...prev, ...added]);
            setStatus(
                added.length
                    ? `Added ${added.length} page${added.length === 1 ? '' : 's'}. Nothing is uploaded or stored on a server.`
                    : null
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load PDF');
            setStatus(null);
        } finally {
            setBusy(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const reorder = (fromId: string, toId: string) => {
        if (fromId === toId) return;
        setPages((prev) => {
            const from = prev.findIndex((p) => p.id === fromId);
            const to = prev.findIndex((p) => p.id === toId);
            if (from < 0 || to < 0) return prev;
            const next = [...prev];
            const [item] = next.splice(from, 1);
            next.splice(to, 0, item);
            return next;
        });
    };

    const handleDownload = async () => {
        const count = pages.filter((p) => p.included).length;
        if (count === 0) {
            setError('Include at least one page.');
            return;
        }
        setBusy(true);
        setError(null);
        setStatus('Building PDF…');
        try {
            const bytes = await buildOutputPdf(pages, sources);
            downloadPdfBytes(bytes, 'combined.pdf');
            setStatus(`Downloaded ${count} page${count === 1 ? '' : 's'}.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Save failed');
            setStatus(null);
        } finally {
            setBusy(false);
        }
    };

    const onDragStart = (id: string) => (e: DragEvent) => {
        dragIdRef.current = id;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
    };

    const onDragOver = (id: string) => (e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverId !== id) setDragOverId(id);
    };

    const onDrop = (id: string) => (e: DragEvent) => {
        e.preventDefault();
        const from =
            dragIdRef.current || e.dataTransfer.getData('text/plain');
        dragIdRef.current = null;
        setDragOverId(null);
        if (from) reorder(from, id);
    };

    const onDragEnd = () => {
        dragIdRef.current = null;
        setDragOverId(null);
    };

    return (
        <div className="pb-16">
            <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
                <Link to="/">← Home</Link>
            </Button>

            <h1 className="font-heading mb-2 text-3xl font-semibold tracking-tight md:text-4xl">
                PDF Tool
            </h1>
            <p className="mb-8 max-w-2xl text-muted-foreground">
                Combine PDFs, reorder pages by drag-and-drop, and drop pages you
                don&apos;t need. Everything runs in your browser — files are never
                uploaded or stored.
            </p>

            <input
                ref={fileInputRef}
                id={fileInputId}
                type="file"
                accept="application/pdf,.pdf"
                multiple
                className="sr-only"
                onChange={(e) => void addFiles(e.target.files)}
            />

            <div className="mb-3 flex flex-wrap items-center gap-2">
                <Button
                    type="button"
                    size="sm"
                    disabled={busy}
                    onClick={() => fileInputRef.current?.click()}
                >
                    Add…
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy || pages.length === 0}
                    onClick={clearAll}
                >
                    Clear
                </Button>
                <select
                    className="h-7 rounded-lg border border-border bg-background px-2 text-[0.8rem]"
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as ViewMode)}
                    aria-label="View mode"
                >
                    <option value="grid">Grid</option>
                    <option value="list">List</option>
                </select>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pages.length === 0}
                    onClick={() => selectAll(true)}
                >
                    All
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pages.length === 0}
                    onClick={() => selectAll(false)}
                >
                    None
                </Button>
                <Button
                    type="button"
                    size="sm"
                    className="ml-auto"
                    disabled={busy || pages.length === 0}
                    onClick={() => void handleDownload()}
                >
                    Download
                </Button>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
                <label
                    htmlFor="pdf-range"
                    className="text-sm text-muted-foreground"
                >
                    Range:
                </label>
                <input
                    id="pdf-range"
                    type="text"
                    value={rangeSpec}
                    onChange={(e) => setRangeSpec(e.target.value)}
                    placeholder="5-17, 1,3,8-10"
                    className="h-7 w-44 rounded-lg border border-border bg-background px-2 text-sm md:w-56"
                    disabled={pages.length === 0}
                />
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pages.length === 0}
                    onClick={() => applyRange(true)}
                >
                    Check
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pages.length === 0}
                    onClick={() => applyRange(false)}
                >
                    Uncheck
                </Button>
                <span className="text-xs text-muted-foreground">
                    (list order: 5-17, 1,3,8-10)
                </span>
            </div>

            <p className="mb-4 text-sm text-muted-foreground">
                Checked pages are saved, in the order shown. Drag a thumbnail to
                reorder.
            </p>

            {error ? (
                <p className="mb-4 text-sm text-destructive" role="alert">
                    {error}
                </p>
            ) : null}
            {status ? (
                <p className="mb-4 text-sm text-muted-foreground">{status}</p>
            ) : null}

            {pages.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center text-muted-foreground">
                    <p className="mb-4">No pages yet. Add one or more PDFs to start.</p>
                    <Button
                        type="button"
                        disabled={busy}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Add PDFs
                    </Button>
                </div>
            ) : viewMode === 'grid' ? (
                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {pages.map((page, index) => (
                        <li
                            key={page.id}
                            className={cn(
                                'rounded-md p-1 transition-shadow',
                                dragOverId === page.id &&
                                    'ring-2 ring-primary ring-offset-2 ring-offset-background'
                            )}
                            onDragOver={onDragOver(page.id)}
                            onDrop={onDrop(page.id)}
                        >
                            <div className="mb-1 flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    checked={page.included}
                                    onChange={(e) =>
                                        setIncluded(page.id, e.target.checked)
                                    }
                                    aria-label={`Include page ${index + 1}`}
                                    className="mt-1"
                                />
                                <span className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                    {index + 1}. {page.caption}
                                </span>
                            </div>
                            <PageThumb
                                page={page}
                                onDragStart={onDragStart(page.id)}
                                onDragEnd={onDragEnd}
                            />
                        </li>
                    ))}
                </ul>
            ) : (
                <ul className="flex flex-col gap-3">
                    {pages.map((page, index) => (
                        <li
                            key={page.id}
                            className={cn(
                                'flex items-center gap-3 rounded-md p-1',
                                dragOverId === page.id &&
                                    'ring-2 ring-primary ring-offset-2 ring-offset-background'
                            )}
                            onDragOver={onDragOver(page.id)}
                            onDrop={onDrop(page.id)}
                        >
                            <input
                                type="checkbox"
                                checked={page.included}
                                onChange={(e) =>
                                    setIncluded(page.id, e.target.checked)
                                }
                                aria-label={`Include page ${index + 1}`}
                            />
                            <PageThumb
                                page={page}
                                onDragStart={onDragStart(page.id)}
                                onDragEnd={onDragEnd}
                                compact
                            />
                            <span className="min-w-0 flex-1 truncate text-sm">
                                {index + 1}. {page.caption}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function PageThumb({
    page,
    onDragStart,
    onDragEnd,
    compact = false,
}: {
    page: PageEntry;
    onDragStart: (e: DragEvent) => void;
    onDragEnd: () => void;
    compact?: boolean;
}) {
    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className={cn(
                'cursor-grab border border-border bg-card active:cursor-grabbing',
                page.included ? 'opacity-100' : 'opacity-40',
                compact ? 'h-16 w-12 shrink-0 overflow-hidden' : 'inline-block'
            )}
        >
            {page.thumbUrl ? (
                <img
                    src={page.thumbUrl}
                    alt=""
                    draggable={false}
                    className={cn(
                        'pointer-events-none block',
                        compact ? 'h-full w-full object-cover' : 'w-[152px]'
                    )}
                />
            ) : (
                <div
                    className={cn(
                        'flex items-center justify-center text-xs text-muted-foreground',
                        compact ? 'h-full w-full' : 'h-40 w-[152px]'
                    )}
                >
                    (preview failed)
                </div>
            )}
        </div>
    );
}

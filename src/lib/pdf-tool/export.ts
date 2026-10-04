import { PDFDocument } from 'pdf-lib';

import type { PageEntry, PdfSource } from '@/lib/pdf-tool/types';

export async function buildOutputPdf(
    pages: PageEntry[],
    sources: Map<string, PdfSource>
): Promise<Uint8Array> {
    const picked = pages.filter((p) => p.included);
    if (picked.length === 0) {
        throw new Error('Include at least one page.');
    }

    const out = await PDFDocument.create();
    const loaded = new Map<string, PDFDocument>();

    for (const page of picked) {
        let doc = loaded.get(page.sourceId);
        if (!doc) {
            const source = sources.get(page.sourceId);
            if (!source) {
                throw new Error(`Missing source for page ${page.caption}`);
            }
            doc = await PDFDocument.load(source.bytes);
            loaded.set(page.sourceId, doc);
        }
        const [copied] = await out.copyPages(doc, [page.pageIndex]);
        out.addPage(copied);
    }

    return out.save();
}

export function downloadPdfBytes(bytes: Uint8Array, filename: string): void {
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    const blob = new Blob([copy], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorker;

const THUMB_MAX_WIDTH = 152;

export async function loadPdfDocument(data: Uint8Array) {
    // Pass a copy so the original buffer stays usable for export.
    return getDocument({ data: data.slice() }).promise;
}

export async function renderPageThumbnail(
    pdf: Awaited<ReturnType<typeof loadPdfDocument>>,
    pageIndex: number,
    maxWidth = THUMB_MAX_WIDTH
): Promise<string> {
    const page = await pdf.getPage(pageIndex + 1);
    const base = page.getViewport({ scale: 1 });
    const scale = maxWidth / base.width;
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const canvasContext = canvas.getContext('2d');
    if (!canvasContext) {
        throw new Error('Could not create canvas context');
    }
    await page.render({ canvas, canvasContext, viewport }).promise;
    return canvas.toDataURL('image/jpeg', 0.75);
}

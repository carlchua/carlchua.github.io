export type PdfSource = {
    id: string;
    name: string;
    /** Raw PDF bytes kept in memory only for export. */
    bytes: Uint8Array;
};

export type PageEntry = {
    id: string;
    sourceId: string;
    /** 0-based page index within the source PDF. */
    pageIndex: number;
    caption: string;
    included: boolean;
    thumbUrl: string | null;
};

export type ViewMode = 'grid' | 'list';

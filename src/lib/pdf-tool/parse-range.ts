/**
 * Parse plain-text page lists into 1-based list positions.
 * Examples: "5-17", "1,3,8", "2, 5-7, 10"
 */
export function parsePageRangeSpec(spec: string): Set<number> {
    const trimmed = spec.trim();
    if (!trimmed) return new Set();

    const out = new Set<number>();
    for (const part of trimmed.split(',')) {
        const raw = part.trim();
        if (!raw) continue;

        if (raw.includes('-')) {
            const dash = raw.indexOf('-');
            const left = raw.slice(0, dash).trim();
            const right = raw.slice(dash + 1).trim();
            if (!left || !right) {
                throw new Error(`Invalid range: ${raw}`);
            }
            let a = Number(left);
            let b = Number(right);
            if (!Number.isInteger(a) || !Number.isInteger(b)) {
                throw new Error(`Invalid number in range: ${raw}`);
            }
            if (a < 1 || b < 1) {
                throw new Error('Page numbers must be at least 1.');
            }
            if (a > b) [a, b] = [b, a];
            for (let n = a; n <= b; n++) out.add(n);
        } else {
            const n = Number(raw);
            if (!Number.isInteger(n)) {
                throw new Error(`Invalid page number: ${raw}`);
            }
            if (n < 1) {
                throw new Error('Page numbers must be at least 1.');
            }
            out.add(n);
        }
    }
    return out;
}

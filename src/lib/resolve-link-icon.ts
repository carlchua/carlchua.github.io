import { FileText, Mail, type LucideIcon } from 'lucide-react';

import type { ThemeEmojiIcon } from '@/lib/theme-emoji-icons';

export type ResolvedLinkIcon =
    | { type: 'theme-emoji'; icon: ThemeEmojiIcon }
    | { type: 'lucide'; icon: LucideIcon };

export function resolveLinkIcon(
    href: string,
    label?: string
): ResolvedLinkIcon {
    const normalizedLabel = label?.toLowerCase();

    if (href.includes('github.com') || normalizedLabel === 'github') {
        return { type: 'theme-emoji', icon: 'github' };
    }

    if (href.includes('linkedin.com') || normalizedLabel === 'linkedin') {
        return { type: 'theme-emoji', icon: 'linkedin' };
    }

    if (href.startsWith('mailto:') || normalizedLabel === 'email') {
        return { type: 'lucide', icon: Mail };
    }

    if (
        href.endsWith('.pdf') ||
        normalizedLabel === 'paper' ||
        normalizedLabel === 'resume'
    ) {
        return { type: 'lucide', icon: FileText };
    }

    return { type: 'lucide', icon: FileText };
}

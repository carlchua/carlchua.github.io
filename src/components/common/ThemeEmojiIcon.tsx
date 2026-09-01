import { cn } from '@/lib/utils';
import {
    themeEmojiIcons,
    type ThemeEmojiIcon,
} from '@/lib/theme-emoji-icons';

export default function ThemeEmojiIcon({
    icon,
    darkMode,
    className,
}: {
    icon: ThemeEmojiIcon;
    darkMode: boolean;
    className?: string;
}) {
    const { dark, light } = themeEmojiIcons[icon];
    const restingSrc = darkMode ? dark : light;
    const activeSrc = darkMode ? light : dark;

    return (
        <span
            data-icon="inline-start"
            className={cn('relative inline-flex shrink-0', className)}
        >
            <img
                src={restingSrc}
                alt=""
                data-theme-emoji="rest"
                className="size-full group-hover/button:hidden group-active/button:hidden group-focus-visible/button:hidden"
            />
            <img
                src={activeSrc}
                alt=""
                aria-hidden="true"
                data-theme-emoji="active"
                className="hidden size-full group-hover/button:block group-active/button:block group-focus-visible/button:block"
            />
        </span>
    );
}

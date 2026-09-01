import type { ComponentProps } from 'react';

import ThemeEmojiIcon from '@/components/common/ThemeEmojiIcon';
import { Button } from '@/components/ui/button';
import { resolveLinkIcon } from '@/lib/resolve-link-icon';
import { cn } from '@/lib/utils';

type LinkButtonProps = {
    href: string;
    label: string;
    darkMode: boolean;
    variant?: ComponentProps<typeof Button>['variant'];
    size?: ComponentProps<typeof Button>['size'];
    className?: string;
};

export default function LinkButton({
    href,
    label,
    darkMode,
    variant = 'outline',
    size = 'sm',
    className,
}: LinkButtonProps) {
    const resolvedIcon = resolveLinkIcon(href, label);
    const isExternal = !href.startsWith('mailto:');
    const emojiSizeClass = size === 'lg' ? 'size-4' : 'size-3.5';

    return (
        <Button asChild variant={variant} size={size} className={className}>
            <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
            >
                {resolvedIcon.type === 'theme-emoji' ? (
                    <ThemeEmojiIcon
                        icon={resolvedIcon.icon}
                        darkMode={darkMode}
                        className={emojiSizeClass}
                    />
                ) : (
                    <resolvedIcon.icon
                        data-icon="inline-start"
                        className={cn(size !== 'lg' && 'size-3.5')}
                    />
                )}
                {label}
            </a>
        </Button>
    );
}

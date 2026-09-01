export type ThemeEmojiIcon = 'github' | 'linkedin';

export const themeEmojiIcons: Record<
    ThemeEmojiIcon,
    { dark: string; light: string }
> = {
    github: {
        dark: '/assets/emojis/github_dark_mode.png',
        light: '/assets/emojis/github_light_mode.png',
    },
    linkedin: {
        dark: '/assets/emojis/linkedin_dark_mode.png',
        light: '/assets/emojis/linkedin_light_mode.png',
    },
};

export function getThemeEmojiSrc(icon: ThemeEmojiIcon, darkMode: boolean) {
    return darkMode ? themeEmojiIcons[icon].dark : themeEmojiIcons[icon].light;
}

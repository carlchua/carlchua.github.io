import { cn } from '@/lib/utils';

export default function ThemeToggle({
    darkMode,
    toggleTheme,
}: {
    darkMode: boolean;
    toggleTheme: () => void;
}) {
    return (
        <div className="fixed top-[calc(1rem+env(safe-area-inset-top,0px))] right-4 z-[110]">
            <button
                type="button"
                onClick={toggleTheme}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                className={cn(
                    'flex h-9 min-w-[70px] items-center rounded-full border border-border bg-card p-1 shadow-sm transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
                )}
            >
                <div
                    className={cn(
                        'relative h-7 w-[62px] overflow-hidden rounded-full transition-colors',
                        darkMode
                            ? 'bg-gradient-to-br from-emerald-950 to-background'
                            : 'bg-gradient-to-br from-stone-200 to-primary'
                    )}
                >
                    <div className="absolute inset-0 flex items-center justify-between px-1.5">
                        <img
                            src="/assets/emojis/sun.png"
                            alt=""
                            className="size-4 opacity-70"
                        />
                        <img
                            src="/assets/emojis/moon.png"
                            alt=""
                            className="size-4 opacity-70"
                        />
                    </div>
                    <div
                        className={cn(
                            'absolute top-0.5 left-0.5 flex size-6 items-center justify-center rounded-full bg-card shadow-sm transition-transform duration-300',
                            darkMode && 'translate-x-[34px] bg-muted'
                        )}
                    >
                        <img
                            src={
                                darkMode
                                    ? '/assets/emojis/moon.png'
                                    : '/assets/emojis/sun.png'
                            }
                            alt=""
                            className="size-3.5"
                        />
                    </div>
                </div>
            </button>
        </div>
    );
}

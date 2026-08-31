import { useEffect, useRef, useState, type TouchEvent } from 'react';

import '@/styles/game/PaperButton.css';

export default function PaperButton({
    onSpawn,
}: {
    onSpawn: (coords: { x_pos: number; y_pos: number }) => void;
}) {
    const [currentFrame, setCurrentFrame] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const intervalRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const spawnTimerRef = useRef<number | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const totalFrames = 13;

    const startAnimation = () => {
        if (!isAnimating) {
            setIsAnimating(true);
            intervalRef.current = window.setInterval(() => {
                setCurrentFrame((prevFrame) => (prevFrame + 1) % totalFrames);
            }, 150);
        }
    };

    const stopAnimation = () => {
        if (isAnimating) {
            setIsAnimating(false);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            window.setTimeout(() => setCurrentFrame(0), 100);
        }
    };

    const handleMouseDown = () => {
        timeoutRef.current = window.setTimeout(() => {
            startAnimation();
        }, 300);

        const rect = buttonRef.current?.getBoundingClientRect();
        if (!rect) return;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        spawnTimerRef.current = window.setTimeout(() => {
            onSpawn({ x_pos: centerX, y_pos: centerY });
        }, 3000);
    };

    const handleMouseUp = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (spawnTimerRef.current) {
            clearTimeout(spawnTimerRef.current);
            spawnTimerRef.current = null;
        }
        stopAnimation();
    };

    const handleTouchStart = (e: TouchEvent) => {
        e.preventDefault();
        handleMouseDown();
    };

    const handleTouchEnd = (e: TouchEvent) => {
        e.preventDefault();
        handleMouseUp();
    };

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
        };
    }, []);

    return (
        <div className="paper-button-container">
            <button
                className={`paper-button ${isAnimating ? 'animating' : ''}`}
                ref={buttonRef}
                type="button"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                aria-label="Paper folding animation button"
            >
                <img
                    src={`/assets/game/paper/paper_${currentFrame}.png`}
                    alt={`Paper folding step ${currentFrame}`}
                    className="paper-sprite"
                    draggable={false}
                />
            </button>
        </div>
    );
}

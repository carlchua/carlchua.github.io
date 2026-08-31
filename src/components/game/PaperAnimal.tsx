import { useEffect, useRef, useState, type TouchEvent } from 'react';
import { Shake } from 'reshake';

import '@/styles/game/PaperButton.css';
import '@/styles/game/PaperAnimal.css';

export const animalDict = {
    crane: {
        movement_frames: 14,
        play_frames: 10,
        play_color: '#00d9ffff',
        shake: true,
    },
};

type AnimalName = keyof typeof animalDict;

export default function PaperAnimal({
    type,
    x_pos,
    y_pos,
}: {
    type: AnimalName;
    x_pos: number;
    y_pos: number;
}) {
    const [currentFrame, setCurrentFrame] = useState(0);
    const [currentPlayFrame, setCurrentPlayFrame] = useState(0);
    const [translate, setTranslate] = useState({ x: x_pos, y: y_pos });
    const [isPlaying, setIsPlaying] = useState(false);
    const timeoutRef = useRef<number | null>(null);
    const intervalRef = useRef<number | null>(null);
    const totalPlayFrames = animalDict[type].play_frames;
    const [velocity, setVelocity] = useState({
        x: Math.random() < 0.5 ? -Math.random() * 2 - 1 : Math.random() * 2 + 1,
        y: (Math.random() - 0.5) * 4,
    });

    const startPlay = () => {
        if (!isPlaying) {
            setIsPlaying(true);
            intervalRef.current = window.setInterval(() => {
                setCurrentPlayFrame((prevFrame) => (prevFrame + 1) % totalPlayFrames);
            }, 100);
        }
    };

    const stopPlay = () => {
        if (isPlaying) {
            setIsPlaying(false);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            window.setTimeout(() => setCurrentPlayFrame(0), 100);
        }
    };

    const handleMouseDown = () => {
        timeoutRef.current = window.setTimeout(() => {
            startPlay();
        }, 1);
    };

    const handleMouseUp = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        stopPlay();
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
        };
    }, []);

    useEffect(() => {
        const animate = () => {
            if (!isPlaying) {
                setTranslate((prev) => {
                    let newX = prev.x + velocity.x;
                    let newY = prev.y + velocity.y;
                    let newVelX = velocity.x;
                    let newVelY = velocity.y;
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    const spriteWidth = 80;
                    const spriteHeight = 80;

                    if (newX <= 0) {
                        newVelX = Math.abs(newVelX);
                        newX = 0;
                    } else if (newX >= viewportWidth - spriteWidth) {
                        newVelX = -Math.abs(newVelX);
                        newX = viewportWidth - spriteWidth;
                    }

                    if (newY <= 0) {
                        newVelY = Math.abs(newVelY);
                        newY = 0;
                    } else if (newY >= viewportHeight - spriteHeight) {
                        newVelY = -Math.abs(newVelY);
                        newY = viewportHeight - spriteHeight;
                    }

                    if (newVelX !== velocity.x || newVelY !== velocity.y) {
                        setVelocity({ x: newVelX, y: newVelY });
                    }

                    return { x: newX, y: newY };
                });

                setCurrentFrame((prev) => (prev + 1) % animalDict[type].movement_frames);
            }
        };

        const interval = window.setInterval(animate, 80);
        return () => clearInterval(interval);
    }, [velocity, type, isPlaying]);

    const currentImageSrc = isPlaying
        ? `/assets/game/${type}/${type}_play_${currentPlayFrame}.png`
        : `/assets/game/${type}/${type}_${currentFrame}.png`;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                transform: `translate(${translate.x}px, ${translate.y}px)`,
                zIndex: 1000,
                pointerEvents: 'none',
            }}
        >
            <button
                className={`paper-button ${isPlaying ? 'playing' : ''}`}
                style={{ pointerEvents: 'auto' }}
                type="button"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <Shake
                    h={0}
                    v={animalDict[type].shake && isPlaying ? 20 : 0}
                    r={animalDict[type].shake && isPlaying ? 20 : 0}
                    dur={1500}
                    int={20}
                    max={100}
                    fixed={false}
                >
                    <img
                        src={currentImageSrc}
                        alt={type}
                        className="paper-sprite"
                        draggable={false}
                        style={{
                            transform: velocity.x < 0 ? 'scaleX(-1)' : 'scaleX(1)',
                            transition: 'transform 0.1s ease',
                            animation: isPlaying
                                ? 'playingBounce 0.5s ease-in-out infinite alternate'
                                : 'none',
                        }}
                    />
                </Shake>
            </button>
        </div>
    );
}

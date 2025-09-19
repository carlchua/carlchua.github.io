import { useState, useRef, useEffect } from 'react';

import '../../styles/game/PaperButton.css';
import '../../styles/game/PaperAnimal.css';

export const animalDict = {
    crane: {
        movement_frames: 14,
        play_frames: 10,
        play_color: '#00d9ffff',
    },
};

export default function PaperAnimal({ type, x_pos, y_pos }) {
    const [currentFrame, setCurrentFrame] = useState(0);
    const [currentPlayFrame, setCurrentPlayFrame] = useState(0);

    const [translate, setTranslate] = useState({
        x: x_pos,
        y: y_pos,
    });

    const [isPlaying, setIsPlaying] = useState(false);

    const timeoutRef = useRef(null);
    const intervalRef = useRef(null);

    const totalPlayFrames = animalDict[type].play_frames;

    ///////////////////////// PLAY CODE /////////////////////////////
    const startPlay = () => {
        if (!isPlaying) {
            setIsPlaying(true);
            console.log(`${currentImageSrc}`);
            intervalRef.current = setInterval(() => {
                setCurrentPlayFrame(
                    (prevFrame) => (prevFrame + 1) % totalPlayFrames
                );
            }, 100); // Change frame every 150ms
        }
    };

    const stopPlay = () => {
        if (isPlaying) {
            setIsPlaying(false);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            // Reset to first frame after stopping
            setTimeout(() => setCurrentPlayFrame(0), 100);
        }
    };

    const handleMouseDown = () => {
        // Start animation after a short delay (long press)
        timeoutRef.current = setTimeout(() => {
            startPlay();
        }, 1);
    };

    const handleMouseUp = () => {
        // Clear the timeout if mouse up happens before long press
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        stopPlay();
    };

    const handleMouseLeave = () => {
        // Stop animation if mouse leaves button
        handleMouseUp();
    };

    // Touch events for mobile
    const handleTouchStart = (e) => {
        e.preventDefault();
        handleMouseDown();
    };

    const handleTouchEnd = (e) => {
        e.preventDefault();
        handleMouseUp();
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
    //////////////////////////////////////////////////////////////////

    //////////////////////  MOVEMENT CODE  ///////////////////////////
    // Random initial direction and speed
    const [velocity, setVelocity] = useState({
        x: (Math.random() - 0.5) * 4, // Random speed between -2 and 2
        y: (Math.random() - 0.5) * 4,
    });

    // Continuous movement with bouncing
    useEffect(() => {
        const animate = () => {
            // Only move if not playing
            if (!isPlaying) {
                setTranslate((prev) => {
                    let newX = prev.x + velocity.x;
                    let newY = prev.y + velocity.y;
                    let newVelX = velocity.x;
                    let newVelY = velocity.y;

                    // Get actual viewport dimensions
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    const spriteWidth = 80;
                    const spriteHeight = 80;

                    // Bounce off left and right edges
                    if (newX <= 0) {
                        newVelX = Math.abs(newVelX); // Force positive
                        newX = 0;
                    } else if (newX >= viewportWidth - spriteWidth) {
                        newVelX = -Math.abs(newVelX); // Force negative
                        newX = viewportWidth - spriteWidth;
                    }

                    // Bounce off top and bottom edges
                    if (newY <= 0) {
                        newVelY = Math.abs(newVelY); // Force positive
                        newY = 0;
                    } else if (newY >= viewportHeight - spriteHeight) {
                        newVelY = -Math.abs(newVelY); // Force negative
                        newY = viewportHeight - spriteHeight;
                    }

                    // Update velocity if it changed
                    if (newVelX !== velocity.x || newVelY !== velocity.y) {
                        setVelocity({ x: newVelX, y: newVelY });
                    }

                    return { x: newX, y: newY };
                });

                // Cycle through animation frames
                setCurrentFrame(
                    (prev) => (prev + 1) % animalDict[type].movement_frames
                );
            }
        };

        const interval = setInterval(animate, 80); // Update every 50ms for smooth movement

        return () => clearInterval(interval);
    }, [velocity, type, isPlaying]);
    ////////////////////////////////////////////////////////////////////////////////////////

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
                pointerEvents: 'none', // Don't interfere with page interactions
            }}
        >
            <button
                className={`paper-button ${isPlaying ? 'playing' : ''}`}
                style={{ pointerEvents: 'auto' }} // Enable interactions on the button
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <img
                    src={currentImageSrc}
                    alt={`${type}`}
                    className="paper-sprite"
                    draggable={false}
                    style={{
                        transform: velocity.x < 0 ? 'scaleX(-1)' : 'scaleX(1)', // Flip when moving left
                        transition: 'transform 0.1s ease', // Smooth flip transition
                        filter: isPlaying
                            ? `drop-shadow(0 0 20px ${animalDict[type].play_color}) brightness(1.3)`
                            : 'none',
                        animation: isPlaying
                            ? 'playingBounce 0.5s ease-in-out infinite alternate'
                            : 'none',
                    }}
                />
            </button>
        </div>
    );
}

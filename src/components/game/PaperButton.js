import React, { useState, useRef, useEffect } from 'react';
import '../../styles/game/PaperButton.css';

function PaperButton({ onSpawn }) {
    const [currentFrame, setCurrentFrame] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);
    const buttonRef = useRef(null);
    let timer;
    
    const totalFrames = 13; // paper_0.png through paper_12.png

    const startAnimation = () => {
        if (!isAnimating) {
            setIsAnimating(true);
            intervalRef.current = setInterval(() => {
                setCurrentFrame((prevFrame) => (prevFrame + 1) % totalFrames);
            }, 150); // Change frame every 150ms
        }
    };

    const stopAnimation = () => {
        if (isAnimating) {
            setIsAnimating(false);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            // Reset to first frame after stopping
            setTimeout(() => setCurrentFrame(0), 100);
        }
    };

    const handleMouseDown = () => {
        // Start animation after a short delay (long press)
        timeoutRef.current = setTimeout(() => {
            startAnimation();
        }, 300); // 300ms delay for long press

        // Spawn animal if held for 3 seconds
        const rect = buttonRef.current.getBoundingClientRect();
        // Center of the button
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        timer = setTimeout(() => {
            console.log('spawned at', centerX, centerY);
            onSpawn({ x_pos: centerX, y_pos: centerY }); // spawn after hold
        }, 3000);
    };

    const handleMouseUp = () => {
        // Clear the timeout if mouse up happens before long press
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        stopAnimation();
        clearTimeout(timer);
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

    const currentImageSrc = `/assets/game/paper/paper_${currentFrame}.png`;

    return (
        <div className="paper-button-container">
            <button
                className={`paper-button ${isAnimating ? 'animating' : ''}`}
                ref={buttonRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                aria-label="Paper folding animation button"
            >
                <img
                    src={currentImageSrc}
                    alt={`Paper folding step ${currentFrame}`}
                    className="paper-sprite"
                    draggable={false}
                />
            </button>
        </div>
    );
};

export default PaperButton;

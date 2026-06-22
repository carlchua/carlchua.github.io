import React, { useState, useCallback } from 'react';
import PaperButton from '../game/PaperButton';
import PaperAnimal from '../game/PaperAnimal';
import { animalDict } from '../game/PaperAnimal';
import '../../styles/content/Section.css';

export default function RandomStuff() {
    const [possibleAnimals, setPossibleAnimals] = useState(
        Object.keys(animalDict)
    );
    const [currentAnimals, setAnimals] = useState([]);
    
    const spawnAnimal = useCallback(({ x_pos, y_pos }) => {
        setPossibleAnimals((prevPossible) => {
            setAnimals((prevAnimals) => {
                console.log("🎯 Spawn attempt - Possible animals:", prevPossible.length);
                console.log("🎯 Spawn attempt - Current animals:", prevAnimals.length);
                
                if (prevPossible.length === 0) {
                    console.log("❌ No more animals to spawn");
                    return prevAnimals; // Return unchanged
                }

                const randomIndex = Math.floor(Math.random() * prevPossible.length);
                const randomAnimal = prevPossible[randomIndex];
                
                console.log("✅ Spawning:", randomAnimal, "at", x_pos, y_pos);

                const newAnimal = {
                    id: Date.now() + Math.random(), // Ensure unique ID even if called rapidly
                    name: randomAnimal,
                    x_pos: x_pos,
                    y_pos: y_pos,
                };
                const updated = [...prevAnimals, newAnimal];
                console.log("📝 Updated animals array:", updated.map(a => a.name));
                return updated;
            });
            
            // Return updated possible animals (remove the spawned one)
            if (prevPossible.length === 0) return prevPossible;
            
            const randomIndex = Math.floor(Math.random() * prevPossible.length);
            const randomAnimal = prevPossible[randomIndex];
            const updated = prevPossible.filter((key) => key !== randomAnimal);
            console.log("📝 Remaining possible animals:", updated);
            return updated;
        });
    }, []); // Empty dependency array since we use state updater functions

    return (
        <section className="section-container random-section" data-section="random-stuff">
            <div className="section-content">
                <PaperButton onSpawn={spawnAnimal} />
                
                {currentAnimals.map((a) => (
                    <PaperAnimal key={a.id} type={a.name} x_pos={a.x_pos} y_pos={a.y_pos} />
                ))}
            </div>
        </section>
    );
}

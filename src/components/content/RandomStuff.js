import React, { useState } from 'react';
import PaperButton from '../game/PaperButton';
import PaperAnimal from '../game/PaperAnimal';
import { animalDict } from '../game/PaperAnimal';
import '../../styles/content/Section.css';

export default function RandomStuff() {
    const [possibleAnimals, setPossibleAnimals] = useState(
        Object.keys(animalDict)
    );
    const [animals, setAnimals] = useState([]);
    const spawnAnimal = ({ x_pos, y_pos }) => {
        if (possibleAnimals.length === 0) return; // no more animals to spawn

        const randomIndex = Math.floor(Math.random() * possibleAnimals.length);
        const randomAnimal = possibleAnimals[randomIndex];

        setAnimals((prev) => [
            ...prev,
            {
                id: prev.length + 1,
                name: randomAnimal,
                x_pos: x_pos,
                y_pos: y_pos,
            },
        ]);
        console.log("Spawned", randomAnimal, "at", x_pos, y_pos);
        // remove this animal from the pool
        setPossibleAnimals((prev) => prev.filter((key) => key !== randomAnimal));
        console.log("Remaining animals:", possibleAnimals);
        console.log("Current animals:", animals);
    };

    return (
        <section className="section-container" data-section="random-stuff">
            <h2 className="section-title">Random Stuff</h2>
            <div className="section-content">
                Work in Progress. Check back later!
                <PaperButton onSpawn={spawnAnimal} />
                {animals.map((a) => (
                    <PaperAnimal key={a.id} type={a.name} x_pos={a.x_pos} y_pos={a.y_pos} />
                ))}
            </div>
        </section>
    );
}

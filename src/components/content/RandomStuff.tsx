import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import PaperAnimal, { animalDict } from '@/components/game/PaperAnimal';
import PaperButton from '@/components/game/PaperButton';
import { Section, SectionHeading } from '@/components/content/Section';

type AnimalName = keyof typeof animalDict;

type SpawnedAnimal = {
    id: number;
    name: AnimalName;
    x_pos: number;
    y_pos: number;
};

export default function RandomStuff() {
    const [, setPossibleAnimals] = useState<AnimalName[]>(
        Object.keys(animalDict) as AnimalName[]
    );
    const [currentAnimals, setAnimals] = useState<SpawnedAnimal[]>([]);

    const spawnAnimal = useCallback(({ x_pos, y_pos }: { x_pos: number; y_pos: number }) => {
        setPossibleAnimals((prevPossible) => {
            setAnimals((prevAnimals) => {
                if (prevPossible.length === 0) {
                    return prevAnimals;
                }

                const randomIndex = Math.floor(Math.random() * prevPossible.length);
                const randomAnimal = prevPossible[randomIndex];

                return [
                    ...prevAnimals,
                    {
                        id: Date.now() + Math.random(),
                        name: randomAnimal,
                        x_pos,
                        y_pos,
                    },
                ];
            });

            if (prevPossible.length === 0) return prevPossible;

            const randomIndex = Math.floor(Math.random() * prevPossible.length);
            const randomAnimal = prevPossible[randomIndex];
            return prevPossible.filter((key) => key !== randomAnimal);
        });
    }, []);

    return (
        <Section id="random-stuff" className="pb-24">
            <SectionHeading>Random Stuff</SectionHeading>
            <div className="grid items-start gap-5 md:grid-cols-2">
                <div className="flex justify-center md:justify-start">
                    <PaperButton onSpawn={spawnAnimal} />
                </div>
                <div className="flex items-center justify-center md:justify-start md:pt-8">
                    <Link
                        to="/chord-finder"
                        className="font-heading text-xl text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline md:text-2xl"
                    >
                        Chord Tool
                    </Link>
                </div>
            </div>
            {currentAnimals.map((animal) => (
                <PaperAnimal
                    key={animal.id}
                    type={animal.name}
                    x_pos={animal.x_pos}
                    y_pos={animal.y_pos}
                />
            ))}
        </Section>
    );
}

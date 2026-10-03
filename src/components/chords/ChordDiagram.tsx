import Fretboard from '@/components/chords/Fretboard';
import type { ChordPosition } from '@/lib/chords';

type ChordDiagramProps = {
    position: ChordPosition;
    label?: string;
};

export default function ChordDiagram({ position, label }: ChordDiagramProps) {
    return (
        <div className="min-w-0">
            {label ? (
                <p className="mb-2 text-center text-xs text-muted-foreground">
                    {label}
                </p>
            ) : null}
            <Fretboard
                pattern={position.frets}
                fingers={position.fingers}
                readOnly
                compact
            />
        </div>
    );
}

import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="flex min-h-[70vh] flex-col items-start justify-center">
            <img
                src="/assets/emojis/snowboarder.png"
                alt="Snowboarder going off trail"
                className="mb-6 size-20"
            />
            <h1 className="font-heading mb-3 text-4xl font-semibold tracking-tight">
                Off trail
            </h1>
            <p className="mb-6 max-w-md text-lg leading-relaxed text-muted-foreground">
                Oops! You&apos;ve gone off trail. Maybe you should go back home.
            </p>
            <Button asChild>
                <Link to="/">Home</Link>
            </Button>
        </div>
    );
}

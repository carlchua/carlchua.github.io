import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function Section({
    id,
    className,
    children,
}: {
    id: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <section
            data-section={id}
            id={id}
            className={cn('scroll-mt-[calc(3.75rem+env(safe-area-inset-top,0px))] py-16 md:scroll-mt-10 md:py-20', className)}
        >
            {children}
        </section>
    );
}

export function SectionHeading({
    eyebrow,
    children,
}: {
    eyebrow?: string;
    children: ReactNode;
}) {
    return (
        <div className="mb-10 max-w-2xl">
            {eyebrow ? (
                <p className="mb-3 text-[0.7rem] font-medium tracking-[0.22em] text-primary uppercase">
                    {eyebrow}
                </p>
            ) : null}
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance md:text-4xl">
                {children}
            </h2>
        </div>
    );
}

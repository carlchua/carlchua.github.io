import type { CSSProperties } from 'react';

import LinkButton from '@/components/common/LinkButton';
import { ShimmeringText } from '@/components/shimmering-text';
import { Section } from '@/components/content/Section';

const links = [
    {
        href: '/assets/docs/resume.pdf',
        label: 'Resume',
    },
    {
        href: 'https://github.com/carlchua',
        label: 'GitHub',
    },
    {
        href: 'mailto:carllenard.chua@gmail.com',
        label: 'Email',
    },
    {
        href: 'https://www.linkedin.com/in/carl-chua/',
        label: 'LinkedIn',
    },
];

export default function Intro({ darkMode }: { darkMode: boolean }) {
    return (
        <Section id="intro" className="pt-10 md:pt-6">
            <p className="font-heading mb-4 text-xl text-foreground italic md:text-2xl">
                Hi, I&apos;m
            </p>
            <h1 className="font-heading mb-8 text-5xl font-semibold tracking-tight md:text-7xl">
                <ShimmeringText
                    key={darkMode ? 'dark' : 'light'}
                    text="Carl"
                    duration={1.6}
                    className="font-heading text-5xl font-semibold tracking-tight md:text-7xl"
                    style={
                        {
                            '--color': 'var(--name-shimmer-from)',
                            '--shimmering-color': 'var(--name-shimmer-to)',
                        } as CSSProperties
                    }
                />
            </h1>
            <p className="mb-10 max-w-xl text-base leading-relaxed text-foreground md:text-lg">
                I enjoy learning about cutting-edge advances in Artificial
                Intelligence and Machine Learning. At work, I specialize in
                implementing them on scalable & reliable platforms. When I&apos;m
                not on my computer, I like to snowboard, play guitar/sax, and
                try out new restaurants around the bay (please let me know if
                you have recs for a good Malaysian restaurant).
            </p>
            <div className="flex flex-wrap gap-2.5">
                {links.map((link) => (
                    <LinkButton
                        key={link.label}
                        href={link.href}
                        label={link.label}
                        darkMode={darkMode}
                        size="lg"
                    />
                ))}
            </div>
        </Section>
    );
}

import { FileText, FolderGit2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Section, SectionHeading } from '@/components/content/Section';

const projects = [
    {
        title: 'Dynamic Obstacles Avoidance in Coverage Path Planning Via Deep Reinforcement Learning',
        description:
            'Final paper for CS285 (Deep Reinforcement Learning) Fall 2021 at UC Berkeley.',
        links: [
            {
                href: '/assets/docs/cs285_paper.pdf',
                label: 'Paper',
                icon: FileText,
            },
            {
                href: 'https://github.com/carlchua/cs285_rl_files',
                label: 'GitHub',
                icon: FolderGit2,
            },
        ],
    },
    {
        title: 'NBA Predictor',
        description: 'A predictor for NBA games 🏀',
        links: [
            {
                href: 'https://github.com/carlchua/nbapredictor',
                label: 'GitHub',
                icon: FolderGit2,
            },
        ],
    },
];

export default function Projects() {
    return (
        <Section id="projects">
            <SectionHeading eyebrow="Selected">Projects</SectionHeading>
            <div className="grid gap-5 md:grid-cols-2">
                {projects.map((project) => (
                    <Card
                        key={project.title}
                        className="h-full transition-transform duration-300 hover:-translate-y-0.5"
                    >
                        <CardHeader>
                            <CardTitle className="font-heading text-lg leading-snug md:text-xl">
                                {project.title}
                            </CardTitle>
                            <CardDescription className="text-[0.95rem] leading-relaxed">
                                {project.description}
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="mt-auto gap-2 border-t-0 bg-transparent">
                            {project.links.map(({ href, label, icon: Icon }) => (
                                <Button key={label} asChild variant="outline" size="sm">
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Icon data-icon="inline-start" />
                                        {label}
                                    </a>
                                </Button>
                            ))}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </Section>
    );
}

import LinkButton from '@/components/common/LinkButton';
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Section, SectionHeading } from '@/components/content/Section';

type ProjectLink = {
    href: string;
    label: string;
};

const projects: {
    title: string;
    description: string;
    links: ProjectLink[];
}[] = [
    {
        title: 'Dynamic Obstacles Avoidance in Coverage Path Planning Via Deep Reinforcement Learning',
        description:
            'Final paper for CS285 (Deep Reinforcement Learning) Fall 2021 at UC Berkeley.',
        links: [
            {
                href: '/assets/docs/cs285_paper.pdf',
                label: 'Paper',
            },
            {
                href: 'https://github.com/carlchua/cs285_rl_files',
                label: 'GitHub',
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
            },
        ],
    },
];

export default function Projects({ darkMode }: { darkMode: boolean }) {
    return (
        <Section id="projects">
            <SectionHeading>Projects</SectionHeading>
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
                            {project.links.map((link) => (
                                <LinkButton
                                    key={link.label}
                                    href={link.href}
                                    label={link.label}
                                    darkMode={darkMode}
                                />
                            ))}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </Section>
    );
}

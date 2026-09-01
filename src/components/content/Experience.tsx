import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Section, SectionHeading } from '@/components/content/Section';

const roles = [
    {
        title: 'Senior Software Engineer',
        company: 'Labelbox',
        href: 'https://labelbox.com/',
        duration: 'November 2025 — Present',
        current: true,
        points: [
            <>
                Developed a full-stack{' '}
                <a
                    href="https://labelbox.com/products/agent-studio/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                >
                    RL evaluation platform
                </a>{' '}
                for agent evaluation and benchmarking.
            </>,
            <>
                Built a cross-platform video collection app and GCP processing
                pipeline for ego-centric robotics RL training videos.
            </>,
        ],
    },
    {
        title: 'Software Engineer',
        company: 'BlackRock',
        href: 'https://www.blackrock.com/us/individual',
        duration: 'August 2022 — November 2025',
        current: false,
        points: [
            <>
                Built out agentic framework, setting up gRPC-based servers to
                integrate multiple agents into a single Copilot, with over 98%
                query routing accuracy.
            </>,
            <>
                Implemented RAG-based plugins. Processed and cleaned data to
                enhance synthetic data generation for fine-tuning embedding
                models, speeding up pipelines by 15%.
            </>,
            <>
                Added internal agent observability by logging Langchain
                execution traces to Grafana, with PII filtering.
            </>,
        ],
    },
    {
        title: 'ML Engineer Intern',
        company: 'Rimble Esports Analytics',
        href: 'https://rimble.io/',
        duration: 'Summer 2021',
        current: false,
        points: [
            <>
                Created custom ML models to predict live-time and pregame
                statistics for esports.
            </>,
        ],
    },
];

export default function Experience() {
    return (
        <Section id="experience">
            <SectionHeading>Experience</SectionHeading>
            <ol className="relative space-y-6 border-l border-border pl-6 md:pl-8">
                {roles.map((role) => (
                    <li key={role.company} className="relative">
                        <span className="absolute top-6 -left-[1.7rem] size-3 rounded-full bg-primary ring-4 ring-background md:-left-[2.2rem]" />
                        <Card className="transition-transform duration-300 hover:-translate-y-0.5">
                            <CardHeader className="gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <CardTitle className="font-heading text-lg md:text-xl">
                                        {role.title}
                                    </CardTitle>
                                    {role.current ? (
                                        <Badge variant="secondary">Present</Badge>
                                    ) : null}
                                </div>
                                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                                    <a
                                        href={role.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-primary underline-offset-4 hover:underline"
                                    >
                                        {role.company}
                                    </a>
                                    <span className="text-muted-foreground">
                                        {role.duration}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc space-y-2 pl-5 text-[0.95rem] leading-relaxed text-foreground">
                                    {role.points.map((point, index) => (
                                        <li key={index}>{point}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </li>
                ))}
            </ol>
        </Section>
    );
}

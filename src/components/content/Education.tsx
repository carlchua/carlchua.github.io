import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Section, SectionHeading } from '@/components/content/Section';

export default function Education() {
    return (
        <Section id="education">
            <SectionHeading>Education</SectionHeading>
            <Card className="transition-transform duration-300 hover:-translate-y-0.5">
                <CardHeader>
                    <CardTitle className="font-heading text-lg md:text-xl">
                        University of California, Berkeley
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">2018 — 2022</p>
                </CardHeader>
                <CardContent className="text-[0.95rem] leading-relaxed text-muted-foreground">
                    B.S. Electrical Engineering & Computer Science (EECS)
                </CardContent>
            </Card>
        </Section>
    );
}

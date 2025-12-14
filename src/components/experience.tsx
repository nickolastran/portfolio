"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

const experiences = [
    {
        id: 1,
        title: "Undergraduate Researcher",
        company:
            "Artificial Intelligence Explainability Accountability (AIEA) Lab",
        period: "Mar. 2025 - Jun. 2025",
        achievements: [
            "Boosted autonomous vehicle simulation by 40% by containerizing workflows with Docker and orchestrating parallel test execution using Kubernetes.",
            "Conducted large-scale CARLA-based adversarial sensor attack simulations, improving attack detection accuracy by **25%** through scalable, automated testing pipelines.",
            "Spearheaded a fault-tolerant AV testing infrastructure, increasing simulation uptime by 25% and enabling consistent evaluation of vehicle robustness during adversarial attack scenarios.",
        ],
    },
    {
        id: 2,
        title: "Program Lead",
        company: "Iron Campers Summer Robotics Camp",
        period: "Aug. 2025 - Aug. 2025",
        achievements: [
            "Led and expanded a week-long robotics summer camp for rising 3rd–8th grade students, introducing core concepts in robotics, python programming, CAD (Tinkercad), and engineering design through hands-on projects.",
            "Instructed students in programming and mechanical design using FTC/XRP drive bases, supporting the creation of custom mechanisms and autonomous/teleop behaviors.",
            "Mentored a team of counselors, ensuring smooth daily operations, consistent instruction, and a positive learning environment.",
        ],
    },
];

export default function Experience() {
    const [expandedIds, setExpandedIds] = useState<number[]>([1]);

    const toggleExpand = (id: number) => {
        setExpandedIds((prev) =>
            prev.includes(id)
                ? prev.filter((expId) => expId !== id)
                : [...prev, id],
        );
    };

    return (
        <section id="experience" className="py-20 px-6 bg-background">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-foreground uppercase tracking-wide">
                    Experience
                </h2>

                <div className="space-y-6">
                    {experiences.map((exp) => (
                        <div
                            key={exp.id}
                            className="border-b border-border pb-6"
                        >
                            <button
                                onClick={() => toggleExpand(exp.id)}
                                className="w-full text-left group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-base font-bold text-foreground mb-2">
                                            {exp.company}
                                        </h3>
                                        <div className="text-sm text-muted-foreground">
                                            {exp.title}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-xs text-muted-foreground whitespace-nowrap bg-muted px-2.5 py-1 rounded-full border border-border">
                                            {exp.period}
                                        </span>
                                        <svg
                                            className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                                                expandedIds.includes(exp.id)
                                                    ? "rotate-90"
                                                    : ""
                                            }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                                    expandedIds.includes(exp.id)
                                        ? "max-h-[2000px] opacity-100 mt-4"
                                        : "max-h-0 opacity-0"
                                }`}
                            >
                                <ul className="space-y-3">
                                    {exp.achievements.map((achievement, i) => (
                                        <li
                                            key={i}
                                            className={`flex items-start gap-2 text-muted-foreground text-sm leading-relaxed transition-all duration-500 ease-out ${
                                                expandedIds.includes(exp.id)
                                                    ? "opacity-100 translate-y-0"
                                                    : "opacity-0 translate-y-2"
                                            }`}
                                            style={{
                                                transitionDelay:
                                                    expandedIds.includes(exp.id)
                                                        ? `${i * 100}ms`
                                                        : "0ms",
                                            }}
                                        >
                                            <span className="text-muted-foreground/70 mt-1.5 text-xs shrink-0">
                                                •
                                            </span>
                                            <div className="flex-1">
                                                <ReactMarkdown
                                                    components={{
                                                        p: (props) => (
                                                            <span {...props} />
                                                        ),
                                                        strong: (props) => (
                                                            <strong
                                                                className="text-foreground font-semibold"
                                                                {...props}
                                                            />
                                                        ),
                                                        em: (props) => (
                                                            <em
                                                                className="text-foreground/80 italic"
                                                                {...props}
                                                            />
                                                        ),
                                                        code: (props) => (
                                                            <code
                                                                className="bg-muted text-foreground px-1.5 py-0.5 rounded text-xs font-mono"
                                                                {...props}
                                                            />
                                                        ),
                                                    }}
                                                >
                                                    {achievement}
                                                </ReactMarkdown>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

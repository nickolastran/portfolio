"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown } from "lucide-react";
import { FaGithub } from "react-icons/fa";

import BentoCard from "./bento-card";
import SectionHeader, { SECTION } from "./section-header";

const VISIBLE_COUNT = 4;
const PEEK = 90;

interface Project {
    id: number;
    title: string;
    period: string;
    description: string;
    tech: string[];
    points?: string[];
    github?: string;
}

const projects: Project[] = [
    {
        id: 1,
        title: "Strikeout Prop Projections",
        period: "Jul. 2026",
        description:
            "Projection model for MLB pitcher strikeout prop lines.",
        tech: ["Python", "JavaScript", "HTML"],
        github: "https://github.com/nickolastran/strikeout-prop-projections",
    },
    {
        id: 2,
        title: "MLB Standing Predictor",
        period: "Jul. 2026",
        description: "Model forecasting MLB final season standings.",
        tech: ["Python", "TypeScript", "CSS"],
        github: "https://github.com/nickolastran/MLB-Standing-Pred",
    },
    {
        id: 3,
        title: "Stat Sightline",
        period: "Apr. 2026",
        description: "MLB advanced metrics and predictive modeling.",
        tech: ["Python", "sklearn", "Matplotlib", "PostgreSQL"],
        github: "https://github.com/nickolastran/stat-sightline"
    },
    {
        id: 4,
        title: "CodeCompass",
        period: "Dec. 2025",
        description: "AI powered documentation and chatbot for codebases using RAG.",
        tech: [
            "Python",
            "TypeScript",
            "React",
            "REST API",
            "PostgreSQL",
            "Supabase",
        ],
        github: "https://github.com/vinngo/codecompass",
    },
    {
        id: 5,
        title: "AI Sentiment Analyzer",
        period: "Jan. 2025",
        description:
            "An analysis application tracking sentiment of Reddit posts.",
        tech: ["Python", "Flask", "React", "MongoDB", "VADER", "REST API"],
        github: "https://github.com/nickolastran/sentiment-analyzer",
    },
];

const foldButton =
    "group/btn flex items-center gap-2 px-6 py-3 rounded-full bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-neutral-200 font-semibold text-sm shadow-md hover:shadow-lg hover:border-blue-500/50 hover:scale-105 transition-all duration-300 cursor-pointer";

function ProjectCard({ project }: { project: Project }) {
    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {project.title}
                </h3>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap shrink-0 px-2.5 py-1 bg-neutral-100 dark:bg-white/5 rounded-full border border-neutral-200 dark:border-white/10">
                    {project.period}
                </span>
            </div>

            <p className="text-[15px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {project.description}
            </p>

            {project.points && (
                <ul className="space-y-2">
                    {project.points.map((point, i) => (
                        <li
                            key={i}
                            className="flex items-start gap-2.5 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed"
                        >
                            <span className="mt-[7px] w-1 h-1 rounded-full bg-neutral-400 dark:bg-neutral-500 shrink-0" />
                            <span>{point}</span>
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                    <span
                        key={tech}
                        className="text-[12px] font-medium bg-neutral-100/50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 py-1 px-2.5 rounded-lg text-neutral-700 dark:text-neutral-300 hover:border-blue-500/50 transition-colors"
                    >
                        {tech}
                    </span>
                ))}
            </div>

            {project.github && (
                <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center self-start gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-neutral-900 dark:bg-white text-white dark:text-black hover:scale-105 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-sm"
                >
                    <FaGithub className="w-4 h-4" />
                    Source
                </a>
            )}
        </div>
    );
}

export default function Projects() {
    const [showAll, setShowAll] = useState(false);
    const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    // Measure where the first hidden row starts, so the fold survives cards of
    // differing heights and any column count.
    useEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;

        const measure = () => {
            const cards = Array.from(grid.children) as HTMLElement[];
            if (cards.length <= VISIBLE_COUNT) {
                setCollapsedHeight(null);
                return;
            }
            setCollapsedHeight(cards[VISIBLE_COUNT].offsetTop + PEEK);
        };

        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(grid);
        return () => observer.disconnect();
    }, []);

    const canCollapse = collapsedHeight !== null;

    return (
        <section id="projects" className={SECTION}>
            <SectionHeader
                icon={BookOpen}
                iconClassName="text-blue-500"
                title="Featured Projects"
                subtitle="A few of the things I've built."
            />

            <div className="relative">
                <motion.div
                    initial={false}
                    animate={{
                        height: !canCollapse || showAll ? "auto" : collapsedHeight,
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 22 }}
                    className="overflow-hidden"
                >
                    <div
                        ref={gridRef}
                        className="relative grid grid-cols-1 md:grid-cols-2 gap-5"
                    >
                        {projects.map((project, index) => (
                            <BentoCard key={project.id} delay={index * 0.05}>
                                <ProjectCard project={project} />
                            </BentoCard>
                        ))}
                    </div>
                </motion.div>

                <AnimatePresence>
                    {canCollapse && !showAll && (
                        <motion.div
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-center pb-2 bg-linear-to-t from-neutral-50 via-neutral-50/95 to-transparent dark:from-neutral-950 dark:via-neutral-950/95 z-20 pointer-events-none"
                        >
                            <button
                                onClick={() => setShowAll(true)}
                                className={`${foldButton} pointer-events-auto`}
                            >
                                <span>Show More Projects</span>
                                <ChevronDown
                                    size={16}
                                    className="text-neutral-500 group-hover/btn:text-blue-500 group-hover/btn:translate-y-0.5 transition-all duration-300"
                                />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {canCollapse && showAll && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="flex justify-center mt-6"
                    >
                        <button
                            onClick={() => {
                                setShowAll(false);
                                document
                                    .getElementById("projects")
                                    ?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className={foldButton}
                        >
                            <span>Show Less</span>
                            <ChevronDown
                                size={16}
                                className="rotate-180 text-neutral-500 group-hover/btn:text-blue-500 group-hover/btn:-translate-y-0.5 transition-all duration-300"
                            />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, SquareArrowOutUpRight } from "lucide-react";
import { FaGithub } from "react-icons/fa";

import BentoCard from "./bento-card";
import SectionHeader, { SECTION } from "./section-header";

const VISIBLE_COUNT = 3;
const PEEK = 90;

interface Project {
    id: number;
    title: string;
    period: string;
    description: string;
    tech: string[];
    points?: string[];
    github?: string;
    /* Live site. Without one the demo button just points at the repo. */
    demo?: string;
    /* Hover preview. Drop a file in /public and point at it, e.g.
       image: "/projects/stat-sightline.png". Without one the card falls back
       to GitHub's own social-preview card for the repo. */
    image?: string;
}

/* github.com/owner/repo -> opengraph.githubassets.com/1/owner/repo, the same
   PNG GitHub renders when a repo link is unfurled. */
function previewSrc(project: Project) {
    if (project.image) return project.image;
    if (!project.github) return null;
    const repo = new URL(project.github).pathname.replace(/^\/|\/$/g, "");
    return `https://opengraph.githubassets.com/1/${repo}`;
}

const projects: Project[] = [
    {
        id: 1,
        title: "Strikeout Prop Projections",
        period: "Jul. 2026",
        description:
            "Projection model for MLB pitcher strikeout prop lines.",
        tech: ["Python", "JavaScript", "HTML", "Reinforced Learning"],
        github: "https://github.com/nickolastran/strikeout-prop-projections",
    },
    {
        id: 2,
        title: "MLB Standing Predictor",
        period: "Jul. 2026",
        description: "Model forecasting MLB final season standings.",
        tech: ["Python", "TypeScript", "CSS", "Reinforced Learning"],
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
            "RAG",
        ],
        github: "https://github.com/nickolastran/codecompass",
        demo: "https://codecompass-eight.vercel.app",
        image: "/projects/codecompass.jpg",
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

const iconLink =
    "rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white transition-colors";

const PREVIEW_W = 280;
const PREVIEW_H = 190;

function ProjectCard({ project }: { project: Project }) {
    const [broken, setBroken] = useState(false);
    const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
    const src = broken ? null : previewSrc(project);

    // Offset from the cursor, clamped so the popup never leaves the viewport.
    const track = (e: React.MouseEvent) =>
        setPos({
            x: Math.min(e.clientX + 20, window.innerWidth - PREVIEW_W - 12),
            y: Math.min(e.clientY + 20, window.innerHeight - PREVIEW_H - 12),
        });

    return (
        <div
            className="flex flex-col h-full gap-4"
            onMouseMove={src ? track : undefined}
            onMouseLeave={() => setPos(null)}
        >
            {/* Portal: the card clips its overflow, the popup must not be cut. */}
            {src &&
                pos &&
                createPortal(
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.15 }}
                        style={{ left: pos.x, top: pos.y, width: PREVIEW_W }}
                        className="pointer-events-none fixed z-50 overflow-hidden rounded-xl border border-white/10 bg-neutral-900 shadow-2xl"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={src}
                            alt=""
                            onError={() => setBroken(true)}
                            className="aspect-[2/1] w-full object-cover"
                        />
                        <p className="truncate px-3 py-2 text-center text-xs font-bold text-white">
                            {project.title}
                        </p>
                    </motion.div>,
                    document.body,
                )}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                        {project.title}
                    </h3>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {project.period}
                    </span>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    {(project.demo ?? project.github) && (
                        <a
                            href={project.demo ?? project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${project.title} demo`}
                            className={iconLink}
                        >
                            <SquareArrowOutUpRight className="h-4 w-4" />
                        </a>
                    )}
                    {project.github && (
                        <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${project.title} source`}
                            className={iconLink}
                        >
                            <FaGithub className="h-4 w-4" />
                        </a>
                    )}
                </div>
            </div>

            <p className="text-[13px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {project.description}
            </p>

            {project.points && (
                <ul className="space-y-1.5">
                    {project.points.map((point, i) => (
                        <li
                            key={i}
                            className="flex items-start gap-2 text-[13px] text-neutral-600 dark:text-neutral-400 leading-relaxed"
                        >
                            <span className="mt-[7px] w-1 h-1 rounded-full bg-neutral-400 dark:bg-neutral-500 shrink-0" />
                            <span>{point}</span>
                        </li>
                    ))}
                </ul>
            )}

            <TechRow tech={project.tech} />
        </div>
    );
}

const chipClass =
    "shrink-0 text-[11px] font-medium bg-neutral-100/50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 py-0.5 px-2 rounded-md text-neutral-700 dark:text-neutral-300";

/* One line always. If the chips overflow the card they scroll themselves,
   otherwise they sit still — a marquee on three chips just looks broken. */
function TechRow({ tech }: { tech: string[] }) {
    const boxRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const [marquee, setMarquee] = useState(false);

    useEffect(() => {
        const box = boxRef.current;
        const track = trackRef.current;
        if (!box || !track) return;

        // Measured against the *first* copy only: comparing the doubled track
        // would keep the condition true forever once it flipped on.
        const measure = () =>
            setMarquee(track.scrollWidth > box.clientWidth + 1);
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(box);
        return () => observer.disconnect();
    }, [tech]);

    const chips = tech.map((t) => (
        <span key={t} className={chipClass}>
            {t}
        </span>
    ));

    return (
        <div ref={boxRef} className="mt-auto overflow-hidden pt-1">
            <div
                className={`flex w-max gap-1.5 ${marquee ? "marquee" : ""}`}
                style={
                    {
                        "--marquee-duration": `${tech.length * 7}s`,
                    } as React.CSSProperties
                }
            >
                <div ref={trackRef} className="flex shrink-0 gap-1.5">
                    {chips}
                </div>
                {marquee && (
                    <div aria-hidden className="flex shrink-0 gap-1.5">
                        {chips}
                    </div>
                )}
            </div>
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
                        className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {projects.map((project, index) => (
                            <BentoCard
                                key={project.id}
                                delay={index * 0.05}
                                className="rounded-2xl p-4 md:p-4"
                            >
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

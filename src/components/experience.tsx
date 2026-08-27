"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

import SectionHeader, { SECTION } from "./section-header";

const AIEA_LAB =
    "Artificial Intelligence Explainability Accountability (AIEA) Lab";

const experiences = [
    {
        id: 1,
        title: (<>Undergraduate Researcher @ <i>University of California, Santa Cruz</i></>),
        company: AIEA_LAB,
        period: "Jan. 2026 - Jun. 2026",
        achievements: [
            "Engineered an Explainable AI (xAI) autograder system to evaluate student source code, replacing binary output testing with structured feedback that identified **100%** of core logic and syntax misconceptions in student submissions.",
            "Developed automated semantic analysis pipelines that reduced grading turn-around time for instructors by **35%**, optimizing curriculum evaluation through automated aggregation of performance trends in undergraduate courses.",
            "Integrated formative feedback mechanisms based on educational research frameworks, improving student learning efficiency and boosting subsequent assignment scores by an average of **15%** due to clearer outcomes.",
        ],
    },
    {
        id: 2,
        title: (<>Undergraduate Researcher @ <i>University of California, Santa Cruz</i></>),
        company: AIEA_LAB,
        period: "Mar. 2025 - Dec. 2025",
        achievements: [
            "Boosted autonomous vehicle (AV) simulation efficiency by **35%** by architecting scalable testing environments using Docker containers and Kubernetes orchestration for parallelized adversarial sensor attack simulations.",
            "Improved adversarial sensor attack detection accuracy by **20%** by leveraging CARLA simulator integrated with a Kubernetes-based distributed testing pipeline.",
            "Engineered a high-availability, fault-tolerant testing framework for AV simulations, utilizing container orchestration to increase system uptime by **25%** and ensure rigorous, reproducible performance evaluation during stress testing.",
        ],
    },
];

const isPresent = (period: string) => /\b(present|current)\b/i.test(period);

// react-markdown passes a `node` prop that must not reach the DOM.
type MdProps<T extends keyof React.JSX.IntrinsicElements> =
    React.ComponentProps<T> & { node?: unknown };

const markdownComponents = {
    p: ({ node, ...props }: MdProps<"span">) => <span {...props} />,
    strong: ({ node, ...props }: MdProps<"strong">) => (
        <strong
            className="text-neutral-900 dark:text-neutral-100 font-semibold"
            {...props}
        />
    ),
    em: ({ node, ...props }: MdProps<"em">) => (
        <em className="text-neutral-700 dark:text-neutral-300 italic" {...props} />
    ),
    code: ({ node, ...props }: MdProps<"code">) => (
        <code
            className="bg-neutral-100 dark:bg-white/10 text-neutral-900 dark:text-neutral-100 px-1.5 py-0.5 rounded text-xs font-mono"
            {...props}
        />
    ),
};

export default function Experience() {
    return (
        <section id="experience" className={SECTION}>
            <SectionHeader
                icon="/briefcase.png"
                iconClassName="text-blue-500"
                title="Experience"
                subtitle="Where I've worked and what I built there."
            />

            <div className="relative border-l border-neutral-200 dark:border-white/10 ml-6 md:ml-12">
                {experiences.map((exp) => {
                    const present = isPresent(exp.period);
                    return (
                        <div key={exp.id} className="relative pl-6 sm:pl-8 py-6 group">
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20,
                                    delay: 0.1,
                                }}
                                className={`absolute -left-[5px] top-8 w-2.5 h-2.5 rounded-full ring-4 ring-neutral-50 dark:ring-neutral-950 z-10 ${
                                    present
                                        ? "bg-blue-500 dark:bg-blue-400"
                                        : "bg-neutral-300 dark:bg-neutral-600 group-hover:bg-neutral-400 dark:group-hover:bg-neutral-500"
                                } transition-colors`}
                            />
                            {present && (
                                <div className="absolute -left-[5px] top-8 w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-ping opacity-75" />
                            )}

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <h3
                                        className={`text-xl font-bold ${
                                            present
                                                ? "text-neutral-900 dark:text-white"
                                                : "text-neutral-700 dark:text-neutral-300"
                                        }`}
                                    >
                                        {exp.title}
                                    </h3>
                                    <p
                                        className={`text-sm font-medium ${
                                            present
                                                ? "text-blue-600 dark:text-blue-400"
                                                : "text-neutral-500 dark:text-neutral-400"
                                        }`}
                                    >
                                        {exp.period}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 mt-1">
                                    <span
                                        className={`text-base font-semibold ${
                                            present
                                                ? "text-blue-600 dark:text-blue-400"
                                                : "text-neutral-600 dark:text-neutral-400"
                                        }`}
                                    >
                                        {exp.company}
                                    </span>
                                    {present && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 uppercase ring-1 ring-blue-500/20">
                                            Current
                                        </span>
                                    )}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.4, delay: 0.3 }}
                                className="mt-4 space-y-3"
                            >
                                {exp.achievements.map((achievement, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: "-50px" }}
                                        transition={{
                                            duration: 0.3,
                                            delay: 0.4 + i * 0.1,
                                        }}
                                        className="flex items-start gap-3 group/point"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-white/5 flex items-center justify-center shrink-0 mt-0.5 group-hover/point:border-blue-500/30 group-hover/point:bg-blue-50 dark:group-hover/point:bg-blue-500/10 transition-colors shadow-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 group-hover/point:bg-blue-500 dark:group-hover/point:bg-blue-400 transition-colors" />
                                        </div>
                                        <span className="text-sm md:text-[15px] text-neutral-600 dark:text-neutral-400 group-hover/point:text-neutral-900 dark:group-hover/point:text-neutral-200 transition-colors flex-1 leading-relaxed">
                                            <ReactMarkdown components={markdownComponents}>
                                                {achievement}
                                            </ReactMarkdown>
                                        </span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

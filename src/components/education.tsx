"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { GraduationCap } from "lucide-react";

import SectionHeader, { SECTION } from "./section-header";

const education = [
    {
        id: 1,
        school: "University of California, Santa Cruz",
        degree:
            "Bachelor of Science in Computer Science, Minor in Applied Mathematics",
        period: "2022 - 2026",
        logo: "/ucsclogo.png",
    },
    {
        id: 2,
        school: "Capuchino High School",
        degree: "High School Diploma",
        period: "2018 - 2022",
        logo: "/capuchinohslogo.png",
    },
];

export default function Education() {
    return (
        <section id="education" className={SECTION}>
            <SectionHeader
                icon={GraduationCap}
                iconClassName="text-amber-500"
                title="Education"
            />

            <div className="flex flex-col rounded-3xl border border-neutral-200 dark:border-white/5 bg-white/40 dark:bg-neutral-900/40 overflow-hidden">
                {education.map((edu, index) => (
                    <motion.div
                        key={edu.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex gap-4 items-start p-5 border-b border-neutral-200 dark:border-white/5 last:border-b-0 hover:bg-neutral-100/50 dark:hover:bg-white/5 transition-colors"
                    >
                        <div className="relative w-12 h-12 shrink-0 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 overflow-hidden">
                            <Image
                                src={edu.logo}
                                alt={`${edu.school} logo`}
                                fill
                                sizes="48px"
                                quality={100}
                                className="object-contain p-1"
                            />
                        </div>

                        <div className="flex-1 min-w-0 flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
                                    {edu.school}
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    {edu.degree}
                                </p>
                            </div>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap shrink-0 px-2.5 py-1 bg-neutral-100 dark:bg-white/5 rounded-full border border-neutral-200 dark:border-white/10">
                                {edu.period}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

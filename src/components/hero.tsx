"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { HiOutlineMail } from "react-icons/hi";

import { PORTFOLIO } from "../constants/portfolio";
import BentoCard from "./bento-card";
import PlaceholderCard from "./placeholder-card";
import LiveClock from "./live-clock";
import ThemeToggle from "./theme-toggle";

const SOCIAL_ICONS = {
    GitHub: FaGithub,
    LinkedIn: FaLinkedin,
    Twitter: FaXTwitter,
    Email: HiOutlineMail,
} as const;

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const LOGOS = new Map<string, string>(
    PORTFOLIO.stack.map((t) => [t.name, t.logo]),
);
const EMPHASIZED = new Set<string>(PORTFOLIO.emphasis);

// Longest first so "full-stack software engineering" wins over any substring.
const BIO_PARTS = PORTFOLIO.bio.split(
    new RegExp(
        `(${[...EMPHASIZED, ...LOGOS.keys()]
            .sort((a, b) => b.length - a.length)
            .map(escapeRegex)
            .join("|")})`,
        "g",
    ),
);

function NameRow() {
    const [roleIndex, setRoleIndex] = useState(0);

    useEffect(() => {
        const id = setInterval(
            () => setRoleIndex((i) => (i + 1) % PORTFOLIO.roles.length),
            2200,
        );
        return () => clearInterval(id);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
            <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight">
                {PORTFOLIO.name}{" "}
                <span className="inline-block text-neutral-500 dark:text-neutral-600">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                            key={PORTFOLIO.roles[roleIndex]}
                            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
                            transition={{ duration: 0.45, ease: "easeInOut" }}
                            className="inline-block"
                        >
                            {PORTFOLIO.roles[roleIndex]}
                        </motion.span>
                    </AnimatePresence>
                </span>
            </h1>

            <div className="flex items-center gap-3 md:mb-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-green-600 dark:text-green-500 whitespace-nowrap">
                    {PORTFOLIO.availability}
                </span>
                <ThemeToggle />
            </div>
        </motion.div>
    );
}

function AboutCard() {
    return (
        <BentoCard className="md:col-span-2 md:row-span-2" delay={0}>
            <div className="flex flex-col h-full justify-center gap-5">
                <div className="space-y-5">
                    <Image
                        className="w-32 h-32 md:w-44 md:h-44 rounded-2xl object-cover shadow-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent dark:border-white/5"
                        src={PORTFOLIO.avatar}
                        alt={PORTFOLIO.name}
                        width={176}
                        height={176}
                        priority
                    />

                    <div className="space-y-3">
                        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white leading-tight">
                            About me.
                        </h2>
                        <p className="text-neutral-700 dark:text-neutral-300 text-[15px] md:text-base leading-loose">
                            {BIO_PARTS.map((part, i) => {
                                const logo = LOGOS.get(part);
                                if (logo) {
                                    return (
                                        <span
                                            key={i}
                                            className="inline-flex items-center gap-1.5 text-[13px] font-semibold bg-neutral-100 dark:bg-white/10 border border-neutral-200 dark:border-white/20 py-0.5 px-2 rounded-lg text-black dark:text-white align-baseline shadow-xs mx-0.5"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={logo}
                                                alt=""
                                                width={14}
                                                height={14}
                                                className="w-3.5 h-3.5 object-contain"
                                            />
                                            {part}
                                        </span>
                                    );
                                }
                                if (EMPHASIZED.has(part)) {
                                    return (
                                        <strong
                                            key={i}
                                            className="font-bold text-neutral-900 dark:text-neutral-100"
                                        >
                                            {part}
                                        </strong>
                                    );
                                }
                                return <span key={i}>{part}</span>;
                            })}
                        </p>

                    </div>
                </div>
            </div>
        </BentoCard>
    );
}

function LocationCard() {
    return (
        <BentoCard delay={0.1}>
            <div className="flex flex-col items-center justify-center text-center gap-3 h-full">
                <div className="relative w-full h-24 bg-neutral-200 dark:bg-neutral-800 rounded-xl overflow-hidden opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="absolute inset-0 bg-[radial-gradient(#a3a3a3_1px,transparent_1px)] dark:bg-[radial-gradient(#404040_1px,transparent_1px)] bg-size-[8px_8px] opacity-20" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-blue-500 rounded-full animate-ping" />
                            <MapPin
                                size={24}
                                className="text-blue-500 dark:text-blue-400 relative z-10"
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-neutral-900 dark:text-white font-semibold">
                        {PORTFOLIO.location}
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-500">
                        <LiveClock timezone={PORTFOLIO.timezone} /> (
                        {PORTFOLIO.timezone})
                    </p>
                </div>
            </div>
        </BentoCard>
    );
}

function SocialsCard() {
    return (
        <BentoCard delay={0.2}>
            <div className="grid grid-cols-2 gap-3 h-full content-center">
                {PORTFOLIO.socials.map((link) => {
                    const Icon = SOCIAL_ICONS[link.label];
                    return (
                        <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center p-3 rounded-xl bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 hover:scale-105 transition-all duration-300 group"
                        >
                            <Icon className="w-5 h-5 mb-2 text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                            <span className="text-[10px] text-neutral-600 dark:text-neutral-500">
                                {link.label}
                            </span>
                        </a>
                    );
                })}
            </div>
        </BentoCard>
    );
}

export default function Hero() {
    return (
        <section
            id="hero"
            className="min-h-screen flex flex-col justify-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        >
            <NameRow />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:auto-rows-[minmax(220px,auto)]">
                <AboutCard />
                <LocationCard />
                <SocialsCard />
                <PlaceholderCard className="lg:col-span-2" delay={0.3} />
                <PlaceholderCard delay={0.4} />
            </div>
        </section>
    );
}

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, X } from "lucide-react";

import BentoCard from "./bento-card";
import { allTechItems, TechCategories, TechItem } from "./skills";

const logos = allTechItems.map((tech) => (
    <TechItem key={tech.name} tech={tech} />
));

export default function TechStackCard({
    className = "",
    delay,
}: {
    className?: string;
    delay: number;
}) {
    const [open, setOpen] = useState(false);
    // false during SSR/hydration, true after — portals can't hydrate.
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <BentoCard className={className} delay={delay}>
            <div className="flex flex-col h-full gap-4">
                <h2 className="text-xl font-bold text-center text-neutral-900 dark:text-white">
                    Tech Stack
                </h2>

                <div className="flex-1 flex items-center overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                    {/* gap-1.5 between the copies is what .marquee's loop math expects. */}
                    <div
                        className="flex w-max gap-1.5 marquee"
                        style={{ "--marquee-duration": "45s" } as React.CSSProperties}
                    >
                        <div className="flex shrink-0">{logos}</div>
                        <div aria-hidden className="flex shrink-0">
                            {logos}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setOpen(true)}
                    className="self-center inline-flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                    <Maximize2 className="h-3.5 w-3.5" />
                    Expand
                </button>
            </div>

            {/* Portaled: BentoCard's transform would otherwise trap `fixed` inside the card. */}
            {mounted &&
                createPortal(
                    <AnimatePresence>
                        {open && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setOpen(false)}
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                            >
                                <motion.div
                                    role="dialog"
                                    aria-modal="true"
                                    aria-label="Tech Stack"
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="relative w-full max-w-5xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 p-6 md:p-10"
                                >
                                    <button
                                        onClick={() => setOpen(false)}
                                        aria-label="Close"
                                        autoFocus
                                        className="absolute top-4 right-4 h-9 w-9 inline-flex items-center justify-center rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    <TechCategories />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}
        </BentoCard>
    );
}

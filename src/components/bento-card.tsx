"use client";

import { motion } from "framer-motion";

import { cn } from "../lib/utils";

interface BentoCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export default function BentoCard({
    children,
    className = "",
    delay = 0,
}: BentoCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay }}
            /* cn, not a template string: callers override bg/border and the
               later class has to actually win. */
            className={cn(
                "group relative overflow-hidden rounded-3xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-white/5 p-4 md:p-6 hover:border-neutral-300 dark:hover:border-white/10 transition-colors duration-300 shadow-sm dark:shadow-none",
                className,
            )}
        >
            <div className="relative z-10 h-full">{children}</div>
        </motion.div>
    );
}

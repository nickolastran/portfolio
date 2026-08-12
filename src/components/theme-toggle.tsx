"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // theme is unknown until mounted; render a placeholder of the same size
    if (!mounted) {
        return (
            <div className="h-9 w-9 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        );
    }

    const isLight = theme === "light";

    return (
        <button
            onClick={() => setTheme(isLight ? "dark" : "light")}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
        >
            <motion.div
                initial={false}
                animate={{ rotate: isLight ? 0 : 180 }}
                transition={{ duration: 0.3 }}
            >
                {isLight ? <Moon size={18} /> : <Sun size={18} />}
            </motion.div>
        </button>
    );
}

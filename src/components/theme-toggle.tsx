"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
    const { setTheme } = useTheme();

    return (
        <button
            // read the class instead of `theme`, so the first click works
            // before next-themes has hydrated
            onClick={() =>
                setTheme(
                    document.documentElement.classList.contains("dark")
                        ? "light"
                        : "dark",
                )
            }
            className="relative h-9 w-9 flex items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
            aria-label="Toggle theme"
        >
            {/* both icons render server-side; the dark variant swaps them, so
                there is no post-hydration flash */}
            <Moon
                size={18}
                className="absolute rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0"
            />
            <Sun
                size={18}
                className="absolute rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100"
            />
        </button>
    );
}

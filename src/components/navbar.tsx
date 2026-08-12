"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Gamepad2, Home, PartyPopper, User } from "lucide-react";

const TABS = [
    { label: "Home", href: "/", icon: Home },
    { label: "About Me", href: "/about", icon: User },
    { label: "Fun", href: "/fun", icon: PartyPopper },
    { label: "Games", href: "/games", icon: Gamepad2 },
];

export default function Navbar() {
    const pathname = usePathname();
    const [open, setOpen] = useState<string | null>(null);

    return (
        // mobile: left side, since the table of contents owns the top right
        <nav className="fixed top-4 left-4 md:left-auto md:right-4 z-50 flex items-center gap-1 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-lg border border-neutral-200 dark:border-white/10 px-2 py-1.5 shadow-lg">
            {TABS.map((tab) => (
                <Link
                    key={tab.href}
                    href={tab.href}
                    aria-label={tab.label}
                    onMouseEnter={() => setOpen(tab.href)}
                    onMouseLeave={() => setOpen(null)}
                    onFocus={() => setOpen(tab.href)}
                    onBlur={() => setOpen(null)}
                    className={
                        "flex items-center rounded-full px-2.5 py-2 transition-colors " +
                        (pathname === tab.href
                            ? "bg-neutral-100 dark:bg-white/10 text-neutral-900 dark:text-white"
                            : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white")
                    }
                >
                    <tab.icon className="size-4 shrink-0" />
                    <motion.span
                        initial={false}
                        animate={{
                            width: open === tab.href ? "auto" : 0,
                            marginLeft: open === tab.href ? 6 : 0,
                            opacity: open === tab.href ? 1 : 0,
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="overflow-hidden whitespace-nowrap text-sm"
                    >
                        {tab.label}
                    </motion.span>
                </Link>
            ))}
        </nav>
    );
}

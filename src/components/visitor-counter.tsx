"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

import BentoCard from "./bento-card";

// Free keyless counter (abacus.jasoncameron.dev) — no DB, no auth, no cookies.
const COUNTER = "https://abacus.jasoncameron.dev/%OP%/nickolastran-portfolio/visits";

export default function VisitorCounter({ delay }: { delay: number }) {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        // One hit per browser session — reloads just read the current value.
        const seen = sessionStorage.getItem("visitor-counted");
        fetch(COUNTER.replace("%OP%", seen ? "get" : "hit"), {
            cache: "no-store",
        })
            .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
            .then(({ value }) => {
                sessionStorage.setItem("visitor-counted", "1");
                setCount(value);
            })
            .catch((error) =>
                console.error("Error fetching visitor count:", error),
            );
    }, []);

    return (
        <BentoCard delay={delay}>
            <div className="flex flex-col items-center justify-center text-center gap-3 h-full">
                <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-white/5">
                    <div className="absolute inset-0 rounded-2xl bg-purple-500/10 animate-pulse" />
                    <Eye
                        size={22}
                        className="text-purple-500 dark:text-purple-400 relative z-10"
                    />
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-neutral-900 dark:text-white tabular-nums">
                        {count === null ? "—" : count.toLocaleString()}
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-500">
                        visits since Aug 2026
                    </p>
                </div>
            </div>
        </BentoCard>
    );
}

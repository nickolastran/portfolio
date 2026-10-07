import { Blocks, Gamepad2, Grid3x3, Type } from "lucide-react";
import Link from "next/link";

import BentoCard from "../../components/bento-card";
import { SECTION } from "../../components/section-header";

export const metadata = { title: "Games - Nickolas Tran" };

const GAMES: { name: string; icon: typeof Type; className: string; href?: string }[] = [
    { name: "Sudoku", icon: Grid3x3, className: "md:col-span-2 md:row-span-2", href: "/games/sudoku" },
    { name: "Crossword", icon: Type, className: "", href: "/games/crossword" },
    { name: "Block Blast", icon: Blocks, className: "" },
    { name: "Tetris", icon: Gamepad2, className: "md:col-span-3" },
];

export default function Games() {
    return (
        <main className="min-h-screen">
            <section className={SECTION}>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    Games
                </h1>
                <p className="text-neutral-600 dark:text-neutral-500 text-sm mt-1">
                    This section is a work in progress.
                </p>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:auto-rows-[200px]">
                    {GAMES.map(({ name, icon: Icon, className, href }, i) => (
                        <BentoCard key={name} className={className} delay={i * 0.1}>
                            {href && (
                                <Link href={href} aria-label={name} className="absolute inset-0 z-10" />
                            )}
                            <div className="flex h-full min-h-32 flex-col justify-between">
                                <Icon className="text-neutral-400" size={28} />
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                        {name}
                                    </h2>
                                    <p className="text-neutral-600 dark:text-neutral-500 text-sm">
                                        {href ? "Play" : "Coming soon"}
                                    </p>
                                </div>
                            </div>
                        </BentoCard>
                    ))}
                </div>
            </section>
        </main>
    );
}

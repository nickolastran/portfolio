import { Blocks, Gamepad2, Grid3x3, Type } from "lucide-react";

import BentoCard from "../../components/bento-card";
import { SECTION } from "../../components/section-header";

export const metadata = { title: "Games - Nickolas Tran" };

const GAMES = [
    { name: "Sudoku", icon: Grid3x3, className: "md:col-span-2 md:row-span-2" },
    { name: "Crossword", icon: Type, className: "" },
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
                    {GAMES.map(({ name, icon: Icon, className }, i) => (
                        <BentoCard key={name} className={className} delay={i * 0.1}>
                            <div className="flex h-full min-h-32 flex-col justify-between">
                                <Icon className="text-neutral-400" size={28} />
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                        {name}
                                    </h2>
                                    <p className="text-neutral-600 dark:text-neutral-500 text-sm">
                                        Coming soon
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

import { Blocks, Gamepad2, Grid3x3, Type } from "lucide-react";
import Link from "next/link";

import BentoCard from "../../components/bento-card";
import { SECTION } from "../../components/section-header";

export const metadata = { title: "Games - Nickolas Tran" };

// A board mid-game for the Sudoku card: givens, a few of your entries, one
// selected cell. 0 is empty.
const PUZZLE = "530070000600195000098000060800060003400803001700020006060000280000419005000080079";
const ENTRIES: Record<number, number> = { 2: 4, 11: 2, 20: 8, 30: 7 };
const SELECTED = 21;

function SudokuBackdrop() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute -right-8 top-1/2 grid w-80 md:-right-12 md:w-[30rem] -translate-y-1/2 -rotate-6 grid-cols-3 gap-[2px] rounded-lg bg-neutral-600 p-[2px] opacity-40 transition-opacity duration-300 group-hover:opacity-70 [mask-image:linear-gradient(to_left,black_45%,transparent)]"
        >
            {Array.from({ length: 9 }, (_, b) => (
                <div key={b} className="grid grid-cols-3 gap-px bg-neutral-800">
                    {Array.from({ length: 9 }, (_, k) => {
                        const i = (Math.floor(b / 3) * 3 + Math.floor(k / 3)) * 9 + (b % 3) * 3 + (k % 3);
                        const given = Number(PUZZLE[i]);
                        return (
                            <span
                                key={k}
                                className={`grid aspect-square place-items-center text-lg md:text-2xl ${i === SELECTED ? "bg-blue-400/25" : "bg-neutral-900"} ${given ? "font-semibold text-neutral-200" : "text-blue-400"}`}
                            >
                                {given || ENTRIES[i] || ""}
                            </span>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

const GAMES: { name: string; icon: typeof Type; className: string; href?: string; art?: React.ReactNode }[] = [
    { name: "Sudoku", icon: Grid3x3, className: "md:col-span-2 md:row-span-2", href: "/games/sudoku", art: <SudokuBackdrop /> },
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
                    {GAMES.map(({ name, icon: Icon, className, href, art }, i) => (
                        <BentoCard key={name} className={className} delay={i * 0.1}>
                            {art}
                            {href && (
                                <Link href={href} aria-label={name} className="absolute inset-0 z-10" />
                            )}
                            <div className="relative flex h-full min-h-32 flex-col justify-between">
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

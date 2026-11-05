import { ArrowDownToLine, Blocks, Bomb, Grid3x3, Type } from "lucide-react";
import Link from "next/link";

import BentoCard from "../../components/bento-card";
import { SECTION } from "../../components/section-header";
import BlocksBackdrop from "../../games/blocks/backdrop";
import CrosswordBackdrop from "../../games/crossword/backdrop";
import StackBackdrop from "../../games/stack/backdrop";
import MinesweeperBackdrop from "../../games/minesweeper/backdrop";
import SudokuBackdrop from "../../games/sudoku/backdrop";

export const metadata = { title: "Games - Nickolas Tran" };

const GAMES: { name: string; icon: typeof Type; className: string; href?: string; art?: React.ReactNode }[] = [
    { name: "Sudoku", icon: Grid3x3, className: "md:col-span-2 md:row-span-2", href: "/games/sudoku", art: <SudokuBackdrop /> },
    { name: "Crossword", icon: Type, className: "", href: "/games/crossword", art: <CrosswordBackdrop /> },
    { name: "Blocks", icon: Blocks, className: "", href: "/games/blocks", art: <BlocksBackdrop /> },
    { name: "Minesweeper", icon: Bomb, className: "", href: "/games/minesweeper", art: <MinesweeperBackdrop /> },
    { name: "Stack", icon: ArrowDownToLine, className: "md:col-span-2", href: "/games/stack", art: <StackBackdrop /> },
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

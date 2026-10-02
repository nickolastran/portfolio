import { Kalam } from "next/font/google";

import Crossword from "../../../components/crossword";
import { SECTION } from "../../../components/section-header";

export const metadata = { title: "Crossword - Nickolas Tran" };

// Handwriting for the letters you fill in, so the board reads like pen on paper.
const ink = Kalam({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-ink" });

export default function CrosswordPage() {
    return (
        <main className={`${ink.variable} min-h-screen bg-white text-neutral-900`}>
            <section className={SECTION}>
                <h1 className="text-3xl font-bold text-[#1c2a7a]">Crossword</h1>
                <p className="mt-2 max-w-xl text-neutral-600">
                    A new puzzle every time. Click a square and start typing. Click it again or press
                    space to switch direction, and press tab for the next clue.
                </p>
                <Crossword />
            </section>
        </main>
    );
}

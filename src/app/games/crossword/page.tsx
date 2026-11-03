import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import Crossword from "../../../games/crossword/crossword";
import { SECTION } from "../../../components/section-header";

export const metadata = { title: "Crossword - Nickolas Tran" };

export default function CrosswordPage() {
    return (
        <main className="min-h-screen">
            <section className={SECTION}>
                <header className="flex items-center">
                    <Link
                        href="/games"
                        title="Games"
                        aria-label="Back to games"
                        className="-ml-3 grid size-10 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-800/60 hover:text-neutral-200"
                    >
                        <ChevronLeft size={22} />
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Crossword</h1>
                </header>
                <Crossword />
            </section>
        </main>
    );
}

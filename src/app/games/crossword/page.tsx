import Crossword from "../../../components/crossword";
import { SECTION } from "../../../components/section-header";

export const metadata = { title: "Crossword - Nickolas Tran" };

export default function CrosswordPage() {
    return (
        <main className="min-h-screen">
            <section className={SECTION}>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    Crossword
                </h1>
                <p className="text-neutral-600 dark:text-neutral-500 text-sm mt-1">
                    Click a square to start. Click it again, or press space, to switch direction. Tab jumps to the next clue.
                </p>
                <Crossword />
            </section>
        </main>
    );
}

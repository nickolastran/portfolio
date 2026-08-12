import { SECTION } from "../../components/section-header";

export const metadata = { title: "Games - Nickolas Tran" };

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
            </section>
        </main>
    );
}

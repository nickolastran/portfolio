import PlaceholderCard from "../../components/placeholder-card";
import { SECTION } from "../../components/section-header";
import { cn } from "../../lib/utils";

export const metadata = { title: "About Me - Nickolas Tran" };

export default function About() {
    return (
        <main className="min-h-screen">
            <section className={cn(SECTION, "max-w-7xl")}>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    About Me
                </h1>
                <p className="text-neutral-600 dark:text-neutral-500 text-sm mt-1">
                    This section is a work in progress.
                </p>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:auto-rows-[minmax(220px,auto)]">
                    <PlaceholderCard
                        className="lg:col-span-2 lg:row-span-2"
                        delay={0}
                        photo
                    />
                    <PlaceholderCard delay={0.05} />
                    <PlaceholderCard
                        className="lg:row-span-2"
                        delay={0.1}
                        photo
                    />
                    <PlaceholderCard delay={0.15} />
                    <PlaceholderCard
                        className="lg:col-span-3"
                        delay={0.2}
                        photo
                    />
                    <PlaceholderCard delay={0.25} />
                    <PlaceholderCard className="lg:col-span-2" delay={0.3} />
                    <PlaceholderCard
                        className="lg:row-span-2"
                        delay={0.35}
                        photo
                    />
                    <PlaceholderCard delay={0.4} />
                    <PlaceholderCard className="lg:col-span-2" delay={0.45} />
                    <PlaceholderCard delay={0.5} />
                </div>
            </section>
        </main>
    );
}

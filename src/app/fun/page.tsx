import dynamic from "next/dynamic";

import { SECTION } from "../../components/section-header";

// three.js bundle only loads on this route
const Lanyard = dynamic(() => import("../../components/lanyard"));

export const metadata = { title: "Fun - Nickolas Tran" };

export default function Fun() {
    return (
        <main className="relative min-h-screen overflow-hidden">
            {/* full-height layer so the strap hangs from the top of the page */}
            <div className="absolute inset-x-0 top-0 h-screen">
                <Lanyard />
            </div>
            <section className={`${SECTION} relative z-10`}>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    Fun
                </h1>
                <p className="text-neutral-600 dark:text-neutral-500 text-sm mt-1">
                    This section is a work in progress. Drag the badge.
                </p>
            </section>
        </main>
    );
}

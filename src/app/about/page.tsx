import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { Inter } from "next/font/google";

import BentoCard from "../../components/bento-card";
import PhotoCarousel from "../../components/photo-carousel";
import { SECTION } from "../../components/section-header";
import { cn } from "../../lib/utils";

const CONCERTS = [
    { src: "/ariana.jpg", caption: "Ariana Grande — Oakland Arena, June 6, 2026" },
    { src: "/bts.jpg", caption: "BTS — Stanford Stadium, May 17, 2026" },
    { src: "/iso.jpg", caption: "ISOxo — Cow Palace, April 4, 2026" },
    { src: "/ultra.jpg", caption: "Ultra Miami Festival — Bayfront Park, March 29, 2026" },
    { src: "/knock2.jpg", caption: "Knock2 — The Midway, November 22, 2025" },
    { src: "/niteharts.jpg", caption: "Niteharts Festival — Snapdragon Stadium, October 10-11, 2025" },
    { src: "/lessera.jpg", caption: "Lesserafim — Bill Graham Civic Auditorium, September 14, 2025" },
];

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = { title: "About Me - Nickolas Tran" };

const ACCENTS = {
    rust: "bg-[#c1502e] dark:bg-[#c1502e]",
    charcoal: "bg-[#3b3c37] dark:bg-[#3b3c37]",
} as const;

function Card({
    accent,
    photo,
    media,
    alt = "",
    title,
    children,
    delay,
    className = "",
}: {
    accent: keyof typeof ACCENTS;
    photo?: string | string[] | true;
    media?: React.ReactNode;
    alt?: string;
    title: string;
    children: React.ReactNode;
    delay: number;
    className?: string;
}) {
    return (
        <BentoCard
            className={cn(
                ACCENTS[accent],
                "border-transparent dark:border-transparent hover:border-transparent dark:hover:border-transparent",
                "shadow-none transition-all hover:scale-[1.01] hover:ring-2 hover:ring-white/40 hover:shadow-[0_0_40px_-8px_rgba(193,80,46,0.55)]",
                className,
            )}
            delay={delay}
        >
            <div className="flex h-full flex-col gap-4">
                {media}
                {Array.isArray(photo) ? (
                    <div className="grid gap-2 sm:grid-cols-3">
                        {photo.map((src) => (
                            <div
                                key={src}
                                className="relative aspect-[4/3] overflow-hidden rounded-xl bg-black/25"
                            >
                                <Image
                                    src={src}
                                    alt={alt}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 100vw, 33vw"
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    photo && (
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black/25">
                            {photo === true ? (
                                <div className="flex h-full items-center justify-center">
                                    <ImageIcon
                                        className="text-white/40"
                                        size={32}
                                    />
                                </div>
                            ) : (
                                <Image
                                    src={photo}
                                    alt={alt}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            )}
                        </div>
                    )
                )}
                <div>
                    <h2 className="text-lg font-bold text-white">{title}</h2>
                    <div className="mt-1 space-y-2 text-sm leading-relaxed text-white/85">
                        {children}
                    </div>
                </div>
            </div>
        </BentoCard>
    );
}

export default function About() {
    return (
        <main className="min-h-screen">
            <section className={cn(SECTION, "max-w-7xl", inter.className)}>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    About Me
                </h1>
                <p className="text-neutral-600 dark:text-neutral-500 text-sm mt-1">
                    This section is a work in progress.
                </p>

                <div className="mt-8 grid gap-5 md:grid-cols-2 items-start">
                    <Card
                        accent="rust"
                        photo=""
                        alt=""
                        title=""
                        delay={0}
                    >
                        <p>
                            [placeholder]
                        </p>
                    </Card>

                    <Card
                        accent="charcoal"
                        media={<PhotoCarousel photos={CONCERTS} />}
                        title="Concerts!"
                        delay={0.05}
                    >
                        <p>
                            I love to go out and explore my differentiating
                            interests of music. Check out some of the concerts
                            I have been to in the last year!
                        </p>
                    </Card>

                    <Card accent="charcoal" title="" delay={0.1}>
                        <ul className="list-disc space-y-1 pl-5">
                            <li></li>
                            <li></li>
                            <li></li>
                            <li></li>
                        </ul>
                    </Card>

                    <Card
                        accent="rust"
                        title="[title]"
                        delay={0.15}
                    >
                        <p>
                            [placeholder]
                        </p>
                        <p>[placeholder]</p>
                    </Card>

                    <Card
                        accent="charcoal"
                        photo={["/am1.jpg", "/am2.jpg", "/am3.jpg"]}
                        alt="AMD Advancing AI Conference in San Francisco"
                        title="AMD Advancing AI Conference"
                        delay={0.2}
                        className="md:col-span-2"
                    >
                        <p>
                            I attended the AMD Advancing AI Conference in San
                            Francisco on July 22–23 and met so many cool people
                            and saw so many innovative products.
                        </p>
                    </Card>

                    <Card accent="rust" photo title="[title]" delay={0.25}>
                        <p>[placeholder]</p>
                    </Card>

                    <Card
                        accent="charcoal"
                        photo
                        title="[title]"
                        delay={0.3}
                    >
                        <p>[placeholder]</p>
                    </Card>
                </div>
            </section>
        </main>
    );
}

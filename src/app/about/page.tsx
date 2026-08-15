import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { Inter } from "next/font/google";

import BentoCard from "../../components/bento-card";
import PhotoCarousel from "../../components/photo-carousel";
import SpotifyNowPlaying from "../../components/spotify-now-playing";
import { SECTION } from "../../components/section-header";
import { cn } from "../../lib/utils";

const CONCERTS = [
    { src: "/about/ariana.jpg", caption: "Ariana Grande — Oakland Arena, June 6, 2026" },
    { src: "/about/bts.jpg", caption: "BTS — Stanford Stadium, May 17, 2026" },
    { src: "/about/iso.jpg", caption: "ISOxo — Cow Palace, April 4, 2026" },
    { src: "/about/ultra.jpg", caption: "Ultra Miami Festival — Bayfront Park, March 29, 2026" },
    { src: "/about/knock2.jpg", caption: "Knock2 — The Midway, November 22, 2025" },
    { src: "/about/niteharts.jpg", caption: "Niteharts Festival — Snapdragon Stadium, October 10-11, 2025" },
    { src: "/about/lessera.jpg", caption: "Le Sserafim — Bill Graham Civic Auditorium, September 14, 2025" },
];

const SCHOOL = [
    { src: "/about/school1.jpg", caption: "UCSC VSA — Class of 2026 Senior Banquet" },
    { src: "/about/school2.jpg", caption: "UCSC VSA — Culture Show" },
    { src: "/about/school3.png", caption: "UCSC VSA — Famolympics" },
    { src: "/about/school4.png", caption: "UCSC VSA — Retreat" },
];

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = { title: "About Me - Nickolas Tran" };

function Card({
    photo,
    media,
    alt = "",
    title,
    children,
    delay,
    className = "",
}: {
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
                "transform-gpu transition-[scale,translate,box-shadow] duration-[380ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                "shadow-[0_2px_1px_rgba(0,0,0,0.5)] hover:-translate-y-[7px] hover:scale-[1.03] hover:shadow-none",
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
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                        {title}
                    </h2>
                    <div className="mt-1 space-y-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
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
                    hey !! thank you for visiting my website !!
                </p>

                <div className="mt-8 flex flex-col gap-5 md:flex-row">
                    <div className="flex flex-1 flex-col gap-5">
                        <Card
                            photo="/about/baybridge.jpg"
                            alt="The Bay Bridge, San Francisco"
                            title="Where I am from 🌉"
                            delay={0}
                        >
                            <p>I am from San Bruno, California in the heart of the Bay Area.</p>
                        </Card>

                        <Card
                            media={<SpotifyNowPlaying />}
                            title="What I'm listening to 🎶"
                            delay={0.1}
                        >
                            <p>
                                Check out what I am currently listening to on Spotify — whatever is playing right
                                now, refreshed every 30 seconds.
                            </p>
                        </Card>

                        <Card
                            media={<PhotoCarousel photos={CONCERTS} />}
                            title="Concerts!"
                            delay={0.2}
                        >
                            <p>
                                I love to go out and explore my differentiating
                                interests of music. Check out some of the concerts
                                I have been to in the last year!
                            </p>
                        </Card>
                    </div>

                    <div className="flex flex-1 flex-col gap-5">
                        <Card
                            media={<PhotoCarousel photos={SCHOOL} />}
                            title="University of California, Santa Cruz 🍌🐌"
                            delay={0.05}
                        >
                            <p>
                                I attended University of California, Santa Cruz from 2022 - 2026
                                and invested a lot of my extra curricular time to the Vietnamese Student
                                Association and created so many amazing memories there.
                            </p>
                        </Card>

                        <Card title="Some stuff that I love..." delay={0.15}>
                            <ul className="list-disc space-y-1 pl-5">
                                <li>Games (minecraft, valorant, mlb the show)</li>
                                <li>Sports (basketball, baseball, football, swimming)</li>
                            </ul>
                        </Card>

                        <Card
                            photo
                            title="[title]"
                            delay={0.25}
                            className="border-dashed"
                        >
                            <p>[placeholder]</p>
                        </Card>
                    </div>
                </div>

                <Card
                    photo={["/about/am1.jpg", "/about/am2.jpg", "/about/am3.jpg"]}
                    alt="AMD Advancing AI Conference in San Francisco"
                    title="AMD Advancing AI Conference"
                    delay={0.3}
                    className="mt-5"
                >
                    <p>
                        I attended the AMD Advancing AI Conference in San
                        Francisco on July 22–23 and met so many cool people and
                        saw so many innovative products.
                    </p>
                </Card>
            </section>
        </main>
    );
}

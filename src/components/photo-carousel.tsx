"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

/* Cycles every 10s; swipe/drag sideways or hit a dot to take over
   (either resets the timer, since the effect re-runs on `i`). */
export default function PhotoCarousel({
    photos,
}: {
    photos: { src: string; caption: string }[];
}) {
    const [i, setI] = useState(0);
    const step = (n: number) => setI((c) => (c + n + photos.length) % photos.length);

    useEffect(() => {
        const id = setInterval(
            () => setI((c) => (c + 1) % photos.length),
            10000,
        );
        return () => clearInterval(id);
    }, [i, photos.length]);

    return (
        <div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black/25">
                <AnimatePresence initial={false}>
                    <motion.div
                        key={photos[i].src}
                        className="absolute inset-0 cursor-grab active:cursor-grabbing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) =>
                            Math.abs(info.offset.x) > 60 &&
                            step(info.offset.x < 0 ? 1 : -1)
                        }
                    >
                        <Image
                            src={photos[i].src}
                            alt={photos[i].caption}
                            fill
                            draggable={false}
                            className="object-cover select-none"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs text-white/60">{photos[i].caption}</p>
                <div className="flex shrink-0 gap-1.5">
                    {photos.map((p, n) => (
                        <button
                            key={p.src}
                            aria-label={`Show photo ${n + 1}`}
                            onClick={() => setI(n)}
                            className={`h-1.5 w-1.5 rounded-full ${n === i ? "bg-white" : "bg-white/35"}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

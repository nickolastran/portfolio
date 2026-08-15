"use client";

import { useEffect, useState } from "react";
import { FaSpotify } from "react-icons/fa6";

type Track = {
    isPlaying: boolean;
    title?: string;
    artist?: string;
    art?: string | null;
    url?: string | null;
};

export default function SpotifyNowPlaying() {
    const [track, setTrack] = useState<Track | null>(null);

    useEffect(() => {
        const load = () =>
            fetch("/api/spotify", { cache: "no-store" })
                .then((r) => r.json())
                .then(setTrack)
                .catch(() => setTrack({ isPlaying: false }));
        load();
        const id = setInterval(load, 30000);
        return () => clearInterval(id);
    }, []);

    const playing = track?.isPlaying && track.title;

    return (
        <a
            href={playing && track.url ? track.url : "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-xl bg-neutral-100 p-3 dark:bg-white/5"
        >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-black/25">
                {playing && track.art ? (
                    /* i.scdn.co URLs rotate — plain img, no next.config allowlist. */
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={track.art}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <FaSpotify className="h-7 w-7 text-[#1DB954]/60" />
                    </div>
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    <FaSpotify className="h-3.5 w-3.5 text-[#1DB954]" />
                    {playing ? "Now playing" : "Not playing"}
                </div>
                <p className="truncate font-semibold text-neutral-900 dark:text-white">
                    {playing ? track.title : "Spotify is quiet right now"}
                </p>
                <p className="truncate text-xs text-neutral-600 dark:text-neutral-400">
                    {playing ? track.artist : "Check back in a bit"}
                </p>
            </div>

            {playing && (
                <div className="flex shrink-0 items-end gap-0.5 pr-1">
                    {[0, 0.2, 0.4].map((d) => (
                        <span
                            key={d}
                            style={{ animationDelay: `${d}s` }}
                            className="h-4 w-0.5 origin-bottom animate-[pulse_1s_ease-in-out_infinite] bg-[#1DB954]"
                        />
                    ))}
                </div>
            )}
        </a>
    );
}

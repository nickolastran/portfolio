"use client";

import { useEffect, useState } from "react";

export default function LiveClock({ timezone }: { timezone: string }) {
    const [time, setTime] = useState<string | null>(null);

    useEffect(() => {
        const tick = () =>
            setTime(
                new Date().toLocaleTimeString("en-US", {
                    timeZone: timezone,
                    hour: "numeric",
                    minute: "2-digit",
                }),
            );
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [timezone]);

    // null until mounted so server and client markup agree
    return <span suppressHydrationWarning>{time ?? "--:--"}</span>;
}

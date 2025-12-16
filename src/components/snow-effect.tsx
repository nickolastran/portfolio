"use client";

import { useState, useCallback } from "react";
import { Snowflake } from "lucide-react";

interface SnowflakeParticle {
    id: number;
    left: number;
    animationDuration: number;
    opacity: number;
    size: number;
    delay: number;
}

const createSnowflakes = (): SnowflakeParticle[] => {
    return Array.from({ length: 100 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        animationDuration: 8 + Math.random() * 15,
        opacity: 0.2 + Math.random() * 0.6,
        size: 8 + Math.random() * 16,
        delay: -Math.random() * 20,
    }));
};

const checkWinterSeason = (): boolean => {
    const now = new Date();
    const month = now.getMonth();
    return month === 11 || month === 0;
};

const getInitialSnowingState = (): boolean => {
    if (typeof window === "undefined") return false;
    const isWinter = checkWinterSeason();
    if (!isWinter) return false;
    const saved = localStorage.getItem("snowEffect");
    return saved === "true";
};

export default function SnowEffect() {
    const [isSeasonActive] = useState(checkWinterSeason);
    const [isSnowing, setIsSnowing] = useState(getInitialSnowingState);
    const [snowflakes, setSnowflakes] = useState<SnowflakeParticle[]>(() =>
        getInitialSnowingState() ? createSnowflakes() : [],
    );

    const toggleSnow = useCallback(() => {
        setIsSnowing((prev) => {
            const newState = !prev;
            if (typeof window !== "undefined") {
                localStorage.setItem("snowEffect", String(newState));
            }

            // Update snowflakes based on new state
            if (newState) {
                setSnowflakes(createSnowflakes());
            } else {
                setSnowflakes([]);
            }

            return newState;
        });
    }, []);

    if (!isSeasonActive) {
        return null;
    }

    return (
        <>
            {/* Snow particles */}
            {isSnowing && snowflakes.length > 0 && (
                <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                    {snowflakes.map((flake) => (
                        <div
                            key={flake.id}
                            className="absolute text-foreground"
                            style={{
                                left: `${flake.left}%`,
                                top: "-20px",
                                opacity: flake.opacity * 0.7,
                                fontSize: `${flake.size}px`,
                                animation: `snowfall ${flake.animationDuration}s linear infinite`,
                                animationDelay: `${flake.delay}s`,
                                filter: `blur(${flake.size > 12 ? 1 : 0}px)`,
                            }}
                        >
                            ❄
                        </div>
                    ))}
                </div>
            )}

            {/* Toggle button */}
            <button
                onClick={toggleSnow}
                className="fixed bottom-8 right-8 z-50 bg-blue-500/80 hover:bg-blue-600/80 backdrop-blur-sm text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
                aria-label={isSnowing ? "Stop snow" : "Start snow"}
                title={isSnowing ? "Stop snow" : "Start snow"}
            >
                <Snowflake
                    className={`w-5 h-5 transition-transform ${isSnowing ? "animate-spin" : "group-hover:rotate-90"}`}
                    style={{ animationDuration: "4s" }}
                />
            </button>

            {/* Improved keyframes for more natural snow animation */}
            <style jsx global>{`
                @keyframes snowfall {
                    0% {
                        transform: translateY(-20px) translateX(0) rotate(0deg);
                    }
                    20% {
                        transform: translateY(20vh) translateX(10px)
                            rotate(72deg);
                    }
                    40% {
                        transform: translateY(40vh) translateX(-5px)
                            rotate(144deg);
                    }
                    60% {
                        transform: translateY(60vh) translateX(15px)
                            rotate(216deg);
                    }
                    80% {
                        transform: translateY(80vh) translateX(-10px)
                            rotate(288deg);
                    }
                    100% {
                        transform: translateY(110vh) translateX(0)
                            rotate(360deg);
                    }
                }
            `}</style>
        </>
    );
}

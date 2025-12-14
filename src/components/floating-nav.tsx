"use client";

import { useState, useEffect } from "react";
import React from "react";
import { Home, Moon, Sun, Waves } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useTheme } from "next-themes";

export default function FloatingNav() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    const cycleTheme = () => {
        const themeOrder = ["dark", "light", "navy"];
        const currentIndex = themeOrder.indexOf(theme || "dark");
        const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
        setTheme(nextTheme);
    };

    const getThemeIcon = () => {
        if (!mounted) return <Moon />;

        switch (theme) {
            case "light":
                return <Sun />;
            case "navy":
                return <Waves />;
            default:
                return <Moon />;
        }
    };

    const navItems = [
        {
            icon: <Home />,
            href: "#hero",
            label: "Home",
        },
        {
            icon: <FaGithub />,
            href: "https://github.com/nickolastran",
            label: "GitHub",
            external: true,
        },
        {
            icon: <FaLinkedin />,
            href: "https://linkedin.com/in/nickolas-tran/",
            label: "LinkedIn",
            external: true,
        },
        {
            icon: getThemeIcon(),
            href: "#",
            label: "Toggle theme",
            onClick: true,
        },
    ];

    const handleClick = (
        href: string,
        external?: boolean,
        onClick?: boolean,
    ) => {
        if (onClick) {
            cycleTheme();
            return;
        }

        if (external) {
            window.open(href, "_blank");
        } else {
            const element = document.querySelector(href);
            element?.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <nav
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => {
                setIsExpanded(false);
                setHoveredIndex(null);
            }}
        >
            <div
                className="bg-black/90 backdrop-blur-sm rounded-full shadow-2xl"
                style={{
                    padding: isExpanded ? "0.75rem 1.5rem" : "0.5rem 0.75rem",
                    transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                <div
                    className="flex items-center"
                    style={{
                        gap: isExpanded ? "0.5rem" : "0.25rem",
                        transition: "gap 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                >
                    {navItems.map((item, index) => (
                        <React.Fragment key={index}>
                            <button
                                onClick={() =>
                                    handleClick(
                                        item.href,
                                        item.external,
                                        item.onClick,
                                    )
                                }
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className="text-white/70 rounded-full group relative"
                                style={{
                                    padding: isExpanded ? "0.75rem" : "0.5rem",
                                    backgroundColor:
                                        hoveredIndex === index
                                            ? "rgba(255, 255, 255, 0.2)"
                                            : "transparent",
                                    transform:
                                        hoveredIndex === index
                                            ? "scale(1.15)"
                                            : "scale(1)",
                                    color:
                                        hoveredIndex === index
                                            ? "rgb(255, 255, 255)"
                                            : "rgba(255, 255, 255, 0.7)",
                                    transition:
                                        "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                }}
                                aria-label={item.label}
                            >
                                <div
                                    style={{
                                        transform: `scale(${isExpanded ? 1 : 0.75}) rotate(${hoveredIndex === index ? "12deg" : "0deg"})`,
                                        transition:
                                            "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                    }}
                                >
                                    {React.cloneElement(item.icon, {
                                        className: "w-5 h-5",
                                    })}
                                </div>
                                {isExpanded && (
                                    <span
                                        className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none"
                                        style={{
                                            opacity:
                                                hoveredIndex === index ? 1 : 0,
                                            transform: `translateX(-50%) translateY(${hoveredIndex === index ? "-0.25rem" : "0"})`,
                                            transition:
                                                "opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                        }}
                                    >
                                        {item.label}
                                    </span>
                                )}
                            </button>
                            {index < navItems.length - 1 && (
                                <div
                                    className="w-px bg-white/20"
                                    style={{
                                        height: isExpanded ? "1.5rem" : "1rem",
                                        transition:
                                            "height 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                                    }}
                                ></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </nav>
    );
}

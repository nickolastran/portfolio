"use client";

import { useState, useEffect } from "react";
import React from "react";
import { Home, User, Briefcase, Mail, Moon, Sun, Waves } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useTheme } from "next-themes";

export default function FloatingNav() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const cycleTheme = () => {
        const themeOrder = ["dark", "light", "navy"];
        const currentIndex = themeOrder.indexOf(theme || "dark");
        const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
        setTheme(nextTheme);
    };

    const getThemeIcon = () => {
        // Return default icon during SSR
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
            icon: <User />,
            href: "#about",
            label: "About",
        },
        {
            icon: <Briefcase />,
            href: "#projects",
            label: "Projects",
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
            icon: <Mail />,
            href: "#contact",
            label: "Contact",
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
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div
                className={`bg-black/90 backdrop-blur-sm rounded-full shadow-2xl transition-all duration-300 ${
                    isExpanded ? "px-6 py-3" : "px-3 py-2"
                }`}
            >
                <div
                    className={`flex items-center transition-all duration-300 ${
                        isExpanded ? "gap-2" : "gap-1"
                    }`}
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
                                className={`text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 group relative hover:scale-110 ${
                                    isExpanded ? "p-3" : "p-2"
                                }`}
                                aria-label={item.label}
                            >
                                <div
                                    className={`transition-all duration-300 ${
                                        isExpanded ? "scale-100" : "scale-75"
                                    }`}
                                >
                                    {React.cloneElement(item.icon, {
                                        className: "w-5 h-5",
                                    })}
                                </div>
                                {isExpanded && (
                                    <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                                        {item.label}
                                    </span>
                                )}
                            </button>
                            {index < navItems.length - 1 && (
                                <div className="h-6 w-px bg-white/20"></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </nav>
    );
}

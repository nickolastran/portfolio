// src/components/Navigation.tsx
"use client";

import { useState, useEffect } from "react";

export default function Navigation() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-[#1a1a1a]/80 backdrop-blur-md shadow-lg border-b border-gray-800"
                    : "bg-transparent"
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <button
                    onClick={() => scrollToSection("hero")}
                    className="text-xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                >
                    YourName
                </button>
                <div className="flex gap-8">
                    {["about", "projects", "experience", "contact"].map(
                        (item) => (
                            <button
                                key={item}
                                onClick={() => scrollToSection(item)}
                                className="text-gray-400 hover:text-blue-400 transition-colors capitalize font-medium"
                            >
                                {item}
                            </button>
                        ),
                    )}
                </div>
            </div>
        </nav>
    );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown } from "lucide-react";

const sections = [
    { id: "hero", label: "Home" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "projects", label: "Projects" },
    { id: "contributions", label: "Contributions" },
    { id: "skills", label: "Skills" },
];

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

export default function TableOfContents() {
    const [activeSection, setActiveSection] = useState<string | null>("hero");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);

    const handleNextSection = () => {
        const nextIndex = currentSectionIndex + 1;
        if (nextIndex < sections.length) {
            setCurrentSectionIndex(nextIndex);
            const nextSection = document.getElementById(sections[nextIndex].id);
            if (nextSection) {
                nextSection.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    useEffect(() => {
        // Handle scroll visibility
        const handleScroll = () => {
            const heroSection = document.getElementById("hero");
            if (heroSection) {
                const heroRect = heroSection.getBoundingClientRect();
                // Show TOC when scrolled past 50% of hero section
                setIsVisible(heroRect.bottom < window.innerHeight / 2);
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll(); // Check initial state

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        observer.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                        const sectionIndex = sections.findIndex(
                            (s) => s.id === entry.target.id,
                        );
                        if (sectionIndex !== -1) {
                            setCurrentSectionIndex(sectionIndex);
                        }
                    }
                });
            },
            { rootMargin: "-50% 0px -50% 0px" },
        );

        sections.forEach((section) => {
            const el = document.getElementById(section.id);
            if (el) {
                observer.current?.observe(el);
            }
        });

        return () => {
            sections.forEach((section) => {
                const el = document.getElementById(section.id);
                if (el) {
                    observer.current?.unobserve(el);
                }
            });
        };
    }, []);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            {/* Desktop Navigation - Dot Style */}
            <motion.nav
                initial={{ opacity: 0, x: 50 }}
                animate={{
                    opacity: isVisible ? 1 : 0,
                    x: isVisible ? 0 : 50,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="hidden md:block fixed top-1/2 right-4 transform -translate-y-1/2 z-50"
            >
                <ul className="flex flex-col items-center space-y-2">
                    {sections.map((section) => (
                        <li key={section.id}>
                            <a
                                href={`#${section.id}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    scrollTo(section.id);
                                }}
                                className="group flex items-center gap-2"
                            >
                                <span className="text-right text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gray-400">
                                    {section.label}
                                </span>
                                <div
                                    className={cn(
                                        "w-2.5 h-2.5 rounded-full transition-all duration-300",
                                        activeSection === section.id
                                            ? "bg-blue-500 scale-125"
                                            : "bg-gray-400 group-hover:bg-blue-400",
                                    )}
                                />
                            </a>
                        </li>
                    ))}
                </ul>
            </motion.nav>

            {/* Mobile Navigation - Top Right */}
            <div className="md:hidden fixed top-4 right-4 z-50 flex gap-2">
                {/* Next Section Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNextSection}
                    className="size-12 bg-background/90 backdrop-blur-lg border border-border rounded-full flex items-center justify-center shadow-lg [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] transition-colors duration-300"
                    title="Next Section"
                >
                    <ChevronDown className="size-4 text-foreground transition-colors duration-300" />
                </motion.button>

                {/* Menu Dropdown */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-14 right-0 bg-background/90 backdrop-blur-lg border border-border rounded-xl shadow-xl [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] p-3 min-w-[200px]"
                        >
                            <ul className="flex flex-col space-y-1">
                                {sections.map((section) => (
                                    <li key={section.id}>
                                        <a
                                            href={`#${section.id}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                scrollTo(section.id);
                                            }}
                                            className={cn(
                                                "flex items-center px-3 py-2 text-sm rounded-lg transition-colors",
                                                activeSection === section.id
                                                    ? "bg-blue-500/10 text-blue-500 font-medium"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                                            )}
                                        >
                                            {section.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Menu Toggle Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="size-12 bg-background/90 backdrop-blur-lg border border-border rounded-full flex items-center justify-center shadow-lg [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] transition-colors duration-300"
                >
                    <motion.div
                        animate={{ rotate: isMobileMenuOpen ? 45 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-foreground transition-colors duration-300"
                    >
                        <ChevronRight className="size-4" />
                    </motion.div>
                </motion.button>
            </div>
        </>
    );
}

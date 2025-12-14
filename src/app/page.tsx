// src/app/page.tsx
import Hero from "@/src/components/hero";
import Skills from "@/src/components/skills";
import Projects from "@/src/components/projects";
import Experience from "@/src/components/experience";
import Education from "@/src/components/education";
import FloatingNav from "@/src/components/floating-nav";

export default function Home() {
    return (
        <main className="min-h-screen bg-background">
            <FloatingNav />
            <Hero />
            <Skills />
            <Projects />
            <Experience />
            <Education />
        </main>
    );
}

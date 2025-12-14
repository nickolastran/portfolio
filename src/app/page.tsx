import FloatingNav from "../components/floating-nav";
import Hero from "../components/hero";
import Education from "../components/education";
import Experience from "../components/experience";
import Projects from "../components/projects";
import Skills from "../components/skills";

export default function Home() {
    return (
        <main className="min-h-screen">
            <FloatingNav />
            <Hero />
            <Experience />
            <Education />
            <Projects />
            <Skills />
        </main>
    );
}

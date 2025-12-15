import FloatingNav from "../components/floating-nav";
import Hero from "../components/hero";
import Education from "../components/education";
import Experience from "../components/experience";
import Projects from "../components/projects";
import Skills from "../components/skills";
import TableOfContents from "../components/table-of-contents";
import GitHubContributions from "../components/github-contributions";
import SnowEffect from "../components/snow-effect";

export default function Home() {
    return (
        <main className="min-h-screen">
            <FloatingNav />
            <TableOfContents />
            <SnowEffect />
            <Hero />
            <Experience />
            <Education />
            <Projects />
            <GitHubContributions />
            <Skills />
        </main>
    );
}

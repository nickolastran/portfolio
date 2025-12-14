// src/components/Projects.tsx
"use client";

const projects = [
    {
        id: 1,
        title: "CodeCompass - AI Powered Codebase Website",
        tech: "Python, TypeScript, React, Rest API, PostgreSQL, Supabase",
        period: "Dec. 2025",
        achievements: [
            "Engineered a code-understanding system that combines AST extraction (Tree-sitter + LSP) with vector embeddings (Voyage AI → ChromaDB) to enable semantic search and structural navigation of large codebases",
            "Built universal connectors to index and parse codebases from GitHub, GitLab, Bitbucket, and local directories",
            "Developed REST APIs for indexing, graph traversal, semantic retrieval, and code-centric query answering with optimized chunking, caching, and token-aware context assembly",
            "Implemented a Next.js frontend for interactive browsing of source files, semantic results, and call/import graph visualizations",
        ],
    },
    {
        id: 2,
        title: "AI Sentiment Analyzer",
        tech: "Python, Flask, React, MongoDB, VADER, REST API, Heroku, Netlify",
        period: "Jan. 2025",
        achievements: [
            "Created a full-stack sentiment analysis app using Flask for backend exposing RESTful endpoints for real-time NLP inference using the VADER model",
            "Engineered a low-latency text-processing pipeline with request validation, rate-limiting middleware, and asynchronous React client-side fetch logic to maintain sub 100 ms response times",
            "Implemented MongoDB schemas for persisting user input, per-request inference metadata, and aggregated sentiment statistics; optimized queries using indexed fields and TTL collections",
            "Containerized the backend service and configured Heroku deployments with buildpacks, environment variable injection, and continuous integration hooks",
            "Designed a React-based SPA with dynamic state management, client-side routing, and real-time visualization of sentiment distributions using charting libraries",
            "Integrated production-grade logging and monitoring, including request tracing, error instrumentation, and automatic fallback handling for model failures",
        ],
    },
    {
        id: 3,
        title: "What Type of Egg Are You?",
        tech: "VS Code, Python, HTML/CSS, TypeScript, Git, Vercel",
        period: "Jul. 2024",
        achievements: [
            "Developed a full-stack web application implementing a personality test to assign users a personality type depicted by an egg, based on a custom metric system",
            "Designed and implemented a proprietary scoring algorithm based on MBTI principles, translating psychological metrics into engaging user personality profiles",
            "Implemented client-side form validation to ensure data integrity and improve overall user experience",
            "Shipped iterative feature improvements based on quantitative metrics and qualitative feedback, establishing a data-driven development cycle",
        ],
    },
];

export default function Projects() {
    return (
        <section id="projects" className="py-20 px-6 bg-background">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-foreground uppercase tracking-wide">
                    Projects
                </h2>

                <div className="space-y-6">
                    {projects.map((project) => (
                        <div key={project.id}>
                            <div className="mb-2">
                                <div className="flex justify-between items-baseline flex-wrap gap-2">
                                    <div>
                                        <span className="text-base font-bold text-foreground">
                                            {project.title}
                                        </span>
                                        <span className="text-muted-foreground text-sm mx-2">
                                            |
                                        </span>
                                        <span className="text-sm italic text-muted-foreground">
                                            {project.tech}
                                        </span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {project.period}
                                    </span>
                                </div>
                            </div>

                            <ul className="space-y-1.5 ml-4">
                                {project.achievements.map((achievement, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-2 text-muted-foreground text-sm leading-relaxed"
                                    >
                                        <span className="mt-1.5 text-xs">
                                            •
                                        </span>
                                        <span>{achievement}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

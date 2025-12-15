// src/components/Skills.tsx
export default function Skills() {
    const skills = {
        languages:
            "C, Python, SQL, Java, JavaScript/TypeScript, HTML/CSS, LaTeX",
        tools: "Git, Docker, Vercel, NumPy, Pandas, Kubernetes",
        frameworks: "TailwindCSS, React, Next.js, TanStack Query, MongoDB",
        libraries: "pandas, NumPy, Matplotlib, sklearn",
    };

    return (
        <section
            id="skills"
            className="py-20 px-6 bg-background transition-colors duration-300"
        >
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-12 text-foreground text-center transition-colors duration-300">
                    Technical Skills
                </h2>

                <div className="space-y-2 max-w-3xl mx-auto">
                    <div className="flex gap-2">
                        <span className="text-base font-bold text-foreground min-w-[120px] transition-colors duration-300">
                            Languages:
                        </span>
                        <span className="text-sm text-gray-400 leading-relaxed transition-colors duration-300">
                            {skills.languages}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-base font-bold text-foreground min-w-[120px] transition-colors duration-300">
                            Tools:
                        </span>
                        <span className="text-sm text-gray-400 leading-relaxed transition-colors duration-300">
                            {skills.tools}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-base font-bold text-foreground min-w-[120px] transition-colors duration-300">
                            Frameworks:
                        </span>
                        <span className="text-sm text-gray-400 leading-relaxed transition-colors duration-300">
                            {skills.frameworks}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-base font-bold text-foreground min-w-[120px] transition-colors duration-300">
                            Libraries:
                        </span>
                        <span className="text-sm text-gray-400 leading-relaxed transition-colors duration-300">
                            {skills.libraries}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}

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
        <section id="skills" className="py-20 px-6 bg-background">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-white uppercase tracking-wide">
                    Technical Skills
                </h2>

                <div className="space-y-2">
                    <div className="flex gap-2">
                        <span className="text-base font-bold text-white min-w-[120px]">
                            Languages:
                        </span>
                        <span className="text-sm text-gray-400 leading-relaxed">
                            {skills.languages}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-base font-bold text-white min-w-[120px]">
                            Tools:
                        </span>
                        <span className="text-sm text-gray-400 leading-relaxed">
                            {skills.tools}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-base font-bold text-white min-w-[120px]">
                            Frameworks:
                        </span>
                        <span className="text-sm text-gray-400 leading-relaxed">
                            {skills.frameworks}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-base font-bold text-white min-w-[120px]">
                            Libraries:
                        </span>
                        <span className="text-sm text-gray-400 leading-relaxed">
                            {skills.libraries}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}

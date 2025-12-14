// src/components/About.tsx
export default function About() {
    return (
        <section id="about" className="py-24 px-6 bg-background">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
                    About Me
                </h2>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="aspect-square rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center">
                            <span className="text-8xl">👨‍💻</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-2xl font-semibold mb-4 text-white">
                            Hi, I am a developer who loves to create
                        </h3>
                        <p className="text-gray-400 mb-4 leading-relaxed">
                            With over 5 years of experience in web development,
                            I specialize in building scalable, performant
                            applications that users love. My journey started
                            with a curiosity about how things work and evolved
                            into a passion for creating elegant solutions to
                            complex problems.
                        </p>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            When I am not coding, you can find me exploring new
                            technologies, contributing to open source, or
                            sharing knowledge with the developer community.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

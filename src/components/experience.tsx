const experiences = [
    {
        id: 1,
        title: "Undergraduate Researcher",
        company:
            "Artificial Intelligence Explainability Accountability (AIEA) Lab",
        type: "Full-time",
        period: "Mar. 2025 - Jun, 2025",
        achievements: [
            "Boosted autonomous vehicle simulation throughput by 40% by containerizing workflows with Docker and orchestrating parallel test execution using Kubernetes",
            "Conducted large-scale CARLA-based adversarial sensor attack simulations, improving attack detection accuracy by 25% through scalable, automated testing pipelines.",
            "Spearheaded a fault-tolerant AV testing infrastructure, increasing simulation uptime by 25% and enabling consistent evaluation of vehicle robustness during adversarial attack scenarios.",
        ],
    },
    {
        id: 2,
        title: "Program Lead",
        company: "Iron Campers Summer Robotics Camp",
        type: "Full-time",
        period: "Aug. 2025 - Aug. 2025",
        achievements: [
            "Led and expanded a week-long robotics summer camp for rising 3rd–8th grade students, introducing core concepts in robotics, python programming, CAD (Tinkercad), and engineering design through hands-on projects.",
            "Instructed students in programming and mechanical design using FTC/XRP drive bases, supporting the creation of custom mechanisms and autonomous/teleop behaviors.",
            "Mentored a team of counselors, ensuring smooth daily operations, consistent instruction, and a positive learning environment.",
        ],
    },
];

export default function Experience() {
    return (
        <section id="experience" className="py-20 px-6 bg-background">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-white uppercase tracking-wide">
                    Experience
                </h2>

                <div className="space-y-6">
                    {experiences.map((exp) => (
                        <div key={exp.id}>
                            <div className="mb-2">
                                <div className="flex justify-between items-baseline flex-wrap gap-2">
                                    <div>
                                        <span className="text-base font-bold text-white">
                                            {exp.company}
                                        </span>
                                        <span className="text-gray-400 text-base mx-2">
                                            |
                                        </span>
                                        <span className="text-base italic text-gray-400">
                                            {exp.title}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-400">
                                        {exp.period}
                                    </span>
                                </div>
                            </div>

                            <ul className="space-y-1.5 ml-4">
                                {exp.achievements.map((achievement, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-2 text-gray-400 text-sm leading-relaxed"
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

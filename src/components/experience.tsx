// src/components/Experience.tsx
const experiences = [
    {
        id: 1,
        title: "Senior Full Stack Developer",
        company: "Tech Company Inc.",
        type: "Full-time",
        period: "Mar. 2022 - Present",
        achievements: [
            "Led development of scalable web applications serving 100k+ users, implementing microservices architecture with Docker and Kubernetes",
            "Reduced page load time by 60% through code optimization, lazy loading, and CDN implementation",
            "Mentored team of 5 junior developers, conducting code reviews and establishing best practices for React and Node.js development",
            "Architected CI/CD pipeline using GitHub Actions, reducing deployment time from 2 hours to 15 minutes",
            "Implemented real-time features using WebSockets and Redis, improving user engagement by 40%",
        ],
    },
    {
        id: 2,
        title: "Full Stack Developer",
        company: "Startup Solutions",
        type: "Full-time",
        period: "Jun. 2020 - Feb. 2022",
        achievements: [
            "Developed customer-facing features and internal tools using React, TypeScript, and Node.js",
            "Built real-time analytics dashboard processing 1M+ events daily, enabling data-driven decision making",
            "Integrated Stripe payment processing and subscription management, handling $500k+ in monthly transactions",
            "Collaborated with design team to improve UX, resulting in 40% increase in user engagement metrics",
            "Implemented automated testing with Jest and Cypress, achieving 85% code coverage",
        ],
    },
    {
        id: 3,
        title: "Junior Developer",
        company: "Digital Agency",
        type: "Full-time",
        period: "Jan. 2019 - May 2020",
        achievements: [
            "Assisted in building responsive websites and web applications for 15+ clients across various industries",
            "Delivered projects on time using Agile methodology, participating in daily standups and sprint planning",
            "Improved code quality through implementation of ESLint, Prettier, and comprehensive unit testing",
            "Learned modern development practices including Git workflows, code reviews, and pair programming",
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

import Image from "next/image";

const education = [
    {
        id: 1,
        school: "University of California, Santa Cruz",
        degree: "Bachelor of Science in Computer Science, Minor in Applied Mathematics",
        period: "2022 - 2026",
        logo: "/ucsclogo.png",
        useImage: true,
    },
    {
        id: 2,
        school: "Capuchino High School",
        degree: "High School Diploma",
        period: "2018 - 2022",
        logo: "/capuchinohslogo.png",
        useImage: true,
    },
];

export default function Education() {
    return (
        <section id="education" className="py-20 px-6 bg-background">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">
                    Education
                </h2>

                <div className="space-y-1">
                    {education.map((edu, index) => (
                        <div key={edu.id}>
                            <div className="flex gap-4 items-start py-4">
                                <div className="shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden">
                                        {edu.useImage ? (
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={edu.logo}
                                                    alt={`${edu.school} logo`}
                                                    fill
                                                    sizes="48px"
                                                    quality={100}
                                                    className="object-contain p-1"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-xl">
                                                {edu.logo}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-white mb-1">
                                                {edu.school}
                                            </h3>
                                            {edu.degree && (
                                                <p className="text-sm text-gray-400 leading-relaxed">
                                                    {edu.degree}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 px-2.5 py-1 bg-gray-800/50 rounded-full border border-gray-700">
                                            {edu.period}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {index < education.length - 1 && (
                                <div className="border-t border-gray-800 ml-16"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

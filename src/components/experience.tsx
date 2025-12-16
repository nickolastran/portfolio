"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

const experiences = [
  {
    id: 1,
    title: "Undergraduate Researcher",
    company: "Artificial Intelligence Explainability Accountability (AIEA) Lab",
    period: "Mar. 2025 - Jun. 2025",
    achievements: [
      "Boosted autonomous vehicle simulation by 40% by containerizing workflows with Docker and orchestrating parallel test execution using Kubernetes.",
      "Conducted large-scale CARLA-based adversarial sensor attack simulations, improving attack detection accuracy by **25%** through scalable, automated testing pipelines.",
      "Spearheaded a fault-tolerant AV testing infrastructure, increasing simulation uptime by 25% and enabling consistent evaluation of vehicle robustness during adversarial attack scenarios.",
    ],
  },
  {
    id: 2,
    title: "Program Lead",
    company: "Iron Campers Summer Robotics Camp",
    period: "Aug. 2025 - Aug. 2025",
    achievements: [
      "Led and expanded a week-long robotics summer camp for rising 3rd–8th grade students, introducing core concepts in robotics, python programming, CAD (Tinkercad), and engineering design through hands-on projects.",
      "Instructed students in programming and mechanical design using FTC/XRP drive bases, supporting the creation of custom mechanisms and autonomous/teleop behaviors.",
      "Mentored a team of counselors, ensuring smooth daily operations, consistent instruction, and a positive learning environment.",
    ],
  },
];

export default function Experience() {
  const [expandedIds, setExpandedIds] = useState<number[]>([1]);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((expId) => expId !== id) : [...prev, id],
    );
  };

  return (
    <section
      id="experience"
      className="py-20 px-6 bg-background transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-12 text-foreground text-center transition-colors duration-300"
        >
          Experience
        </motion.h2>

        <div ref={ref} className="space-y-6 max-w-3xl mx-auto">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="border-b border-border pb-6"
            >
              <button
                onClick={() => toggleExpand(exp.id)}
                className="w-full text-left group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-foreground mb-2">
                      {exp.company}
                    </h3>
                    <div className="text-sm text-gray-400 transition-colors duration-300">
                      {exp.title}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-400 whitespace-nowrap bg-muted px-2.5 py-1 rounded-full border border-border transition-colors duration-300">
                      {exp.period}
                    </span>
                    <motion.svg
                      animate={{
                        rotate: expandedIds.includes(exp.id) ? 90 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </motion.svg>
                  </div>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {expandedIds.includes(exp.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-3 mt-4">
                      {exp.achievements.map((achievement, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-gray-400 text-sm leading-relaxed transition-colors duration-300"
                        >
                          <span className="text-gray-400/70 mt-1.5 text-xs shrink-0 transition-colors duration-300">
                            •
                          </span>
                          <div className="flex-1">
                            <ReactMarkdown
                              components={{
                                p: (props) => <span {...props} />,
                                strong: (props) => (
                                  <strong
                                    className="text-foreground font-semibold transition-colors duration-300"
                                    {...props}
                                  />
                                ),
                                em: (props) => (
                                  <em
                                    className="text-foreground/80 italic transition-colors duration-300"
                                    {...props}
                                  />
                                ),
                                code: (props) => (
                                  <code
                                    className="bg-muted text-foreground px-1.5 py-0.5 rounded text-xs font-mono transition-colors duration-300"
                                    {...props}
                                  />
                                ),
                              }}
                            >
                              {achievement}
                            </ReactMarkdown>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

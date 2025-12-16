"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FaGithub } from "react-icons/fa";

const projects = [
  {
    id: 1,
    title: "CodeCompass",
    period: "Dec. 2025",
    description: "AI powered documentation and chatbot for codebases",
    tech: [
      "Python",
      "TypeScript",
      "React",
      "REST API",
      "PostgreSQL",
      "Supabase",
    ],
    image: "/project1.png",
    github: "https://github.com/vinngo/codecompass",
  },
  {
    id: 2,
    title: "AI Sentiment Analyzer",
    period: "Jan. 2025",
    description: "An analysis application tracking sentiment of Reddit posts..",
    tech: ["Python", "Flask", "React", "MongoDB", "VADER", "REST API"],
    image: "/project2.png",
    github: "https://github.com/nickolastran/sentiment-analyzer",
  },
];

export default function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="projects"
      className="py-20 px-6 bg-background transition-colors duration-300"
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4 text-foreground transition-colors duration-300">
            Check out my latest work.
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto transition-colors duration-300">
            I&apos;ve worked on a variety of projects, from simple websites to
            complex web applications. Here are a few of my favorites.
          </p>
        </motion.div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card border border-gray-400/30 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 group"
            >
              {/* Project Image */}
              <div className="relative w-full aspect-video bg-muted overflow-hidden transition-colors duration-300">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 text-sm transition-colors duration-300">
                  Project Preview
                </div>
              </div>

              {/* Project Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-400 transition-colors duration-300">
                      {project.period}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-400 leading-relaxed mb-4 transition-colors duration-300">
                  {project.description}
                </p>

                {/* Tech Stack Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="text-xs px-2.5 py-1 bg-muted text-gray-400 rounded-md border border-gray-400/30 transition-colors duration-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* GitHub Button */}
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-[background-color,color] duration-300"
                >
                  <FaGithub
                    className="w-4 h-4"
                    style={{
                      transition: "color 0.3s ease",
                    }}
                  />
                  <span
                    style={{
                      transition: "color 0.3s ease",
                    }}
                  >
                    Source
                  </span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

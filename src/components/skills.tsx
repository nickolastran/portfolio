"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { Grid3X3, ArrowLeft } from "lucide-react";

interface TechItem {
  name: string;
  logo: string;
}

interface TechCategory {
  category: string;
  subcategories?: {
    name: string;
    items: TechItem[];
  }[];
  items?: TechItem[];
}

const techCategories: TechCategory[] = [
  {
    category: "Languages",
    items: [
      {
        name: "C",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",
      },
      {
        name: "Python",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
      },
      {
        name: "SQL",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
      },
      {
        name: "Java",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
      },
      {
        name: "JavaScript",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
      },
      {
        name: "TypeScript",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
      },
      {
        name: "HTML/CSS",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
      },
      {
        name: "LaTeX",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/latex/latex-original.svg",
      },
      {
        name: "MATLAB",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/matlab/matlab-original.svg",
      },
      {
        name: "PostgreSQL",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
      },
    ],
  },
  {
    category: "Frameworks & Libraries",
    subcategories: [
      {
        name: "Frontend",
        items: [
          {
            name: "React",
            logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
          },
          {
            name: "Next.js",
            logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
          },
          {
            name: "TailwindCSS",
            logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
          },
          {
            name: "TanStack Query",
            logo: "https://avatars.githubusercontent.com/u/72518640?s=200&v=4",
          },
          {
            name: "shadcn/ui",
            logo: "https://ui.shadcn.com/favicon.ico",
          },
          {
            name: "Framer Motion",
            logo: "https://cdn.worldvectorlogo.com/logos/framer-motion.svg",
          },
        ],
      },
      {
        name: "Backend & Data",
        items: [
          {
            name: "MongoDB",
            logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
          },
          {
            name: "PyTorch",
            logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg",
          },
          {
            name: "TensorFlow",
            logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg",
          },
          {
            name: "NumPy",
            logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg",
          },
          {
            name: "Pandas",
            logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg",
          },
          {
            name: "Matplotlib",
            logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/matplotlib/matplotlib-original.svg",
          },
          {
            name: "scikit-learn",
            logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/scikitlearn/scikitlearn-original.svg",
          },
        ],
      },
    ],
  },
  {
    category: "Tools & DevOps",
    items: [
      {
        name: "Git",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
      },
      {
        name: "GitHub",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
      },
      {
        name: "Docker",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
      },
      {
        name: "Vercel",
        logo: "https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png",
      },
      {
        name: "Kubernetes",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg",
      },
    ],
  },
];

// Flatten all items for the scrolling marquee
const allTechItems: TechItem[] = techCategories.flatMap((category) =>
  category.subcategories
    ? category.subcategories.flatMap((sub) => sub.items)
    : category.items || [],
);

const TechItem = ({
  tech,
  showName = false,
}: {
  tech: TechItem;
  showName?: boolean;
}) => {
  return (
    <div
      className={`flex ${showName ? "flex-col" : ""} items-center justify-center ${showName ? "p-4" : "mx-6"} group`}
    >
      <div
        className={`relative ${showName ? "w-16 h-16" : "w-12 h-12"} transition-all duration-300 group-hover:scale-110 opacity-70 hover:opacity-100`}
      >
        <Image
          src={tech.logo}
          alt={`${tech.name} logo`}
          fill
          className="object-contain filter transition-all duration-300"
          unoptimized
        />
      </div>
      {showName && (
        <span className="text-xs font-medium text-muted-foreground text-center mt-2 whitespace-nowrap">
          {tech.name}
        </span>
      )}
    </div>
  );
};

interface TechStackProps {
  delay?: number;
}

export default function Skills({ delay = 0 }: TechStackProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [showAll, setShowAll] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: delay,
      },
    },
  };

  // Duplicate the tech stack for seamless infinite scroll
  const duplicatedTechStack = [...allTechItems, ...allTechItems];

  return (
    <section
      id="skills"
      className="py-20 px-6 bg-background transition-colors duration-300"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-8"
        >
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl transition-colors duration-300">
                Tech Stack.
              </h2>
              <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto transition-colors duration-300">
                Technologies and tools I work with to build innovative
                solutions.
              </p>
            </div>
          </div>

          {!showAll ? (
            <>
              {/* Elegant scrolling logos */}
              <div className="relative w-full overflow-hidden py-8">
                {/* Floating logos */}
                <motion.div
                  className="flex items-center"
                  animate={{
                    x: [0, "-50%"],
                  }}
                  transition={{
                    x: {
                      repeat: Infinity,
                      repeatType: "loop",
                      duration: 45,
                      ease: "linear",
                    },
                  }}
                >
                  {duplicatedTechStack.map((tech, index) => (
                    <TechItem key={`${tech.name}-${index}`} tech={tech} />
                  ))}
                </motion.div>
              </div>

              {/* Icon-only Show All Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => setShowAll(true)}
                  className="h-10 w-10 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  title="Show all technologies"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Organized category view */}
              <div className="py-8 space-y-12">
                {techCategories.map((category, categoryIndex) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: categoryIndex * 0.1,
                    }}
                    className="space-y-6"
                  >
                    <h3 className="text-2xl font-bold text-center text-foreground transition-colors duration-300">
                      {category.category}
                    </h3>

                    {category.subcategories ? (
                      <div className="space-y-8">
                        {category.subcategories.map((subcategory, subIndex) => (
                          <div key={subcategory.name} className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-400 text-center transition-colors duration-300">
                              {subcategory.name}
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 justify-items-center">
                              {subcategory.items.map((tech, techIndex) => (
                                <motion.div
                                  key={tech.name}
                                  initial={{
                                    opacity: 0,
                                    y: 20,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    y: 0,
                                  }}
                                  transition={{
                                    delay:
                                      categoryIndex * 0.1 +
                                      subIndex * 0.05 +
                                      techIndex * 0.03,
                                  }}
                                >
                                  <TechItem tech={tech} showName={true} />
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 justify-items-center">
                        {category.items?.map((tech, techIndex) => (
                          <motion.div
                            key={tech.name}
                            initial={{
                              opacity: 0,
                              y: 20,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            transition={{
                              delay: categoryIndex * 0.1 + techIndex * 0.03,
                            }}
                          >
                            <TechItem tech={tech} showName={true} />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Icon-only Back Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => setShowAll(false)}
                  className="h-10 w-10 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  title="Back to scrolling view"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}

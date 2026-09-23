"use client";

import { motion } from "framer-motion";
import Image from "next/image";

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

export const techCategories: TechCategory[] = [
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

// Flattened for the hero card's marquee
export const allTechItems: TechItem[] = techCategories.flatMap((category) =>
  category.subcategories
    ? category.subcategories.flatMap((sub) => sub.items)
    : category.items || [],
);

export const TechItem = ({
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
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 text-center mt-2 whitespace-nowrap">
          {tech.name}
        </span>
      )}
    </div>
  );
};

/* Categorized grid for the hero tech stack popout. */
export function TechCategories() {
  return (
    <div className="space-y-12">
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
          <h3 className="text-2xl font-bold text-center text-neutral-900 dark:text-white">
            {category.category}
          </h3>

          {category.subcategories ? (
            <div className="space-y-8">
              {category.subcategories.map((subcategory, subIndex) => (
                <div key={subcategory.name} className="space-y-4">
                  <h4 className="text-lg font-semibold text-neutral-500 dark:text-neutral-400 text-center">
                    {subcategory.name}
                  </h4>
                  <div className="flex flex-wrap justify-center gap-6">
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
            <div className="flex flex-wrap justify-center gap-6">
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
  );
}


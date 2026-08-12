const DEVICON = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

export const PORTFOLIO = {
    name: "Nickolas Tran",
    roles: [
        "Software Engineer",
        "ML/AI Researcher",
        "Full-Stack Developer",
        "Data Analyst",
    ],
    availability: "Open to opportunities",
    avatar: "/anyapfp.jpg",
    email: "nickolastran04@gmail.com",
    location: "San Bruno, CA",
    timezone: "America/Los_Angeles",
    bio: "A recent graduate in Computer Science and Applied Mathematics at University of California, Santa Cruz with research experience in ML/AI and interests in full-stack software engineering using Python, TypeScript, and React, plus sports data analytics using SQL and Python.",
    /* Phrases in `bio` rendered bold. */
    emphasis: [
        "ML/AI",
        "full-stack software engineering",
        "sports data analytics",
    ],
    /* Terms in `bio` rendered as an inline logo pill. */
    stack: [
        { name: "Python", logo: `${DEVICON}/python/python-original.svg` },
        { name: "TypeScript", logo: `${DEVICON}/typescript/typescript-original.svg` },
        { name: "React", logo: `${DEVICON}/react/react-original.svg` },
        { name: "SQL", logo: `${DEVICON}/mysql/mysql-original.svg` },
    ],
    socials: [
        { label: "GitHub", href: "https://github.com/nickolastran" },
        { label: "LinkedIn", href: "https://linkedin.com/in/nickolas-tran/" },
        { label: "Email", href: "mailto:nickolastran04@gmail.com" },
        // TODO: replace with your real handle
        { label: "Twitter", href: "https://x.com/" },
    ],
} as const;

// src/types/index.ts

export interface Project {
    id: number;
    title: string;
    description: string;
    tags: string[];
    image: string;
    link: string;
    github: string;
}

export interface Experience {
    id: number;
    title: string;
    company: string;
    period: string;
    description: string;
    achievements: string[];
}

export interface Skill {
    name: string;
    level: number;
}

export interface ContactFormData {
    name: string;
    email: string;
    message: string;
}

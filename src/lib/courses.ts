export interface Course {
    id: string;
    name: string;
    tagline: string;
    description: string;
    lessons: number;
    assignments: number;
    progress: number;
    status: "active" | "coming-soon";
    gradient: string;
    icon: string;
    accentColor: string;
    buttonClass: string;
}

export const courses: Course[] = [
    {
        id: "ai-core",
        name: "AI Core",
        tagline: "Foundations of Artificial Intelligence",
        description:
            "Master the fundamentals of AI including linear algebra, probability, machine learning algorithms, and neural network architectures.",
        lessons: 8,
        assignments: 4,
        progress: 60,
        status: "active",
        gradient: "from-indigo-600 via-violet-600 to-purple-700",
        icon: "psychology",
        accentColor: "text-indigo-600",
        buttonClass:
            "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25",
    },
    {
        id: "data-engineer",
        name: "Data Engineer",
        tagline: "Build Scalable Data Pipelines",
        description:
            "Learn to design, build, and maintain robust data architectures using modern tools like Spark, Airflow, and cloud platforms.",
        lessons: 12,
        assignments: 6,
        progress: 30,
        status: "active",
        gradient: "from-teal-500 via-cyan-600 to-emerald-600",
        icon: "storage",
        accentColor: "text-teal-600",
        buttonClass:
            "bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/25",
    },
    {
        id: "aiml-engineer",
        name: "AI/ML Engineer",
        tagline: "Production Machine Learning Systems",
        description:
            "Deploy and scale ML models in production. Cover MLOps, model serving, monitoring, and end-to-end ML pipelines.",
        lessons: 10,
        assignments: 5,
        progress: 0,
        status: "coming-soon",
        gradient: "from-amber-500 via-orange-500 to-rose-500",
        icon: "smart_toy",
        accentColor: "text-amber-600",
        buttonClass:
            "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
    },
];

export function getCourseById(id: string): Course | undefined {
    return courses.find((c) => c.id === id);
}

/** Get all valid course IDs for validation */
export function getActiveCourseIds(): string[] {
    return courses.map((c) => c.id);
}

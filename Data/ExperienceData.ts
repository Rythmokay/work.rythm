export type Experience = {
  id: number;
  role: string;
  company: string;
  location: string;
  period: string;
  description: string[];
  projectUrl?: string;
};

export const experiences: Experience[] = [
  {
    id: 1,
    role: "Full Stack Developer Intern",
    company: "PictureTime",
    location: "Delhi, India",
    period: "Feb 2026 - May 2026",
    description: [
      "Worked on the cinema ticket booking application focusing on seat selection and booking flow.",
      "Collaborated with senior developers to implement seat mapping and row-based ticket selection.",
      "Developed and maintained the web portal using Next.js for managing cinema events and dashboard features.",
      "Implemented category-based filtering, data handling, and Excel export functionality."
    ],
    projectUrl: "https://picturetime.in"
  },
  {
    id: 2,
    role: "Generative AI Intern",
    company: "Knowledge Excel Private Limited",
    location: "Delhi, India",
    period: "Aug 2025 - Oct 2025",
    description: [
      "Worked on Python-based backend tasks involving generative AI and LLM-based applications.",
      "Assisted in building chatbot workflows using LangChain and LangGraph.",
      "Explored Retrieval-Augmented Generation (RAG) using Chroma vector database and embedding-based retrieval.",
      "Used Pydantic for data validation while following company coding standards and version control practices."
    ]
  },
  {
    id: 3,
    role: "Frontend Developer",
    company: "Tradophile - Finance & Investment Club",
    location: "Delhi, India",
    period: "Sep 2024 - Jan 2025",
    description: [
      "Developed and maintained the club website using React.js.",
      "Integrated UI libraries and improved responsiveness across devices.",
      "Worked on authentication flow and frontend API integration.",
      "Collaborated with team members to enhance overall user experience."
    ],
    projectUrl: "https://tradophile-ggsipuedc.github.io/tradophile/"
  }
];
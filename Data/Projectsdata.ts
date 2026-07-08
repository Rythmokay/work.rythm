import Spotify from '@/assets/Projectsassets/spotify.jpg'

export type Project = {
  id: number;
  title: string;
  description: string;
  image: string | any;
  category: string;
  tags: string[];
  githubLink: string;
  liveLink: string;
};

export const projects: Project[] = [
  {
    id: 1,
    title: "Portfolio Website",
    description:
      "A modern developer portfolio built with Next.js, Tailwind CSS, and Framer Motion with responsive UI and smooth animations.",
    image: "/Projectsassets/portfolio.png",
    category: "Web Development",
    tags: ["Next.js", "Tailwind CSS", "TypeScript", "Framer Motion"],
    githubLink: "https://github.com/Rythmokay/work.rythm",
    liveLink: "https://workrythm.vercel.app",
  },

  {
    id: 2,
    title: "Spotify Clone",
    description:
      "A Flutter-based music streaming UI with playlist management, audio playback controls, and Riverpod state management.",
    image: "/Projectsassets/spotify.jpg",
    category: "Mobile Development",
    tags: ["Flutter", "Riverpod", "Dart", "Audio Playback"],
    githubLink: "https://github.com/Rythmokay",
    liveLink: "https://github.com/Rythmokay",
  },

  {
    id: 3,
    title: "Resume Matcher",
    description:
      "An AI-powered resume analysis tool that compares resumes with job descriptions using NLP techniques and keyword matching.",
    image: "/Projectsassets/resume.png",
    category: "AI & ML",
    tags: ["Python", "NLTK", "Streamlit", "NLP"],
    githubLink: "https://github.com/Rythmokay/resume-checker",
    liveLink: "https://nlpprojectresume.streamlit.app/",
  },

  {
    id: 4,
    title: "Grammar & Spell Checker",
    description:
      "A text correction application using NLP techniques for grammar correction and spell checking.",
    image: "/Projectsassets/Grammarandspellcheckerapp.png",
    category: "AI & ML",
    tags: ["Python", "TextBlob", "NLTK", "NLP"],
    githubLink: "https://github.com/Rythmokay/spellchecker",
    liveLink: "https://grammarandspellchecker.vercel.app/",
  },
];

export const categories = [
  "All Projects",
  "Web Development",
  "Mobile Development",
  "AI & ML",
];

export const getFilteredProjects = (
  activeCategory: string
): Project[] => {
  return activeCategory === "All Projects"
    ? projects
    : projects.filter(
        (project) => project.category === activeCategory
      );
};
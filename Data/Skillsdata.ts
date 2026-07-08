export type Skill = {
  name: string;
  category: string;
  color: string;
};

export const skills: Skill[] = [
  // Languages
  { name: "Dart", category: "Languages", color: "bg-sky-500" },
  { name: "Kotlin", category: "Languages", color: "bg-violet-500" },
  { name: "Java", category: "Languages", color: "bg-orange-500" },
  { name: "JavaScript", category: "Languages", color: "bg-amber-500" },
  { name: "Python", category: "Languages", color: "bg-blue-500" },

  // Mobile Development
  { name: "Flutter", category: "Mobile Development", color: "bg-cyan-500" },
  { name: "Android", category: "Mobile Development", color: "bg-green-500" },
  { name: "Riverpod", category: "Mobile Development", color: "bg-indigo-500" },

  // Backend
  { name: "Node.js", category: "Backend", color: "bg-emerald-600" },
  { name: "Express.js", category: "Backend", color: "bg-zinc-600" },
  { name: "Next.js", category: "Backend", color: "bg-zinc-800" },

  // Database
  { name: "PostgreSQL", category: "Database", color: "bg-blue-600" },
  { name: "Firebase", category: "Database", color: "bg-amber-500" },
  { name: "ChromaDB", category: "Database", color: "bg-violet-600" },

  // Bluetooth & Audio
  { name: "BLE", category: "Bluetooth & Audio", color: "bg-sky-600" },
  { name: "Classic Bluetooth", category: "Bluetooth & Audio", color: "bg-blue-500" },
  { name: "AudioManager", category: "Bluetooth & Audio", color: "bg-rose-500" },
  { name: "Media Playback", category: "Bluetooth & Audio", color: "bg-pink-500" },

  // Architecture & System
  { name: "MVVM", category: "Architecture & System", color: "bg-emerald-500" },
  { name: "Clean Architecture", category: "Architecture & System", color: "bg-teal-500" },
  { name: "Services", category: "Architecture & System", color: "bg-orange-500" },
  { name: "Broadcast Receivers", category: "Architecture & System", color: "bg-yellow-500" },

  // AI & LLM
  { name: "LangChain", category: "AI & LLM", color: "bg-indigo-500" },
  { name: "LangGraph", category: "AI & LLM", color: "bg-violet-500" },
  { name: "RAG", category: "AI & LLM", color: "bg-fuchsia-500" },
  { name: "LLMs", category: "AI & LLM", color: "bg-purple-500" },
  { name: "Pydantic", category: "AI & LLM", color: "bg-cyan-600" },

  // Core Concepts
  { name: "OOP", category: "Core Concepts", color: "bg-red-500" },
  { name: "Data Structures & Algorithms", category: "Core Concepts", color: "bg-orange-600" },

  // Tools
  { name: "Git", category: "Tools", color: "bg-zinc-700" },
  { name: "GitHub", category: "Tools", color: "bg-black" },
  { name: "Postman", category: "Tools", color: "bg-orange-500" },
  { name: "Android Studio", category: "Tools", color: "bg-green-600" },
  { name: "VS Code", category: "Tools", color: "bg-blue-500" },
];

export const getCategories = (): string[] => {
  return Array.from(new Set(skills.map(skill => skill.category)));
};
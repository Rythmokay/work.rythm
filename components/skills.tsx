"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type Skill = {
  name: string;
  category: string;
  color: string;
};

const DEFAULT_SKILLS: Skill[] = [
  // Languages
  { name: "Kotlin", category: "Languages", color: "bg-violet-500" },
  { name: "Java", category: "Languages", color: "bg-orange-600" },
  { name: "Dart", category: "Languages", color: "bg-sky-500" },
  { name: "Python", category: "Languages", color: "bg-blue-500" },

  // Mobile Development
  { name: "Flutter", category: "Mobile Development", color: "bg-cyan-500" },
  { name: "Android", category: "Mobile Development", color: "bg-green-600" },
  { name: "Jetpack Compose", category: "Mobile Development", color: "bg-indigo-500" },

  // Backend & Database
  { name: "Node.js", category: "Backend & Database", color: "bg-green-600" },
  { name: "Express.js", category: "Backend & Database", color: "bg-gray-600" },
  { name: "PostgreSQL", category: "Backend & Database", color: "bg-blue-600" },
  { name: "Firebase", category: "Backend & Database", color: "bg-yellow-600" },

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
  { name: "LangChain", category: "AI & LLM", color: "bg-indigo-600" },
  { name: "LangGraph", category: "AI & LLM", color: "bg-violet-600" },
  { name: "RAG", category: "AI & LLM", color: "bg-fuchsia-500" },
  { name: "ChromaDB", category: "AI & LLM", color: "bg-purple-600" },
  { name: "Pydantic", category: "AI & LLM", color: "bg-cyan-600" },

  // Core Concepts
  { name: "OOP", category: "Core Concepts", color: "bg-red-500" },
  { name: "Data Structures & Algorithms", category: "Core Concepts", color: "bg-orange-600" },

  // Tools
  { name: "Git & Github for Version Control ", category: "Tools", color: "bg-gray-700" },
  { name: "Postman", category: "Tools", color: "bg-orange-500" },
  { name: "Android Studio", category: "Tools", color: "bg-green-600" },
];

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>(DEFAULT_SKILLS);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { db } = await import('@/lib/firebase');
        const { collection, getDocs } = await import('firebase/firestore');
        const querySnapshot = await getDocs(collection(db, "skills"));
        const skillsList: Skill[] = [];
        querySnapshot.forEach((doc) => {
          skillsList.push(doc.data() as Skill);
        });
        if (skillsList.length > 0) {
          setSkills(skillsList);
        }
      } catch (err) {
        console.error("Failed to fetch skills:", err);
      }
    };
    fetchSkills();
  }, []);


  const getCategories = (): string[] => {
    return Array.from(new Set(skills.map(skill => skill.category)));
  };
  
  const categories = getCategories();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-[85rem] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-16 text-center"
      >
        <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-transparent md:text-5xl bg-clip-text bg-gradient-to-r from-primary to-primary/70">My Skills</h2>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
          A comprehensive list of my technical skills and expertise across various domains.
        </p>
      </motion.div>

      <div className="space-y-16">
        {categories.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="pl-4 mb-8 text-2xl font-bold tracking-tight border-l-4 md:text-3xl border-primary"
            >
              {category}
            </motion.h3>
            
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="flex flex-wrap justify-start gap-3 sm:gap-4"
            >
              {skills
                .filter(skill => skill.category === category)
                .map((skill, skillIndex) => (
                  <motion.div
                    key={skillIndex}
                    variants={item}
                    className={cn(
                      "px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm font-semibold text-white shadow-md transition-transform hover:scale-105 hover:shadow-lg",
                      skill.color
                    )}
                  >
                    {skill.name}
                  </motion.div>
                ))}
            </motion.div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
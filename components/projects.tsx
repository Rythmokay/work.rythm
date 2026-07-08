"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, ChevronDown, Tag } from 'lucide-react';
import Image from 'next/image';
import { projects, Project } from '@/Data/Projectsdata';

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState("All Projects");
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [projectList, setProjectList] = useState<Project[]>(projects);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { db } = await import('@/lib/firebase');
        const { collection, getDocs } = await import('firebase/firestore');
        const querySnapshot = await getDocs(collection(db, "projects"));
        const list: Project[] = [];
        querySnapshot.forEach((doc) => {
          list.push(doc.data() as Project);
        });
        if (list.length > 0) {
          list.sort((a, b) => a.id - b.id);
          setProjectList(list);
        }
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      }
    };
    fetchProjects();
  }, []);

  const categories = ["All Projects", ...Array.from(new Set(projectList.map(p => p.category)))];

  const filteredProjects = activeCategory === "All Projects"
    ? projectList
    : projectList.filter(project => project.category === activeCategory);

  // Check if the view is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Handler for category selection
  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
    setDropdownOpen(false);
  };

  // Animation variants
  // Animation variants are now handled directly in the className
  const categoryVariants = {
    active: {
      scale: 1.05,
      transition: { duration: 0.3 }
    },
    inactive: {
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
    hover: {
      y: -10,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.3 }
    }
  };

  const imageVariants = {
    hover: { 
      scale: 1.1,
      transition: { duration: 0.5 }
    },
    initial: { 
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  const tagVariants = {
    hover: {
      y: -2,
      backgroundColor: "hsl(var(--primary))",
      color: "hsl(var(--primary-foreground))",
      transition: { duration: 0.2 }
    },
    initial: {
      y: 0,
      backgroundColor: "hsl(var(--secondary))",
      color: "hsl(var(--secondary-foreground))",
      transition: { duration: 0.2 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <section id="projects" className="container mx-auto px-4 pt-16 pb-8">
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-4">My Projects</h2>
        <p className="text-lg text-muted-foreground">
          A showcase of my recent work across different domains.
        </p>
      </motion.div>

      {/* Mobile Dropdown */}
      {isMobile ? (
        <motion.div 
          className="relative mb-8 w-full max-w-xs mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between p-3 bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg text-center"
          >
            <span className="flex-grow text-center">{activeCategory}</span>
            <ChevronDown className={`transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div 
                className="absolute z-10 w-full mt-1 bg-card rounded-lg shadow-lg overflow-hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {categories.map((category, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleCategorySelect(category)}
                    className={`w-full p-3 text-center hover:bg-muted ${activeCategory === category ? 'bg-muted-foreground/10' : ''}`}
                    whileHover={{ x: 5 }}
                  >
                    {category}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Desktop Category Tabs */
        <motion.div 
          className="flex flex-wrap justify-center gap-3 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {categories.map((category, index) => (
            <motion.div
              key={index}
              variants={categoryVariants}
              animate={activeCategory === category ? "active" : "inactive"}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(category)}
            >
              <Button
                variant={activeCategory === category ? "default" : "outline"}
                className={`rounded-full transition-all duration-300 px-4 py-2 min-w-[120px] ${
                  activeCategory === category
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span className="whitespace-nowrap">{category}</span>
              </Button>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence mode="wait" initial={false}>
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              whileHover="hover"
              onHoverStart={() => setHoveredProject(project.id)}
              onHoverEnd={() => setHoveredProject(null)}
              layout={true}
              layoutId={`project-${project.id}`}
            >
              <Card className="h-full flex flex-col overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <motion.div
                    variants={imageVariants}
                    initial="initial"
                    animate={hoveredProject === project.id ? "hover" : "initial"}
                    className="h-full w-full"
                  >
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                      priority={true}
                      unoptimized={true}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={(e) => {
                        // Fallback to a placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "https://placehold.co/600x400?text=Project+Image";
                        console.error("Failed to load image:", project.image);
                      }}
                    />
                  </motion.div>
                  
                  <div className="absolute top-2 right-2 px-3 py-1.5 text-xs font-semibold dark:bg-white dark:text-black bg-black text-white rounded-full shadow-sm">
                    {project.category}
                  </div>
                </div>
                
                <CardContent className="flex-grow p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.tags.map((tag, tagIndex) => (
                      <motion.span
                        key={tagIndex}
                        variants={tagVariants}
                        initial="initial"
                        animate={hoveredProject === project.id ? "hover" : "initial"}
                        className="px-2 py-1 text-xs bg-muted rounded-full transition-colors duration-300 flex items-center"
                        style={{ transition: `all 0.3s ease ${tagIndex * 0.1}s` }}
                      >
                        <Tag className="mr-1 h-3 w-3" />
                        {tag}
                      </motion.span>
                    ))}
                  </div>

                  <motion.h3 
                    className="text-xl font-bold mb-2"
                    animate={hoveredProject === project.id ? { color: "var(--primary)" } : { color: "inherit" }}
                  >
                    {project.title}
                  </motion.h3>
                  
                  <p className="text-muted-foreground">{project.description}</p>
                </CardContent>
                
                <CardFooter className="p-6 pt-0 flex gap-2">
                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full"
                    >
                      <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                        <Github className="mr-2 h-4 w-4" />
                        Code
                      </a>
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="sm"
                      asChild
                      className="w-full"
                    >
                      <a href={project.liveLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Live Demo
                      </a>
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
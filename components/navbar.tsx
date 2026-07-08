"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, Code, Briefcase, FolderOpen, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

// Links for the navigation
const navLinks = [
  { name: 'Home', href: '#home', icon: Home },
  { name: 'Skills', href: '#skills', icon: Code },
  { name: 'Experience', href: '#experience', icon: Briefcase },
  { name: 'Projects', href: '#projects', icon: FolderOpen },
  { name: 'Contact', href: '#contact', icon: Mail },
];

const menuIconVariants = {
  closed: { rotate: 0 },
  open: { rotate: 180 }
};

const mobileMenuVariants = {
  closed: { opacity: 0, y: -20 },
  open: { opacity: 1, y: 0 }
};

const linkVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
    },
  }),
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), []);

  const isDark = !mounted || resolvedTheme === 'dark';
  const headerRef = useRef<HTMLElement | null>(null); // Type headerRef as HTMLElement or null

  // Throttled scroll event listener to check active section
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);

      const sections = navLinks.map(link => link.href.substring(1));
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    const debouncedHandleScroll = () => {
      handleScroll();
    };

    window.addEventListener('scroll', debouncedHandleScroll);
    return () => window.removeEventListener('scroll', debouncedHandleScroll);
  }, []);

  // Handle clicks outside to close mobile menu
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {  // Type the event as MouseEvent
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) { // Type event.target as Node
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation variants for mobile menu and links
  const mobileMenuVariants = {
    closed: { opacity: 0, height: 0, transition: { duration: 0.3, ease: "easeInOut" } },
    open: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: "easeInOut" } },
  };

  const linkVariants = {
    initial: { x: -20, opacity: 0 },
    animate: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: { delay: i * 0.1, duration: 0.3 }
    }),
    exit: (i: number) => ({
      x: -20,
      opacity: 0,
      transition: { delay: i * 0.05, duration: 0.2 }
    }),
    hover: { 
      x: 5, 
      color: "var(--primary)",
      transition: { duration: 0.2 }
    }
  };

  const menuIconVariants = {
    closed: { rotate: 0 },
    open: { rotate: 90 }
  };

  return (
    <header
      ref={headerRef}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-background/70 backdrop-blur-md py-3 border-b border-primary/5'
          : 'bg-transparent py-5'
      )}
    >
      <div className="container flex items-center justify-between px-4 mx-auto">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            href="#home" 
            className="text-2xl font-bold transition-colors duration-300 text-primary/90 hover:text-primary"
          >
            Rythm
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="items-center hidden gap-6 md:flex">
          {navLinks.map((link) => (
            <motion.div
              key={link.name}
              className="relative"
            >
              <Link
                href={link.href}
                className={cn(
                  "nav-link relative py-2 transition-colors duration-200 flex items-center",
                  activeSection === link.href.substring(1)
                    ? "text-primary font-medium"
                    : "text-foreground/60 hover:text-foreground/90"
                )}
              >
                {link.name}
                {activeSection === link.href.substring(1) && (
                  <motion.span
                    layoutId="navIndicator"
                    className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          ))}

          {/* Theme Toggle Button */}
          <motion.div
            whileHover={{ rotate: 15, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <div className={cn(
              "absolute inset-0 rounded-full blur-md transition-all duration-500 opacity-75 group-hover:opacity-100",
              isDark
                ? "bg-[#2563eb] group-hover:bg-[#3b82f6]"
                : "bg-[#fbbf24] group-hover:bg-[#facc15]"
            )} />
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "relative h-9 w-9 rounded-full transition-all duration-300 border-2",
                isDark 
                  ? "bg-[#1d4ed8] hover:bg-[#2563eb] text-white border-blue-400" 
                  : "bg-[#fde047] hover:bg-[#facc15] text-black border-yellow-400"
              )}
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
            >
              <Sun 
                className={cn(
                  "h-4 w-4 transition-all duration-300",
                  isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                )} 
              />
              <Moon 
                className={cn(
                  "absolute inset-0 h-4 w-4 m-auto transition-all duration-300",
                  isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
                )} 
              />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </motion.div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <motion.div
            whileHover={{ rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            className="relative group"
          >
            <div
              className={cn(
                "absolute inset-0 rounded-full blur transition-colors duration-300",
                isDark
                  ? "bg-blue-600/50"
                  : "bg-yellow-300/50"
              )}
            />
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "relative h-9 w-9 rounded-full border-2 transition-all duration-300",
                isDark
                  ? "bg-blue-700 hover:bg-blue-600 text-white border-blue-500"
                  : "bg-yellow-400 hover:bg-yellow-300 text-black border-yellow-300"
              )}
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
            >
              {!mounted ? null : isDark ? (
                <Moon className="w-4 h-4 transition-all duration-300" />
              ) : (
                <Sun className="w-4 h-4 transition-all duration-300" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </motion.div>

          {/* Menu Icon */}
          <motion.div
            whileTap={{ scale: 0.9 }}
            animate={mobileMenuOpen ? "open" : "closed"}
            variants={menuIconVariants}
          >
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-primary/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Menu"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mobileMenuOpen ? 'close' : 'menu'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.div>
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="border-t shadow-lg md:hidden bg-card/95 backdrop-blur-md border-border/10"
          >
            <nav className="flex flex-col py-4 h-[100vh] overflow-y-auto">
              {navLinks.map((link, i) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.name}
                    custom={i}
                    variants={linkVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "w-full flex items-center gap-3 px-6 py-3 hover:bg-muted transition-colors",
                        activeSection === link.href.substring(1) ? "text-primary font-medium bg-muted" : ""
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      <span>{link.name}</span>
                      {activeSection === link.href.substring(1) && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="w-1 h-6 ml-auto rounded-full bg-primary"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

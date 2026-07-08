"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Profile from '../assets/profile.png';
import { Github, Linkedin, Twitter, X } from "lucide-react";
import { SiLeetcode, SiKaggle, SiGeeksforgeeks } from "react-icons/si";

const getSocialIcon = (platform: string) => {
  const iconClass = "w-5 h-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7";
  switch (platform.toLowerCase()) {
    case "linkedin":
      return <Linkedin className={iconClass} />;
    case "github":
      return <Github className={iconClass} />;
    case "leetcode":
      return <SiLeetcode className={iconClass} />;
    case "kaggle":
      return <SiKaggle className={iconClass} />;
    case "geeksforgeeks":
      return <SiGeeksforgeeks className={iconClass} />;
    case "twitter":
    case "x":
      return <Twitter className={iconClass} />;
    default:
      return <X className={iconClass} />;
  }
};

export default function Hero() {
  const [profile, setProfile] = useState({
    name: "Rythm",
    role: "Mobile Developer focused on Flutter, Android, and system-level applications",
    profilePicURL: "",
    resumeURL: "/resume.pdf",
    socialLinks: [
      { platform: "LinkedIn", href: "https://linkedin.com/in/rythm-jagga-393791309/" },
      { platform: "LeetCode", href: "https://leetcode.com/u/rythmjagga1609/" },
      { platform: "Kaggle", href: "https://kaggle.com/rythmj" },
      { platform: "GeeksForGeeks", href: "https://www.geeksforgeeks.org/profile/rythmedev" },
      { platform: "Twitter", href: "https://twitter.com/rythmdev" }
    ]
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { db } = await import('@/lib/firebase');
        const { doc, getDoc } = await import('firebase/firestore');
        const docRef = doc(db, "profile", "info");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as any);
        }
      } catch (err) {
        console.error("Failed to fetch profile info:", err);
      }
    };
    fetchProfile();
  }, []);

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  };

  return (
    <>
      <section className="min-h-screen flex flex-col justify-center items-center relative mx-auto max-w-[1920px] py-12 md:py-0 px-4">
        <div className="absolute top-0 left-0 right-0 h-24"></div> {/* Navbar space */}
        <div className="container flex items-center justify-center mx-auto mt-0 sm:mt-4 md:mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16 w-full max-w-7xl px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
            {/* Left Content (text and action buttons) */}
            <motion.div
              className="max-w-2xl space-y-6 text-center md:text-left flex-1 order-2 md:order-1"
              {...fadeIn}
            >
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-3xl tracking-tight text-center md:text-left sm:text-4xl lg:text-6xl xl:text-7xl">
                    <motion.span 
                      className="font-light bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 dark:from-red-500 dark:via-orange-400 dark:to-amber-400 bg-[length:200%_auto]"
                      animate={{
                        backgroundPosition: ["0%", "200%"],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      Hello, I'm{" "}
                    </motion.span>
                    <motion.span 
                      className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-primary to-indigo-600 dark:from-violet-400 dark:via-primary dark:to-indigo-400 bg-[length:200%_auto]"
                      animate={{
                        backgroundPosition: ["0%", "200%"],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      {profile.name}
                    </motion.span>
                  </h1>
                  <p className="text-base leading-relaxed text-center md:text-left text-muted-foreground sm:text-lg lg:text-xl xl:text-2xl">
                    {profile.role}
                  </p>
                </div>

                <div className="flex flex-row justify-center md:justify-start gap-3 sm:gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      size="lg"
                      className="relative px-6 overflow-hidden text-sm font-medium tracking-wide rounded-full bg-primary text-primary-foreground hover:bg-primary/90 sm:px-8 sm:text-base group animate-glow"
                      onClick={() => {
                        const contactSection = document.getElementById('contact');
                        if (contactSection) {
                          contactSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                      />
                      Get in Touch
                    </Button>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="relative px-6 overflow-hidden text-sm font-medium tracking-wide transition-colors rounded-full border-primary text-foreground hover:bg-zinc-800 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-black sm:px-8 sm:text-base group animate-glow-outline"
                      onClick={() => {
                        window.open(profile.resumeURL || '/resume.pdf', '_blank', 'noopener,noreferrer');
                        const link = document.createElement('a');
                        link.href = profile.resumeURL || '/resume.pdf';
                        link.download = `${profile.name || 'Rythm'} resume.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                      />
                      View Resume
                    </Button>
                  </motion.div>
                </div>

                <div className="flex justify-center md:justify-start gap-5 sm:gap-6">
                  {profile.socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative transition-colors group text-muted-foreground hover:text-primary"
                      aria-label={social.platform}
                      whileHover={{ scale: 1.1 }}
                    >
                      <div className="absolute transition-opacity duration-300 rounded-full opacity-0 -inset-2 group-hover:opacity-100 bg-black/5 dark:bg-white/5 blur-md" />
                      <div className="relative">
                        {getSocialIcon(social.platform)}
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Profile Image (On right on desktop, on top on mobile) */}
            <motion.div
              className="block order-1 md:order-2 shrink-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <motion.div 
                className="relative mx-auto"
                animate={{ 
                  y: [0, -8, 0] 
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut"
                }}
              >
                <motion.div 
                  className="relative w-48 h-48 mx-auto rounded-full sm:w-52 sm:h-52 md:w-60 md:h-60 lg:w-72 lg:h-72 xl:w-80 xl:h-80"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Animated gradient border */}
                  <motion.div
                    className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-violet-600 via-primary to-indigo-600 dark:from-violet-400 dark:via-primary dark:to-indigo-400"
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.02, 1],
                      background: [
                        "linear-gradient(0deg, var(--primary) 0%, var(--primary-foreground) 50%, var(--primary) 100%)",
                        "linear-gradient(360deg, var(--primary) 0%, var(--primary-foreground) 50%, var(--primary) 100%)"
                      ]
                    }}
                    transition={{ 
                      rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                      background: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                    }}
                  />

                  {/* Image with glass effect */}
                  <motion.div 
                    className="relative w-full h-full rounded-full p-1.5 bg-gradient-to-b from-zinc-100/80 to-white/80 dark:from-zinc-800/80 dark:to-zinc-900/80 backdrop-blur-sm ring-1 ring-primary/20"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Image
                      src={profile.profilePicURL || Profile}
                      alt="Profile Image"
                      width={500}
                      height={500}
                      className="object-cover w-full h-full rounded-full"
                      priority
                    />
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>


    </>
  );
}

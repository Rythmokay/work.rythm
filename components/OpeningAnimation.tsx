'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const OpeningAnimation = () => {
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimationComplete(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (pathname && pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <AnimatePresence>
      {!isAnimationComplete && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: 'hsl(240 10% 4%)' }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8, delay: 3.2 }}
          onAnimationComplete={() => setIsAnimationComplete(true)}
        >
          <div className="relative flex h-screen w-screen items-center justify-center">
            {/* Background gradient */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to right, hsl(240 4% 12%), hsl(240 5% 65%), hsl(240 4% 16%))',
                filter: 'blur(80px)',
                opacity: 0.5,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 1 }}
            />

            {/* Content container */}
            <div className="relative z-10 flex flex-col items-center gap-8">
              {/* Welcome text */}
              <div className="flex flex-col items-center gap-4 overflow-hidden text-center">
                <motion.h1
                  className="text-4xl font-bold text-white md:text-6xl"
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  Welcome
                </motion.h1>
                <motion.h2
                  className="text-2xl text-gray-300 md:text-3xl"
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                  to my Portfolio
                </motion.h2>
              </div>

              {/* Animated lines */}
              <div className="relative h-px w-48">
                <motion.div
                  className="absolute h-px w-full"
                  style={{ background: 'hsl(240 5% 65%)' }}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{
                    scaleX: 1,
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: 1,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute h-px w-full"
                  style={{ background: 'hsl(240 5% 65%)' }}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{
                    scaleX: 1,
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: 1.2,
                    ease: "easeInOut",
                  }}
                />
              </div>

              {/* Animated dots */}
              <div className="flex gap-3">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-2 w-2 rounded-full"
                    style={{ background: 'hsl(240 5% 65%)' }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 1, 1, 0],
                      opacity: [0, 1, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 1.5 + i * 0.2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OpeningAnimation;

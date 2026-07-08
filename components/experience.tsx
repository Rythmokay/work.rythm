"use client";

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { experiences } from '@/Data/ExperienceData';
import type { Experience } from '@/Data/ExperienceData';

export default function Experience() {
  const [experienceList, setExperienceList] = useState<Experience[]>(experiences);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const { db } = await import('@/lib/firebase');
        const { collection, getDocs } = await import('firebase/firestore');
        const querySnapshot = await getDocs(collection(db, "experiences"));
        const list: Experience[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ ...doc.data() } as Experience);
        });
        if (list.length > 0) {
          list.sort((a, b) => a.id - b.id);
          setExperienceList(list);
        }
      } catch (err) {
        console.error("Failed to fetch experiences:", err);
      }
    };
    fetchExperiences();
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Work Experience</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          My professional journey and the roles I've taken on throughout my career.
        </p>
      </motion.div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-0 md:left-1/2 h-full w-0.5 bg-border transform -translate-x-1/2 hidden md:block"></div>
        
        <div className="space-y-8">
          {experienceList.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className={`md:flex items-center md:mb-16 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                {/* Timeline dot */}
                <div className="absolute left-0 md:left-1/2 w-4 h-4 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2 top-1/2 hidden md:block"></div>
                
                <div className="md:w-1/2 md:px-12">
                  <Card className="border border-border/40 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-6">
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        {exp.role}
                      </CardTitle>
                      <CardDescription className="text-base font-medium mt-2">
                        {exp.company}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-2">
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4" />
                          {exp.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          {exp.period}
                        </div>
                      </div>
                      
                      <ul className="space-y-2 list-disc pl-5">
                        {exp.description.map((desc, i) => (
                          <li key={i} className="mb-2">{desc}</li>
                        ))}
                      </ul>
                      {exp.projectUrl && (
                        <div className="mt-6 flex justify-center">
                          <a
                            href={exp.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                          >
                            <span>View Project website</span>
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div className="md:w-1/2"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
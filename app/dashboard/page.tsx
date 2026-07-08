"use client";

import { useState, useEffect, useRef } from "react";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User
} from "firebase/auth";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  getDoc
} from "firebase/firestore";
import { auth, storage, db } from "@/lib/firebase";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Icons
import {
  Lock,
  Mail,
  LogOut,
  Trash2,
  User as UserIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Code,
  FolderOpen,
  MessageSquare,
  FileText,
  Plus,
  Edit2,
  ExternalLink,
  Database,
  Search,
  SlidersHorizontal,
  Menu,
  X,
  Home,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

// Static default data to use for seeding
import { experiences as defaultExperiences } from '@/Data/ExperienceData';
import { projects as defaultProjects } from '@/Data/Projectsdata';

// Default skills list
const DEFAULT_SKILLS = [
  { name: "Kotlin", category: "Languages", color: "bg-violet-500" },
  { name: "Java", category: "Languages", color: "bg-orange-600" },
  { name: "Dart", category: "Languages", color: "bg-sky-500" },
  { name: "Python", category: "Languages", color: "bg-blue-500" },
  { name: "Flutter", category: "Mobile Development", color: "bg-cyan-500" },
  { name: "Android", category: "Mobile Development", color: "bg-green-600" },
  { name: "Jetpack Compose", category: "Mobile Development", color: "bg-indigo-500" },
  { name: "Node.js", category: "Backend & Database", color: "bg-green-600" },
  { name: "Express.js", category: "Backend & Database", color: "bg-gray-600" },
  { name: "PostgreSQL", category: "Backend & Database", color: "bg-blue-600" },
  { name: "Firebase", category: "Backend & Database", color: "bg-yellow-600" },
  { name: "BLE", category: "Bluetooth & Audio", color: "bg-sky-600" },
  { name: "Classic Bluetooth", category: "Bluetooth & Audio", color: "bg-blue-500" },
  { name: "AudioManager", category: "Bluetooth & Audio", color: "bg-rose-500" },
  { name: "Media Playback", category: "Bluetooth & Audio", color: "bg-pink-500" }
];

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "skills" | "experience" | "projects" | "leads">("profile");

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Auth States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Seeding States
  const [seeding, setSeeding] = useState(false);
  const [seedingStatus, setSeedingStatus] = useState("");

  // Firestore Data States
  const [profileData, setProfileData] = useState<any>({
    name: "Rythm",
    role: "Mobile Developer focused on Flutter, Android, and system-level applications",
    profilePicURL: "",
    resumeURL: "",
    socialLinks: []
  });
  const [skillsList, setSkillsList] = useState<any[]>([]);
  const [experienceList, setExperienceList] = useState<any[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [leadsList, setLeadsList] = useState<any[]>([]);

  // Search & Filter Query States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Action Feedback alerts
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"skill" | "experience" | "project" | null>(null);
  const [editItem, setEditItem] = useState<any | null>(null);

  // Category select/custom states
  const [skillCategoryMode, setSkillCategoryMode] = useState<"select" | "custom">("select");
  const [projectCategoryMode, setProjectCategoryMode] = useState<"select" | "custom">("select");

  // Selected lead popup modal state
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  // Form Fields Inputs
  const [skillInput, setSkillInput] = useState({ name: "", category: "Languages", color: "bg-blue-500" });
  const [expInput, setExpInput] = useState({ id: 0, role: "", company: "", location: "", period: "", description: "", projectUrl: "" });
  const [projectInput, setProjectInput] = useState({ id: 0, title: "", description: "", category: "Web Development", tags: "", githubLink: "", liveLink: "", image: "" });

  const [projectFile, setProjectFile] = useState<File | null>(null);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const projectImageInputRef = useRef<HTMLInputElement>(null);

  // Reset query search on tab switch
  useEffect(() => {
    setSearchQuery("");
    setFilterCategory("All");
    setActionError(null);
    setActionSuccess(null);
    setIsSidebarOpen(false); // Close mobile drawer on tab click
  }, [activeTab]);

  // Auth Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email?.toLowerCase() !== "rythm.meta@gmail.com") {
        signOut(auth);
        setUser(null);
      } else {
        setUser(currentUser);
        if (currentUser) {
          fetchDashboardData();
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Firestore Collections
  const fetchDashboardData = async () => {
    try {
      const profileSnap = await getDoc(doc(db, "profile", "info"));
      let profile = null;
      if (profileSnap.exists()) {
        profile = profileSnap.data();
        setProfileData(profile);
      }

      const skillsSnap = await getDocs(collection(db, "skills"));
      const sList: any[] = [];
      skillsSnap.forEach((doc) => sList.push(doc.data()));

      const expSnap = await getDocs(collection(db, "experiences"));
      const eList: any[] = [];
      expSnap.forEach((doc) => eList.push(doc.data()));

      const projSnap = await getDocs(collection(db, "projects"));
      const pList: any[] = [];
      projSnap.forEach((doc) => pList.push(doc.data()));

      // Check if Firestore has not been seeded yet. If empty, trigger auto-seed.
      if (!profile || sList.length === 0 || eList.length === 0 || pList.length === 0) {
        console.log("Database empty. Auto-seeding default data to Firestore...");
        await runAutoSeed();
        return;
      }

      setSkillsList(sList);

      eList.sort((a, b) => (a.id || 0) - (b.id || 0));
      setExperienceList(eList);

      pList.sort((a, b) => (a.id || 0) - (b.id || 0));
      setProjectsList(pList);

      const messagesSnap = await getDocs(collection(db, "messages"));
      const mList: any[] = [];
      messagesSnap.forEach((doc) => mList.push({ id: doc.id, ...doc.data() }));
      mList.sort((a, b) => new Date(b.timestamp || "").getTime() - new Date(a.timestamp || "").getTime());
      setLeadsList(mList);
    } catch (err) {
      console.error("Dashboard synchronization failed:", err);
    }
  };

  // Auto-seed helper for uninitialized database
  const runAutoSeed = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const seededProfile = {
        name: "Rythm",
        role: "Mobile Developer focused on Flutter, Android, and system-level applications",
        profilePicURL: "/profile.png",
        resumeURL: "/resume.pdf",
        socialLinks: [
          { platform: "LinkedIn", href: "https://linkedin.com/in/rythm-jagga-393791309/" },
          { platform: "LeetCode", href: "https://leetcode.com/u/rythmjagga1609/" },
          { platform: "Kaggle", href: "https://kaggle.com/rythmj" },
          { platform: "GeeksForGeeks", href: "https://www.geeksforgeeks.org/profile/rythmedev" },
          { platform: "Twitter", href: "https://twitter.com/rythmdev" }
        ]
      };
      await setDoc(doc(db, "profile", "info"), seededProfile);

      for (const skill of DEFAULT_SKILLS) {
        await setDoc(doc(db, "skills", skill.name), skill);
      }

      for (const exp of defaultExperiences) {
        await setDoc(doc(db, "experiences", exp.id.toString()), {
          id: exp.id,
          role: exp.role,
          company: exp.company,
          location: exp.location,
          period: exp.period,
          description: exp.description,
          projectUrl: exp.projectUrl || ""
        });
      }

      const staticProjects = [
        {
          id: 1,
          title: "Portfolio Website",
          description: "A modern developer portfolio built with Next.js, Tailwind CSS, and Framer Motion with responsive UI and smooth animations.",
          image: "/Projectsassets/portfolio.png",
          category: "Web Development",
          tags: ["Next.js", "Tailwind CSS", "TypeScript", "Framer Motion"],
          githubLink: "https://github.com/Rythmokay/work.rythm",
          liveLink: "https://workrythm.vercel.app",
        },
        {
          id: 2,
          title: "Spotify Clone",
          description: "A Flutter-based music streaming UI with playlist management, audio playback controls, and Riverpod state management.",
          image: "/Projectsassets/spotify.jpg",
          category: "Mobile Development",
          tags: ["Flutter", "Riverpod", "Dart", "Audio Playback"],
          githubLink: "https://github.com/Rythmokay",
          liveLink: "https://github.com/Rythmokay",
        },
        {
          id: 3,
          title: "Resume Matcher",
          description: "An AI-powered resume analysis tool that compares resumes with job descriptions using NLP techniques and keyword matching.",
          image: "/Projectsassets/resume.png",
          category: "AI & ML",
          tags: ["Python", "NLTK", "Streamlit", "NLP"],
          githubLink: "https://github.com/Rythmokay/resume-checker",
          liveLink: "https://nlpprojectresume.streamlit.app/",
        },
        {
          id: 4,
          title: "Grammar & Spell Checker",
          description: "A text correction application using NLP techniques for grammar correction and spell checking.",
          image: "/Projectsassets/Grammarandspellcheckerapp.png",
          category: "AI & ML",
          tags: ["Python", "TextBlob", "NLTK", "NLP"],
          githubLink: "https://github.com/Rythmokay/spellchecker",
          liveLink: "https://grammarandspellchecker.vercel.app/",
        }
      ];

      for (const p of staticProjects) {
        await setDoc(doc(db, "projects", p.id.toString()), p);
      }

      fetchDashboardData();
    } catch (err) {
      console.error("Database auto-seeding failed:", err);
    }
  };

  // Fast database seeding with Storage fast-fail checking
  const handleSeedDatabase = async () => {
    setSeeding(true);
    setSeedingStatus("Initializing...");
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not logged in");

      let storageEnabled = true;

      // 1. Upload Profile Pic
      setSeedingStatus("Uploading profile picture...");
      let profilePicURL = "";
      try {
        const picRes = await fetch("/profile.png");
        const picBlob = await picRes.blob();
        const picRef = ref(storage, `users/${currentUser.uid}/profile_pic.png`);
        await uploadBytes(picRef, picBlob);
        profilePicURL = await getDownloadURL(picRef);
      } catch (err) {
        console.error("Profile picture upload skipped:", err);
        storageEnabled = false;
      }

      // 2. Upload Resume
      let resumeURL = "";
      if (storageEnabled) {
        setSeedingStatus("Uploading resume PDF...");
        try {
          const resumeRes = await fetch("/resume.pdf");
          const resumeBlob = await resumeRes.blob();
          const resumeRef = ref(storage, `users/${currentUser.uid}/resume.pdf`);
          await uploadBytes(resumeRef, resumeBlob);
          resumeURL = await getDownloadURL(resumeRef);
        } catch (err) {
          console.error("Resume upload skipped:", err);
          storageEnabled = false;
        }
      }

      // 3. Save profile doc
      setSeedingStatus("Writing profile doc...");
      const seededProfile = {
        name: "Rythm",
        role: "Mobile Developer focused on Flutter, Android, and system-level applications",
        profilePicURL: profilePicURL || "/profile.png",
        resumeURL: resumeURL || "/resume.pdf",
        socialLinks: [
          { platform: "LinkedIn", href: "https://linkedin.com/in/rythm-jagga-393791309/" },
          { platform: "LeetCode", href: "https://leetcode.com/u/rythmjagga1609/" },
          { platform: "Kaggle", href: "https://kaggle.com/rythmj" },
          { platform: "GeeksForGeeks", href: "https://www.geeksforgeeks.org/profile/rythmedev" },
          { platform: "Twitter", href: "https://twitter.com/rythmdev" }
        ]
      };
      await setDoc(doc(db, "profile", "info"), seededProfile);
      setProfileData(seededProfile);

      // 4. Save skills
      setSeedingStatus("Writing skills...");
      for (const skill of DEFAULT_SKILLS) {
        await setDoc(doc(db, "skills", skill.name), skill);
      }

      // 5. Save experiences
      setSeedingStatus("Writing experiences...");
      for (const exp of defaultExperiences) {
        await setDoc(doc(db, "experiences", exp.id.toString()), {
          id: exp.id,
          role: exp.role,
          company: exp.company,
          location: exp.location,
          period: exp.period,
          description: exp.description,
          projectUrl: exp.projectUrl || ""
        });
      }

      // 6. Save projects and cover uploads
      setSeedingStatus("Writing projects...");
      const staticProjects = [
        {
          id: 1,
          title: "Portfolio Website",
          description: "A modern developer portfolio built with Next.js, Tailwind CSS, and Framer Motion with responsive UI and smooth animations.",
          image: "/Projectsassets/portfolio.png",
          category: "Web Development",
          tags: ["Next.js", "Tailwind CSS", "TypeScript", "Framer Motion"],
          githubLink: "https://github.com/Rythmokay/work.rythm",
          liveLink: "https://workrythm.vercel.app",
        },
        {
          id: 2,
          title: "Spotify Clone",
          description: "A Flutter-based music streaming UI with playlist management, audio playback controls, and Riverpod state management.",
          image: "/Projectsassets/spotify.jpg",
          category: "Mobile Development",
          tags: ["Flutter", "Riverpod", "Dart", "Audio Playback"],
          githubLink: "https://github.com/Rythmokay",
          liveLink: "https://github.com/Rythmokay",
        },
        {
          id: 3,
          title: "Resume Matcher",
          description: "An AI-powered resume analysis tool that compares resumes with job descriptions using NLP techniques and keyword matching.",
          image: "/Projectsassets/resume.png",
          category: "AI & ML",
          tags: ["Python", "NLTK", "Streamlit", "NLP"],
          githubLink: "https://github.com/Rythmokay/resume-checker",
          liveLink: "https://nlpprojectresume.streamlit.app/",
        },
        {
          id: 4,
          title: "Grammar & Spell Checker",
          description: "A text correction application using NLP techniques for grammar correction and spell checking.",
          image: "/Projectsassets/Grammarandspellcheckerapp.png",
          category: "AI & ML",
          tags: ["Python", "TextBlob", "NLTK", "NLP"],
          githubLink: "https://github.com/Rythmokay/spellchecker",
          liveLink: "https://grammarandspellchecker.vercel.app/",
        }
      ];

      for (const p of staticProjects) {
        let imageURL = "";
        if (storageEnabled) {
          try {
            const imgRes = await fetch(p.image);
            const imgBlob = await imgRes.blob();
            const fileExtension = p.image.split('.').pop() || 'png';
            const imgRef = ref(storage, `projects/${p.id}_img.${fileExtension}`);
            await uploadBytes(imgRef, imgBlob);
            imageURL = await getDownloadURL(imgRef);
          } catch (err) {
            console.error(`Project ${p.id} asset skipped:`, err);
            storageEnabled = false;
          }
        }

        await setDoc(doc(db, "projects", p.id.toString()), {
          ...p,
          image: imageURL || p.image
        });
      }

      setActionSuccess("Database initialized successfully!");
      fetchDashboardData();
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || "Failed to seed database.");
    } finally {
      setSeeding(false);
    }
  };

  // Sign in
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError(null);

    if (email.trim().toLowerCase() !== "rythm.meta@gmail.com") {
      setAuthError("Access Denied: Admin authorization required.");
      setIsLoggingIn(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      setAuthError("Invalid credentials. Please verify your password.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Sign out
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // Profile Save
  const handleSaveProfileInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    try {
      await setDoc(doc(db, "profile", "info"), profileData);
      setActionSuccess("Profile details saved successfully!");
    } catch (err: any) {
      setActionError(err.message || "Failed to update profile details.");
    }
  };

  // Skill Submit
  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    try {
      await setDoc(doc(db, "skills", skillInput.name), skillInput);
      setActionSuccess(`Skill "${skillInput.name}" saved!`);
      setIsModalOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      setActionError(err.message || "Failed to save skill.");
    }
  };

  const handleDeleteSkill = async (name: string) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await deleteDoc(doc(db, "skills", name));
      setActionSuccess("Skill deleted successfully.");
      fetchDashboardData();
    } catch (err: any) {
      setActionError(err.message || "Failed to delete skill.");
    }
  };

  // Experience Submit
  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    try {
      const id = editItem ? editItem.id : (experienceList.length > 0 ? Math.max(...experienceList.map(e => e.id)) + 1 : 1);
      const docData = {
        id,
        role: expInput.role,
        company: expInput.company,
        location: expInput.location,
        period: expInput.period,
        description: expInput.description.split("\n").filter(line => line.trim() !== ""),
        projectUrl: expInput.projectUrl
      };
      await setDoc(doc(db, "experiences", id.toString()), docData);
      setActionSuccess("Experience timeline saved!");
      setIsModalOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      setActionError(err.message || "Failed to save experience.");
    }
  };

  const handleDeleteExperience = async (id: number) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await deleteDoc(doc(db, "experiences", id.toString()));
      setActionSuccess("Experience deleted successfully.");
      fetchDashboardData();
    } catch (err: any) {
      setActionError(err.message || "Failed to delete experience.");
    }
  };

  // Project Submit
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    setUploadingPic(true);
    try {
      const id = editItem ? editItem.id : (projectsList.length > 0 ? Math.max(...projectsList.map(p => p.id)) + 1 : 1);
      const docData = {
        id,
        title: projectInput.title,
        description: projectInput.description,
        category: projectInput.category,
        tags: projectInput.tags.split(",").map(t => t.trim()).filter(t => t !== ""),
        githubLink: projectInput.githubLink,
        liveLink: projectInput.liveLink,
        image: projectInput.image
      };

      await setDoc(doc(db, "projects", id.toString()), docData);
      setActionSuccess("Project catalog saved!");
      setIsModalOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      setActionError(err.message || "Failed to save project.");
    } finally {
      setUploadingPic(false);
    }
  };

  const handleDeleteProject = async (id: number) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await deleteDoc(doc(db, "projects", id.toString()));
      setActionSuccess("Project deleted.");
      fetchDashboardData();
    } catch (err: any) {
      setActionError(err.message || "Failed to delete project.");
    }
  };

  const handleDeleteLead = async (id: string) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await deleteDoc(doc(db, "messages", id));
      setActionSuccess("Message lead deleted.");
      fetchDashboardData();
    } catch (err: any) {
      setActionError(err.message || "Failed to delete lead.");
    }
  };

  // Excel/CSV Leads Downloader
  const downloadLeadsAsExcel = () => {
    if (leadsList.length === 0) return;

    // CSV Headers
    const headers = ["Name", "Email", "Query Type", "Message Detail", "Timestamp"];

    // Map rows
    const rows = leadsList.map(lead => [
      `"${lead.name.replace(/"/g, '""')}"`,
      `"${lead.email.replace(/"/g, '""')}"`,
      `"${lead.purpose.replace(/"/g, '""')}"`,
      `"${lead.message.replace(/"/g, '""')}"`,
      `"${new Date(lead.timestamp).toLocaleString()}"`
    ]);

    // Combine
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rythm_Leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open modals
  const openModal = (type: "skill" | "experience" | "project", item: any = null) => {
    setEditItem(item);
    setModalType(type);
    setIsModalOpen(true);
    setSkillCategoryMode("select");
    setProjectCategoryMode("select");

    if (type === "skill") {
      setSkillInput(item ? { name: item.name, category: item.category, color: item.color } : { name: "", category: "Languages", color: "bg-blue-500" });
    } else if (type === "experience") {
      setExpInput(item ? {
        id: item.id,
        role: item.role,
        company: item.company,
        location: item.location,
        period: item.period,
        description: item.description.join("\n"),
        projectUrl: item.projectUrl || ""
      } : { id: 0, role: "", company: "", location: "", period: "", description: "", projectUrl: "" });
    } else if (type === "project") {
      setProjectFile(null);
      setProjectInput(item ? {
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        tags: item.tags.join(", "),
        githubLink: item.githubLink,
        liveLink: item.liveLink,
        image: item.image || ""
      } : { id: 0, title: "", description: "", category: "Web Development", tags: "", githubLink: "", liveLink: "", image: "" });
    }
  };

  const handleSkillCategorySelectChange = (val: string) => {
    if (val === "__custom__") {
      setSkillCategoryMode("custom");
      setSkillInput({ ...skillInput, category: "" });
    } else {
      setSkillCategoryMode("select");
      setSkillInput({ ...skillInput, category: val });
    }
  };

  const handleProjectCategorySelectChange = (val: string) => {
    if (val === "__custom__") {
      setProjectCategoryMode("custom");
      setProjectInput({ ...projectInput, category: "" });
    } else {
      setProjectCategoryMode("select");
      setProjectInput({ ...projectInput, category: val });
    }
  };

  // Search and Filter computation lists
  const filteredSkills = skillsList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterCategory === "All" || s.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const filteredExperiences = experienceList.filter(e => {
    return e.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredProjects = projectsList.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()) || p.tags.join(" ").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterCategory === "All" || p.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const filteredLeads = leadsList.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.email.toLowerCase().includes(searchQuery.toLowerCase()) || l.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterCategory === "All" || (l.purpose || "General Inquiry") === filterCategory;
    return matchesSearch && matchesFilter;
  });

  // Extract categories dynamically for filters
  const uniqueSkillCategories = Array.from(new Set(skillsList.map(s => s.category).filter(Boolean)));
  const uniqueProjectCategories = Array.from(new Set(projectsList.map(p => p.category).filter(Boolean)));
  const uniqueLeadCategories = Array.from(new Set(leadsList.map(l => l.purpose || "General Inquiry").filter(Boolean)));

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col font-sans text-zinc-900 antialiased relative">
      {loading ? (
        <div className="flex-grow flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">Verifying Authorization...</p>
        </div>
      ) : !user ? (
        // Centered Login Card
        <div className="flex-grow flex items-center justify-center px-4 py-16 bg-zinc-100">
          <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg border border-zinc-200 flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center text-lg font-bold mb-4 shadow-sm shadow-blue-500/10">
              R
            </div>

            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-xs text-zinc-500 mt-0.5 mb-6 uppercase tracking-wider font-semibold">Sign in to edit website</p>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="rythm.meta@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white border-zinc-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 text-sm py-5"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-white border-zinc-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 text-sm py-5"
                    required
                  />
                </div>
              </div>

              {authError && (
                <div className="flex items-start gap-2 p-3 text-xs text-red-650 text-red-600 bg-red-50 rounded-lg border border-red-100">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <span>{authError}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-5 font-semibold text-sm transition-colors mt-2"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
              </Button>
            </form>

            <div className="w-full border-t border-zinc-200 mt-6 pt-4 text-center">
              <Link
                href="/"
                className="text-xs text-zinc-500 hover:text-blue-600 font-bold inline-flex items-center gap-1 transition-colors"
              >
                <Home className="h-3.5 w-3.5" /> Back to Website
              </Link>
            </div>
          </div>
        </div>
      ) : (
        // Responsive Dashboard Layout
        <div className="flex-grow flex flex-col md:flex-row h-screen overflow-hidden bg-zinc-50">

          {/* Topbar for Mobile Screens */}
          <header className="md:hidden bg-zinc-900 border-b border-zinc-800 text-zinc-300 px-4 py-3 flex items-center justify-between z-30 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-zinc-300 hover:text-white p-1 rounded-lg focus:outline-none"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="w-6 h-6 bg-blue-600 text-white font-bold rounded flex items-center justify-center text-xs">
                R
              </div>
              <span className="font-bold text-white text-xs uppercase tracking-wider">
                {activeTab}
              </span>
            </div>

            <div className="flex gap-2">
              {activeTab === "profile" && (
                <button
                  onClick={handleSeedDatabase}
                  disabled={seeding}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded px-2.5 py-1 text-[10px] font-bold flex items-center gap-1"
                >
                  <Database className="h-3 w-3" /> Seed
                </button>
              )}
              {activeTab === "skills" && (
                <button onClick={() => openModal("skill")} className="bg-blue-600 text-white rounded px-2.5 py-1 text-[10px] font-bold flex items-center gap-0.5">
                  <Plus className="h-3 w-3" /> Add
                </button>
              )}
              {activeTab === "experience" && (
                <button onClick={() => openModal("experience")} className="bg-blue-600 text-white rounded px-2.5 py-1 text-[10px] font-bold flex items-center gap-0.5">
                  <Plus className="h-3 w-3" /> Add
                </button>
              )}
              {activeTab === "projects" && (
                <button onClick={() => openModal("project")} className="bg-blue-600 text-white rounded px-2.5 py-1 text-[10px] font-bold flex items-center gap-0.5">
                  <Plus className="h-3 w-3" /> Add
                </button>
              )}
              {activeTab === "leads" && (
                <button onClick={downloadLeadsAsExcel} className="bg-green-600 text-white rounded px-2.5 py-1 text-[10px] font-bold flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Excel
                </button>
              )}
            </div>
          </header>

          {/* Left Sidebar (Drawer on mobile, collapsible on desktop) */}
          <aside className={`fixed inset-y-0 left-0 z-50 bg-zinc-950 text-zinc-300 border-r border-zinc-900 flex flex-col justify-between shrink-0 transform transition-all duration-300 ease-in-out md:static md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } ${isSidebarCollapsed ? "md:w-16" : "md:w-60"
            }`}>
            <div>
              {/* Header profile info */}
              <div className="p-4 border-b border-zinc-900 flex items-center justify-between h-14">
                {isSidebarCollapsed ? (
                  <div className="w-8 h-8 bg-blue-600 text-white font-bold rounded flex items-center justify-center text-sm shadow-sm mx-auto">
                    R
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 bg-blue-600 text-white font-bold rounded flex items-center justify-center text-sm shadow-sm shrink-0">
                      R
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-white text-xs leading-tight truncate">Rythm Jagga</span>
                      <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Admin Portal</span>
                    </div>
                  </div>
                )}

                {/* Close drawer button on mobile */}
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="md:hidden text-zinc-300 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation links */}
              <nav className="p-2 space-y-1">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${isSidebarCollapsed ? "justify-center py-3" : "gap-2.5 px-3 py-2.5"
                    } ${activeTab === "profile"
                      ? "bg-zinc-800 text-white shadow-xs"
                      : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    }`}
                  title="General Info"
                >
                  <UserIcon className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span>General Info</span>}
                </button>

                <button
                  onClick={() => setActiveTab("skills")}
                  className={`w-full flex items-center rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${isSidebarCollapsed ? "justify-center py-3" : "gap-2.5 px-3 py-2.5"
                    } ${activeTab === "skills"
                      ? "bg-zinc-800 text-white shadow-xs"
                      : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    }`}
                  title="Skills"
                >
                  <Code className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span>Skills</span>}
                </button>

                <button
                  onClick={() => setActiveTab("experience")}
                  className={`w-full flex items-center rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${isSidebarCollapsed ? "justify-center py-3" : "gap-2.5 px-3 py-2.5"
                    } ${activeTab === "experience"
                      ? "bg-zinc-800 text-white shadow-xs"
                      : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    }`}
                  title="Experience"
                >
                  <Briefcase className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span>Experience</span>}
                </button>

                <button
                  onClick={() => setActiveTab("projects")}
                  className={`w-full flex items-center rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${isSidebarCollapsed ? "justify-center py-3" : "gap-2.5 px-3 py-2.5"
                    } ${activeTab === "projects"
                      ? "bg-zinc-800 text-white shadow-xs"
                      : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    }`}
                  title="Projects"
                >
                  <FolderOpen className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span>Projects</span>}
                </button>

                <button
                  onClick={() => setActiveTab("leads")}
                  className={`w-full flex items-center rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${isSidebarCollapsed ? "justify-center py-3" : "gap-2.5 px-3 py-2.5 justify-between"
                    } ${activeTab === "leads"
                      ? "bg-zinc-800 text-white shadow-xs"
                      : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    }`}
                  title="Leads List"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    {!isSidebarCollapsed && <span className="truncate">Leads List</span>}
                  </div>
                  {!isSidebarCollapsed && leadsList.length > 0 && (
                    <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono shrink-0">
                      {leadsList.length}
                    </span>
                  )}
                </button>
              </nav>
            </div>

            {/* Sidebar Bottom */}
            <div className="p-2 border-t border-zinc-900 space-y-1.5">
              <Link
                href="/"
                className={`w-full flex items-center justify-center rounded-lg text-xs font-bold text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors py-2 border border-zinc-800 ${isSidebarCollapsed ? "px-0" : "gap-1.5"
                  }`}
                title="View Portfolio"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                {!isSidebarCollapsed && <span>View Portfolio</span>}
              </Link>
              <button
                onClick={handleLogout}
                className={`w-full flex items-center rounded-lg text-xs font-bold uppercase tracking-wider text-rose-400 hover:bg-rose-900/20 hover:text-rose-300 transition-all ${isSidebarCollapsed ? "justify-center py-3" : "gap-2.5 px-3 py-2.5"
                  }`}
                title="Sign Out"
              >
                <LogOut className="h-4.5 w-4.5 shrink-0 text-rose-400" />
                {!isSidebarCollapsed && <span>Sign Out</span>}
              </button>
            </div>
          </aside>

          {/* Dark Backdrop for Mobile drawer */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Main Content Pane */}
          <main className="flex-grow flex flex-col h-full overflow-y-auto bg-zinc-100">

            {/* Desktop Header bar (hidden on mobile) */}
            <header className="hidden md:flex bg-white border-b border-zinc-200 py-3.5 px-6 shrink-0 flex-row justify-between items-center h-14">
              <div className="flex items-center min-w-0">
                {/* Desktop Sidebar Toggle Button */}
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-1 text-zinc-500 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors mr-3 shrink-0"
                  title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                  {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>

                <div className="min-w-0">
                  <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-widest leading-none">
                    {activeTab === "profile" && "Profile Information"}
                    {activeTab === "skills" && "Skills Catalog"}
                    {activeTab === "experience" && "Work Timeline"}
                    {activeTab === "projects" && "Projects Catalog"}
                    {activeTab === "leads" && "Visitor Leads List"}
                  </h2>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 shrink-0">
                {activeTab === "profile" && (
                  <button
                    onClick={handleSeedDatabase}
                    disabled={seeding}
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-1.5 text-[11px] font-bold shadow-xs py-1.5 px-3 transition-colors"
                  >
                    {seeding ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        {seedingStatus || "Seeding..."}
                      </>
                    ) : (
                      <>
                        <Database className="h-3 w-3" />
                        Reset / Seed Database
                      </>
                    )}
                  </button>
                )}

                {activeTab === "skills" && (
                  <button
                    onClick={() => openModal("skill")}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 text-[11px] font-bold py-1.5 px-3 shadow-xs transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Skill
                  </button>
                )}

                {activeTab === "experience" && (
                  <button
                    onClick={() => openModal("experience")}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 text-[11px] font-bold py-1.5 px-3 shadow-xs transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Experience
                  </button>
                )}

                {activeTab === "projects" && (
                  <button
                    onClick={() => openModal("project")}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 text-[11px] font-bold py-1.5 px-3 shadow-xs transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Project
                  </button>
                )}

                {activeTab === "leads" && (
                  <button
                    onClick={downloadLeadsAsExcel}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1.5 text-[11px] font-bold py-1.5 px-3 shadow-xs transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5 text-white" /> Download Excel Sheet
                  </button>
                )}
              </div>
            </header>

            {/* Content Body */}
            <div className="p-4 md:p-6 max-w-6xl w-full mx-auto">

              {/* Alert Feedback notifications */}
              {actionError && (
                <div className="mb-4 flex items-start gap-2 p-3 text-xs text-red-700 bg-red-50 rounded-lg border border-red-200 shadow-xs">
                  <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5 text-red-500" />
                  <span className="font-semibold">{actionError}</span>
                </div>
              )}

              {actionSuccess && (
                <div className="mb-4 flex items-start gap-2 p-3 text-xs text-green-700 bg-green-50 rounded-lg border border-green-200 shadow-xs">
                  <CheckCircle2 className="h-4.5 w-4.5 flex-shrink-0 mt-0.5 text-green-500" />
                  <span className="font-semibold">{actionSuccess}</span>
                </div>
              )}

              {/* Dynamic Search & Filter Header */}
              {activeTab !== "profile" && (
                <div className="mb-4 bg-white p-3 md:p-4 rounded-xl shadow-xs border border-zinc-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
                  {/* Search query input */}
                  <div className="relative w-full sm:max-w-xs md:max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                      type="text"
                      placeholder={`Search ${activeTab}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-white border-zinc-200 rounded-lg text-xs py-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Category filters query dropdown */}
                  {activeTab === "skills" && (
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full sm:w-48 bg-white border border-zinc-200 rounded-lg text-xs p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800"
                      >
                        <option value="All">All Categories</option>
                        {uniqueSkillCategories.map((c, idx) => (
                          <option key={idx} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {activeTab === "projects" && (
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full sm:w-48 bg-white border border-zinc-200 rounded-lg text-xs p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800"
                      >
                        <option value="All">All Categories</option>
                        {uniqueProjectCategories.map((c, idx) => (
                          <option key={idx} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {activeTab === "leads" && (
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full sm:w-48 bg-white border border-zinc-200 rounded-lg text-xs p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800"
                      >
                        <option value="All">All Inquiries</option>
                        {uniqueLeadCategories.map((c, idx) => (
                          <option key={idx} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 1: Profile Info Panel */}
              {activeTab === "profile" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left avatar photo details & upload files card */}
                  <div className="space-y-6 lg:col-span-1">
                    {/* Avatar preview card */}
                    <div className="bg-white p-6 rounded-xl shadow-xs border border-zinc-200 flex flex-col items-center text-center">
                      <Avatar className="h-24 w-24 border border-zinc-200 shadow-xs">
                        <AvatarImage src={profileData.profilePicURL || ""} className="object-cover" />
                        <AvatarFallback className="bg-zinc-50 text-zinc-500">
                          <UserIcon className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>

                      <h3 className="font-bold text-zinc-900 mt-4 text-sm">{profileData.name}</h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1.5 tracking-wider max-w-[200px] leading-tight">{profileData.role}</p>
                    </div>

                    {/* Resume files configuration details */}
                    <div className="bg-white p-5 rounded-xl shadow-xs border border-zinc-200">
                      <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-3">Resume Configuration</h4>
                      <div className="flex items-center gap-2 p-2 bg-zinc-50 rounded-lg border border-zinc-150">
                        <FileText className="h-6 w-6 text-blue-500 flex-shrink-0" />
                        <div className="flex-grow min-w-0">
                          <p className="text-[11px] font-bold text-zinc-800 truncate">Rythm Jagga Resume</p>
                          <p className="text-[9px] text-zinc-500 mt-0.5 truncate leading-none">
                            {profileData.resumeURL ? "File connected in Firebase" : "No file connected"}
                          </p>
                        </div>
                      </div>

                      {profileData.resumeURL && (
                        <div className="mt-3.5">
                          <button
                            onClick={() => window.open(profileData.resumeURL, '_blank')}
                            className="w-full bg-zinc-905 bg-zinc-900 text-white hover:bg-zinc-800 text-xs py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                          >
                            <ExternalLink className="h-3 w-3 text-white" /> View Resume File
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile Form Details Input Column */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-xs border border-zinc-200">
                      <h3 className="text-xs font-bold text-zinc-900 border-b border-zinc-150 pb-2 mb-4 uppercase tracking-wider">Personal details</h3>

                      <form onSubmit={handleSaveProfileInfo} className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Name</Label>
                          <Input
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            className="bg-white text-black border-zinc-200 rounded-lg text-xs"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Role / Subtitle</Label>
                          <Input
                            value={profileData.role}
                            onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                            className="bg-white text-black border-zinc-200 rounded-lg text-xs"
                            required
                          />
                        </div>

                        <div className="space-y-1.5 border-t border-zinc-100 pt-4 mt-4">
                          <Label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Profile Picture URL (Local Fallback: /profile.png)</Label>
                          <Input
                            value={profileData.profilePicURL || ""}
                            onChange={(e) => setProfileData({ ...profileData, profilePicURL: e.target.value })}
                            className="bg-white text-black border-zinc-200 rounded-lg text-xs"
                            placeholder="e.g. /profile.png or external link"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Resume PDF URL (Local Fallback: /resume.pdf)</Label>
                          <Input
                            value={profileData.resumeURL || ""}
                            onChange={(e) => setProfileData({ ...profileData, resumeURL: e.target.value })}
                            className="bg-white text-black border-zinc-200 rounded-lg text-xs"
                            placeholder="e.g. /resume.pdf or external link"
                          />
                          <p className="text-[9.5px] text-zinc-500 leading-normal mt-1">If your Firebase Storage plan is not upgraded, you can copy files to the public/ directory and reference them here directly (e.g. /profile.png).</p>
                        </div>

                        {/* Social Links Form Inputs */}
                        <div className="space-y-3 pt-4 border-t border-zinc-150 mt-6">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-zinc-700">Social Profile URLs</Label>

                          {profileData.socialLinks && profileData.socialLinks.map((link: any, index: number) => (
                            <div key={index} className="flex gap-2 items-center">
                              <span className="w-24 text-[10px] font-bold text-zinc-600 uppercase tracking-wider shrink-0">{link.platform}</span>
                              <Input
                                value={link.href}
                                onChange={(e) => {
                                  const updatedLinks = [...profileData.socialLinks];
                                  updatedLinks[index].href = e.target.value;
                                  setProfileData({ ...profileData, socialLinks: updatedLinks });
                                }}
                                className="bg-white text-black border-zinc-200 rounded-lg text-xs"
                                placeholder="https://"
                              />
                            </div>
                          ))}
                        </div>

                        <Button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs px-5 py-2 shadow-xs mt-6"
                        >
                          Save Profile Details
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Skills Panel */}
              {activeTab === "skills" && (
                <div className="space-y-4">
                  {/* Desktop Table View */}
                  <div className="hidden md:block bg-white rounded-xl shadow-xs border border-zinc-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 text-zinc-500 uppercase text-[9px] font-bold tracking-wider border-b border-zinc-200">
                            <th className="py-3.5 px-5">Skill Name</th>
                            <th className="py-3.5 px-5">Category</th>
                            <th className="py-3.5 px-5">Color Theme Class</th>
                            <th className="py-3.5 px-5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-150 text-xs">
                          {filteredSkills.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-zinc-600 font-bold uppercase tracking-wider text-[10px]">
                                No skills records found.
                              </td>
                            </tr>
                          ) : (
                            filteredSkills.map((skill, index) => (
                              <tr key={index} className="hover:bg-zinc-50/50 transition-colors">
                                <td className="py-3.5 px-5 font-bold text-zinc-900">{skill.name}</td>
                                <td className="py-3.5 px-5">
                                  <span className="text-[10px] text-zinc-700 font-bold bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                                    {skill.category}
                                  </span>
                                </td>
                                <td className="py-3.5 px-5">
                                  <span className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${skill.color}`}>
                                    {skill.name} ({skill.color})
                                  </span>
                                </td>
                                <td className="py-3.5 px-5 text-right">
                                  <div className="flex justify-end gap-1">
                                    <button
                                      onClick={() => openModal("skill", skill)}
                                      className="text-zinc-500 hover:text-blue-600 hover:bg-zinc-100 h-7.5 w-7.5 rounded-lg flex items-center justify-center transition-colors border border-zinc-100"
                                      title="Edit"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSkill(skill.name)}
                                      className="text-zinc-500 hover:text-red-600 hover:bg-red-50 h-7.5 w-7.5 rounded-lg flex items-center justify-center transition-colors border border-zinc-100"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Card-Based List View */}
                  <div className="md:hidden grid grid-cols-1 gap-3">
                    {filteredSkills.length === 0 ? (
                      <div className="bg-white p-8 text-center text-zinc-600 font-bold uppercase tracking-wider text-xs border border-zinc-200 rounded-xl">
                        No skills records found.
                      </div>
                    ) : (
                      filteredSkills.map((skill, index) => (
                        <div key={index} className="bg-white p-4 rounded-xl shadow-xs border border-zinc-200 flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-zinc-950 text-sm">{skill.name}</h4>
                              <p className="text-[10px] text-zinc-600 font-bold uppercase mt-0.5">{skill.category}</p>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => openModal("skill", skill)}
                                className="p-1.5 text-zinc-500 hover:text-blue-600 bg-zinc-50 hover:bg-blue-50 border border-zinc-200 rounded-lg"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSkill(skill.name)}
                                className="p-1.5 text-zinc-500 hover:text-red-600 bg-zinc-50 hover:bg-red-50 border border-zinc-200 rounded-lg"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <div>
                            <span className={`text-white text-[9px] font-bold px-2 py-0.5 rounded-full ${skill.color}`}>
                              Badge: {skill.color}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Experience Panel */}
              {activeTab === "experience" && (
                <div className="space-y-4">
                  {/* Desktop Table View */}
                  <div className="hidden md:block bg-white rounded-xl shadow-xs border border-zinc-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 text-zinc-500 uppercase text-[9px] font-bold tracking-wider border-b border-zinc-200">
                            <th className="py-3.5 px-5">Company</th>
                            <th className="py-3.5 px-5">Role Title</th>
                            <th className="py-3.5 px-5">Period</th>
                            <th className="py-3.5 px-5">Location</th>
                            <th className="py-3.5 px-5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-150 text-xs">
                          {filteredExperiences.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-zinc-600 font-bold uppercase tracking-wider text-[10px]">
                                No experience records found.
                              </td>
                            </tr>
                          ) : (
                            filteredExperiences.map((exp, index) => (
                              <tr key={index} className="hover:bg-zinc-50/50 transition-colors">
                                <td className="py-3.5 px-5 font-bold text-zinc-900">{exp.company}</td>
                                <td className="py-3.5 px-5 font-bold text-zinc-700">{exp.role}</td>
                                <td className="py-3.5 px-5 text-zinc-600 font-medium">{exp.period}</td>
                                <td className="py-3.5 px-5 text-zinc-600 font-medium">{exp.location}</td>
                                <td className="py-3.5 px-5 text-right">
                                  <div className="flex justify-end gap-1">
                                    <button
                                      onClick={() => openModal("experience", exp)}
                                      className="text-zinc-500 hover:text-blue-600 hover:bg-zinc-100 h-7.5 w-7.5 rounded-lg flex items-center justify-center transition-colors border border-zinc-100"
                                      title="Edit"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteExperience(exp.id)}
                                      className="text-zinc-500 hover:text-red-600 hover:bg-red-50 h-7.5 w-7.5 rounded-lg flex items-center justify-center transition-colors border border-zinc-100"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Card-Based List View */}
                  <div className="md:hidden grid grid-cols-1 gap-3">
                    {filteredExperiences.length === 0 ? (
                      <div className="bg-white p-8 text-center text-zinc-600 font-bold uppercase tracking-wider text-xs border border-zinc-200 rounded-xl">
                        No experience records found.
                      </div>
                    ) : (
                      filteredExperiences.map((exp, index) => (
                        <div key={index} className="bg-white p-4 rounded-xl shadow-xs border border-zinc-200 flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-zinc-950 text-sm">{exp.company}</h4>
                              <p className="text-xs text-zinc-700 font-bold mt-0.5">{exp.role}</p>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => openModal("experience", exp)}
                                className="p-1.5 text-zinc-500 hover:text-blue-600 bg-zinc-50 hover:bg-blue-50 border border-zinc-200 rounded-lg"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteExperience(exp.id)}
                                className="p-1.5 text-zinc-500 hover:text-red-600 bg-zinc-50 hover:bg-red-50 border border-zinc-200 rounded-lg"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="text-[10px] text-zinc-500 font-bold uppercase flex flex-wrap gap-x-3">
                            <span>📅 {exp.period}</span>
                            <span>📍 {exp.location}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: Projects Panel */}
              {activeTab === "projects" && (
                <div className="space-y-4">
                  {/* Desktop Table View */}
                  <div className="hidden md:block bg-white rounded-xl shadow-xs border border-zinc-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 text-zinc-500 uppercase text-[9px] font-bold tracking-wider border-b border-zinc-200">
                            <th className="py-3.5 px-5">Project Title</th>
                            <th className="py-3.5 px-5">Category</th>
                            <th className="py-3.5 px-5">Cover Thumbnail</th>
                            <th className="py-3.5 px-5">Tags</th>
                            <th className="py-3.5 px-5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-150 text-xs">
                          {filteredProjects.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-zinc-600 font-bold uppercase tracking-wider text-[10px]">
                                No project records found.
                              </td>
                            </tr>
                          ) : (
                            filteredProjects.map((project, index) => (
                              <tr key={index} className="hover:bg-zinc-50/50 transition-colors">
                                <td className="py-3.5 px-5 font-bold text-zinc-900">{project.title}</td>
                                <td className="py-3.5 px-5">
                                  <span className="text-[10px] text-zinc-700 font-bold bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                                    {project.category}
                                  </span>
                                </td>
                                <td className="py-3.5 px-5">
                                  <div className="relative w-14 h-8 rounded border border-zinc-150 overflow-hidden bg-zinc-50 shrink-0">
                                    <img
                                      src={project.image || "https://placehold.co/120x80?text=None"}
                                      alt="thumb"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </td>
                                <td className="py-3.5 px-5">
                                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                                    {project.tags && project.tags.map((tag: string, tagIdx: number) => (
                                      <span key={tagIdx} className="bg-zinc-100 border border-zinc-200 text-zinc-500 text-[9px] px-1 rounded font-medium">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="py-3.5 px-5 text-right">
                                  <div className="flex justify-end gap-1">
                                    <button
                                      onClick={() => openModal("project", project)}
                                      className="text-zinc-500 hover:text-blue-600 hover:bg-zinc-100 h-7.5 w-7.5 rounded-lg flex items-center justify-center transition-colors border border-zinc-100"
                                      title="Edit"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProject(project.id)}
                                      className="text-zinc-500 hover:text-red-600 hover:bg-red-50 h-7.5 w-7.5 rounded-lg flex items-center justify-center transition-colors border border-zinc-100"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Card-Based List View */}
                  <div className="md:hidden grid grid-cols-1 gap-3">
                    {filteredProjects.length === 0 ? (
                      <div className="bg-white p-8 text-center text-zinc-600 font-bold uppercase tracking-wider text-xs border border-zinc-200 rounded-xl">
                        No project records found.
                      </div>
                    ) : (
                      filteredProjects.map((project, index) => (
                        <div key={index} className="bg-white p-4 rounded-xl shadow-xs border border-zinc-200 flex flex-col gap-3">
                          <div className="flex gap-3">
                            <div className="w-16 h-12 rounded border border-zinc-150 overflow-hidden bg-zinc-50 shrink-0">
                              <img src={project.image} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-grow">
                              <h4 className="font-bold text-zinc-950 text-sm truncate">{project.title}</h4>
                              <p className="text-[9px] text-zinc-500 font-bold uppercase mt-0.5 truncate">{project.category}</p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => openModal("project", project)}
                                className="p-1.5 text-zinc-550 hover:text-blue-600 bg-zinc-50 border border-zinc-200 rounded-lg"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(project.id)}
                                className="p-1.5 text-zinc-550 hover:text-red-650 bg-zinc-50 border border-zinc-200 rounded-lg"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {project.tags.map((tag: string, tagIdx: number) => (
                              <span key={tagIdx} className="bg-zinc-150 text-zinc-600 text-[9px] px-1.5 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab 5: Leads List */}
              {activeTab === "leads" && (
                <div className="space-y-4">
                  {/* Desktop Table View */}
                  <div className="hidden md:block bg-white rounded-xl shadow-xs border border-zinc-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 text-zinc-500 uppercase text-[9px] font-bold tracking-wider border-b border-zinc-200">
                            <th className="py-3.5 px-5">Name</th>
                            <th className="py-3.5 px-5">Email</th>
                            <th className="py-3.5 px-5">Query Type</th>
                            <th className="py-3.5 px-5">Message Text (Click to open)</th>
                            <th className="py-3.5 px-5">Date</th>
                            <th className="py-3.5 px-5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 text-xs">
                          {filteredLeads.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-zinc-600 font-bold uppercase tracking-wider text-[10px]">
                                No message inquiries found.
                              </td>
                            </tr>
                          ) : (
                            filteredLeads.map((lead) => (
                              <tr
                                key={lead.id}
                                className="hover:bg-zinc-50 transition-colors cursor-pointer"
                                onClick={() => setSelectedLead(lead)}
                              >
                                <td className="py-3.5 px-5 font-bold text-zinc-900">{lead.name}</td>
                                <td className="py-3.5 px-5 font-medium text-zinc-600">{lead.email}</td>
                                <td className="py-3.5 px-5">
                                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                    {lead.purpose || "General Inquiry"}
                                  </span>
                                </td>
                                <td className="py-3.5 px-5 text-[11px] max-w-[220px] truncate text-zinc-600 font-semibold" title="Click to view detail">
                                  {lead.message}
                                </td>
                                <td className="py-3.5 px-5 text-[10px] text-zinc-500 font-medium">
                                  {new Date(lead.timestamp).toLocaleDateString()} {new Date(lead.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => handleDeleteLead(lead.id)}
                                    className="text-zinc-500 hover:text-red-600 hover:bg-red-50 h-7.5 w-7.5 rounded-lg flex items-center justify-center transition-colors border border-zinc-100"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Card-Based List View */}
                  <div className="md:hidden grid grid-cols-1 gap-3">
                    {filteredLeads.length === 0 ? (
                      <div className="bg-white p-8 text-center text-zinc-600 font-bold uppercase tracking-wider text-xs border border-zinc-200 rounded-xl">
                        No inquiries received.
                      </div>
                    ) : (
                      filteredLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className="bg-white p-4 rounded-xl shadow-xs border border-zinc-200 flex flex-col gap-3 cursor-pointer"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-zinc-950 text-sm">{lead.name}</h4>
                              <p className="text-[11px] text-zinc-600 font-medium mt-0.5">{lead.email}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLead(lead.id);
                              }}
                              className="p-1.5 text-zinc-500 hover:text-red-600 bg-zinc-50 border border-zinc-200 rounded-lg"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div>
                            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                              {lead.purpose || "General Inquiry"}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-700 bg-zinc-50 p-2.5 rounded border border-zinc-200 leading-normal line-clamp-3">
                            {lead.message}
                          </div>
                          <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                            📅 {new Date(lead.timestamp).toLocaleDateString()} at {new Date(lead.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          </main>

        </div>
      )}

      {/* Selected lead detail popup reader modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-zinc-200 w-full max-w-md overflow-hidden flex flex-col text-zinc-800">
            <header className="p-4 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-zinc-900 text-xs uppercase tracking-wider">Inquiry Query Details</h3>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-zinc-500 hover:text-zinc-700 p-1"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </header>

            <div className="p-5 space-y-4 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Sender Name</span>
                  <span className="text-xs font-bold text-zinc-900">{selectedLead.name}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Query Type</span>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100/50 inline-block mt-0.5">
                    {selectedLead.purpose || "General Inquiry"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Email Address</span>
                <a href={`mailto:${selectedLead.email}`} className="text-xs font-bold text-blue-600 hover:underline">{selectedLead.email}</a>
              </div>

              <div>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Date Received</span>
                <span className="text-xs text-zinc-600 font-medium">
                  {new Date(selectedLead.timestamp).toLocaleString()}
                </span>
              </div>

              <div className="border-t border-zinc-150 pt-3">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Message Text</span>
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs text-zinc-700 leading-relaxed max-h-[200px] overflow-y-auto select-text whitespace-pre-wrap">
                  {selectedLead.message}
                </div>
              </div>
            </div>

            <footer className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-between gap-3 shrink-0">
              <button
                onClick={() => {
                  handleDeleteLead(selectedLead.id);
                  setSelectedLead(null);
                }}
                className="bg-red-50 text-red-650 border border-red-150 rounded-lg hover:bg-red-100/50 px-3.5 py-1.5 text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(`mailto:${selectedLead.email}?subject=Reply to inquiry: ${selectedLead.purpose}`, '_blank')}
                  className="bg-blue-600 text-white rounded-lg hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                >
                  <Mail className="h-3.5 w-3.5 text-white" /> Reply
                </button>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="bg-white text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 px-3.5 py-1.5 text-xs font-bold shadow-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* CRUD Add/Edit Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-zinc-200 w-full max-w-lg overflow-hidden flex flex-col">
            <header className="p-4 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center">
              <h3 className="font-bold text-zinc-900 text-xs uppercase tracking-wider">
                {editItem ? "Edit Record Entry" : "Add New Record Entry"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 text-xs font-bold"
              >
                Close
              </button>
            </header>

            <div className="p-5 overflow-y-auto max-h-[75vh]">
              {/* Skill Fields Form */}
              {modalType === "skill" && (
                <form onSubmit={handleSkillSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Skill Name</Label>
                    <Input
                      placeholder="e.g. Kotlin"
                      value={skillInput.name}
                      onChange={(e) => setSkillInput({ ...skillInput, name: e.target.value })}
                      className="bg-white text-black border-zinc-200 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Category</Label>
                    {skillCategoryMode === "select" ? (
                      <select
                        value={skillInput.category}
                        onChange={(e) => handleSkillCategorySelectChange(e.target.value)}
                        className="w-full bg-white text-black border border-zinc-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800"
                      >
                        <option value="">Select Category</option>
                        {Array.from(new Set(skillsList.map(s => s.category))).map((c, i) => (
                          <option key={i} value={c}>{c}</option>
                        ))}
                        <option value="__custom__">Add new category...</option>
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type custom category name..."
                          value={skillInput.category}
                          onChange={(e) => setSkillInput({ ...skillInput, category: e.target.value })}
                          className="bg-white text-black border-zinc-200 rounded-lg text-xs"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSkillCategoryMode("select");
                            setSkillInput({ ...skillInput, category: "" });
                          }}
                          className="text-xs text-zinc-700 font-bold border border-zinc-200 rounded-lg px-3 py-1.5 h-auto bg-zinc-50 hover:bg-zinc-150 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Badge Theme Color (Tailwind BG Class)</Label>
                    <Input
                      placeholder="e.g. bg-violet-500"
                      value={skillInput.color}
                      onChange={(e) => setSkillInput({ ...skillInput, color: e.target.value })}
                      className="bg-white text-black border-zinc-200 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs py-2.5 mt-2">
                    Save Skill
                  </Button>
                </form>
              )}

              {/* Experience Fields Form */}
              {modalType === "experience" && (
                <form onSubmit={handleExperienceSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Role Title</Label>
                    <Input
                      placeholder="e.g. Generative AI Intern"
                      value={expInput.role}
                      onChange={(e) => setExpInput({ ...expInput, role: e.target.value })}
                      className="bg-white text-black border-zinc-200 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Company Name</Label>
                    <Input
                      placeholder="e.g. Knowledge Excel Private Limited"
                      value={expInput.company}
                      onChange={(e) => setExpInput({ ...expInput, company: e.target.value })}
                      className="bg-white text-black border-zinc-200 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Location</Label>
                    <Input
                      placeholder="e.g. Delhi, India"
                      value={expInput.location}
                      onChange={(e) => setExpInput({ ...expInput, location: e.target.value })}
                      className="bg-white text-black border-zinc-200 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Period Duration</Label>
                    <Input
                      placeholder="e.g. Feb 2026 - May 2026"
                      value={expInput.period}
                      onChange={(e) => setExpInput({ ...expInput, period: e.target.value })}
                      className="bg-white text-black border-zinc-200 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Bullet Points Description (One line per bullet)</Label>
                    <Textarea
                      placeholder="Bullet point item 1&#10;Bullet point item 2&#10;Bullet point item 3"
                      value={expInput.description}
                      onChange={(e) => setExpInput({ ...expInput, description: e.target.value })}
                      className="bg-white text-black border-zinc-200 rounded-lg text-xs h-28"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Company Project Website Link (Optional)</Label>
                    <Input
                      placeholder="https://"
                      value={expInput.projectUrl}
                      onChange={(e) => setExpInput({ ...expInput, projectUrl: e.target.value })}
                      className="bg-white text-black border-zinc-200 rounded-lg text-xs"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs py-2.5 mt-2">
                    Save Experience Record
                  </Button>
                </form>
              )}

              {/* Project Fields Form */}
              {modalType === "project" && (
                <form onSubmit={handleProjectSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Project Title</Label>
                    <Input
                      placeholder="e.g. Spotify Clone"
                      value={projectInput.title}
                      onChange={(e) => setProjectInput({ ...projectInput, title: e.target.value })}
                      className="bg-white text-black border-zinc-200 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Description</Label>
                    <Textarea
                      placeholder="Describe the project parameters..."
                      value={projectInput.description}
                      onChange={(e) => setProjectInput({ ...projectInput, description: e.target.value })}
                      className="bg-white text-black border-zinc-200 rounded-lg text-xs h-16"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Category</Label>
                    {projectCategoryMode === "select" ? (
                      <select
                        value={projectInput.category}
                        onChange={(e) => handleProjectCategorySelectChange(e.target.value)}
                        className="w-full bg-white text-black border border-zinc-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800"
                      >
                        <option value="">Select Category</option>
                        {Array.from(new Set(projectsList.map(p => p.category))).map((c, i) => (
                          <option key={i} value={c}>{c}</option>
                        ))}
                        <option value="__custom__">Add new category...</option>
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type custom category name..."
                          value={projectInput.category}
                          onChange={(e) => setProjectInput({ ...projectInput, category: e.target.value })}
                          className="bg-white text-black border-zinc-200 rounded-lg text-xs"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setProjectCategoryMode("select");
                            setProjectInput({ ...projectInput, category: "" });
                          }}
                          className="text-xs text-zinc-700 font-bold border border-zinc-200 rounded-lg px-3 py-1.5 h-auto bg-zinc-50 hover:bg-zinc-150 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Tags (Comma-separated list)</Label>
                    <Input
                      placeholder="Next.js, Tailwind CSS, TypeScript"
                      value={projectInput.tags}
                      onChange={(e) => setProjectInput({ ...projectInput, tags: e.target.value })}
                      className="bg-white text-black border-zinc-200 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Project Image URL</Label>
                    <Input
                      placeholder="e.g. /Projectsassets/portfolio.png"
                      value={projectInput.image}
                      onChange={(e) => setProjectInput({ ...projectInput, image: e.target.value })}
                      className="bg-white text-black border-zinc-200 rounded-lg text-xs"
                      required
                    />
                    <p className="text-[9px] text-zinc-550 leading-none">Paste the relative path (e.g. /Projectsassets/portfolio.png) or any absolute HTTPS link.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">GitHub Link</Label>
                    <Input
                      placeholder="https://github.com/..."
                      value={projectInput.githubLink}
                      onChange={(e) => setProjectInput({ ...projectInput, githubLink: e.target.value })}
                      className="bg-white text-black border-zinc-200 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Live Preview Link</Label>
                    <Input
                      placeholder="https://..."
                      value={projectInput.liveLink}
                      onChange={(e) => setProjectInput({ ...projectInput, liveLink: e.target.value })}
                      className="bg-white text-black border-zinc-200 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs py-2.5 mt-2"
                    disabled={uploadingPic}
                  >
                    {uploadingPic ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Project"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

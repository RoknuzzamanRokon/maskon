"use client";
import type { CSSProperties } from "react";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle,
  Code,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Monitor,
  Palette,
  Phone,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Manrope, Space_Grotesk } from "next/font/google";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RokonPortfolio() {
  const themeVars = {
    "--ink": "#0f172a",
    "--accent": "#0ea5a4",
    "--accent-strong": "#0f766e",
    "--sand": "#f6f4ee",
    "--mist": "#edf6f5",
  } as CSSProperties;

  const rokonData = {
    name: "Md Roknuzzaman Rokon",
    title: "Lead Full Stack Developer & Data Engineer",
    tagline: "Crafting digital systems that are fast, elegant, and reliable.",
    bio: "Full-stack developer with 6+ years of experience building high-performance web products. I focus on React ecosystems, Python services, and data-driven delivery, translating complex requirements into delightful user experiences.",
    location: "Dhaka, Bangladesh",
    email: "rokon.raz@gmail.com",
    phone: "+880 1739-933258",
    linkedin: "https://www.linkedin.com/in/rokon-raz/",
    github: "https://github.com/RoknuzzamanRokon",
    website: "https://rokonraz.dev",
    avatar: "/team/rokon.jpg",
    experience: "6+ Years",
    projectsCompleted: "48+",
    clientsSatisfied: "32+",
  };

  const skillCategories = [
    {
      category: "Frontend Development",
      icon: Monitor,
      tone: {
        chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
        icon: "text-emerald-700 dark:text-emerald-300",
        bar: "from-emerald-500 to-teal-500",
        track: "bg-emerald-100/70 dark:bg-emerald-900/20",
      },
      skills: [
        { name: "React.js", level: 95, experience: "4 years" },
        { name: "Next.js", level: 90, experience: "2 years" },
        { name: "TypeScript", level: 88, experience: "2 years" },
        { name: "Tailwind CSS", level: 92, experience: "2 years" },
        { name: "JavaScript", level: 94, experience: "4 years" },
        { name: "HTML5/CSS3", level: 96, experience: "5 years" },
      ],
    },
    {
      category: "Backend Development",
      icon: Code,
      tone: {
        chip: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
        icon: "text-amber-700 dark:text-amber-300",
        bar: "from-amber-500 to-orange-500",
        track: "bg-amber-100/70 dark:bg-amber-900/20",
      },
      skills: [
        { name: "Python", level: 90, experience: "6 years" },
        { name: "FastAPI", level: 85, experience: "3 years" },
        { name: "Node.js", level: 80, experience: "2 years" },
        { name: "PostgreSQL", level: 82, experience: "3 years" },
        { name: "MySQL", level: 85, experience: "4 years" },
        { name: "REST APIs", level: 90, experience: "3 years" },
      ],
    },
    {
      category: "Design & Tools",
      icon: Palette,
      tone: {
        chip: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
        icon: "text-slate-700 dark:text-slate-300",
        bar: "from-slate-500 to-slate-700",
        track: "bg-slate-200/70 dark:bg-slate-800/60",
      },
      skills: [
        { name: "Figma", level: 88, experience: "1 year" },
        { name: "UI/UX Design", level: 85, experience: "1 year" },
        { name: "Adobe XD", level: 75, experience: "0.5 year" },
        { name: "Photoshop", level: 70, experience: "2 years" },
        { name: "Framer Motion", level: 80, experience: "2 years" },
        { name: "Responsive Design", level: 92, experience: "2 years" },
      ],
    },
  ];

  const featuredProjects = [
    {
      id: 3,
      title: "Hotel Integration Technologies",
      description:
        "FastAPI service for hotel management, provider mappings, and intelligent data normalization with performance-focused queries.",
      image: "/projects/hita_tech.png",
      technologies: ["FastAPI", "React", "Tailwind", "MySQL", "Contabo"],
      liveUrl: "https://portfolio-builder.com",
      githubUrl: "https://github.com/RoknuzzamanRokon/HITA-with-FASTapi",
      category: "SaaS",
      year: "2024",
      status: "In Progress",
      features: [
        "Hotel mapping API service",
        "Unique hotel matching",
        "B2B & B2C content feeds",
        "ML-powered mapping",
        "AI verification",
        "API-first onboarding",
      ],
    },
    {
      id: 2,
      title: "Story Teller AI",
      description:
        "AI story generation platform with real-time prompts, notifications, and desktop-ready distribution.",
      image: "/projects/storyteller.png",
      technologies: ["Python", "AWS", "MySQL"],
      liveUrl: "https://taskmanager-demo.com",
      githubUrl: "https://github.com/RoknuzzamanRokon/storytellerai",
      category: "Web App",
      year: "2024",
      status: "Completed",
      features: [
        "Real-time story generator",
        "Long-form story output",
        "Unlimited prompts",
        "Notification system",
        "Mobile responsive",
        "Desktop app build",
      ],
    },
    {
      id: 1,
      title: "E-Commerce Platform",
      description:
        "Full-stack commerce suite with payment integration, inventory automation, and admin analytics.",
      image: "/projects/ecommerce.png",
      technologies: [
        "React",
        "Next.js",
        "Python",
        "FastAPI",
        "PostgreSQL",
        "Stripe",
      ],
      liveUrl: "https://ecommerce-demo.com",
      githubUrl:
        "https://github.com/RoknuzzamanRokon/ursam_roko_ecomarce_shop?tab=readme-ov-file",
      category: "Full Stack",
      year: "2024",
      status: "Completed",
      features: [
        "User authentication",
        "Payment gateway integration",
        "Inventory automation",
        "Admin dashboard",
        "Responsive UI",
        "SEO-ready pages",
      ],
    },
  ];

  const achievements = [
    {
      title: "AWS Certified Developer",
      issuer: "Amazon Web Services",
      date: "2023",
      icon: Award,
    },
    {
      title: "React Advanced Certification",
      issuer: "Self-guided",
      date: "2022",
      icon: Code,
    },
    {
      title: "Python 100 Days Challenge",
      issuer: "Dr. Angela Yu",
      date: "2022",
      icon: Code,
    },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  return (
    <div
      className={`${bodyFont.className} min-h-screen bg-[color:var(--sand)] text-[color:var(--ink)] dark:bg-slate-950 dark:text-slate-100`}
      style={themeVars}
    >
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 right-0 h-72 w-72 rounded-full bg-[color:var(--mist)] dark:bg-emerald-900/20 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-emerald-100/60 dark:bg-slate-800/40 blur-3xl" />
        </div>

        <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <motion.div
            className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                Available for projects
              </div>
              <h1
                className={`${headingFont.className} mt-6 text-4xl font-semibold leading-tight text-slate-900 dark:text-slate-100 md:text-5xl`}
              >
                {rokonData.name}
              </h1>
              <p className="mt-3 text-lg font-semibold text-[color:var(--accent-strong)]">
                {rokonData.title}
              </p>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-300">
                {rokonData.tagline}
              </p>

              <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <MapPin className="h-4 w-4" />
                  {rokonData.location}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <Mail className="h-4 w-4" />
                  {rokonData.email}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <Phone className="h-4 w-4" />
                  {rokonData.phone}
                </span>
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <motion.a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[color:var(--accent)] px-6 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-[color:var(--accent-strong)]"
                  whileHover={{ y: -2 }}
                >
                  <Mail className="h-5 w-5" />
                  Start a Project
                </motion.a>
              <motion.a
                href="/resume-rokon.pdf"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-base font-semibold text-slate-800 shadow-lg transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                whileHover={{ y: -2 }}
              >
                <ExternalLink className="h-5 w-5" />
                Download Resume
              </motion.a>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-6">
                  <div className="relative h-28 w-28 overflow-hidden rounded-2xl">
                    <Image
                      src={rokonData.avatar}
                      alt={rokonData.name}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className={`${headingFont.className} text-2xl font-semibold`}>
                      {rokonData.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {rokonData.website}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                      <CheckCircle className="h-3 w-3" />
                      Trusted by 30+ clients
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {rokonData.bio}
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      label: "Experience",
                      value: rokonData.experience,
                    },
                    {
                      label: "Projects",
                      value: rokonData.projectsCompleted,
                    },
                    {
                      label: "Happy Clients",
                      value: rokonData.clientsSatisfied,
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-slate-200 bg-[color:var(--mist)] px-4 py-4 text-center dark:border-slate-800 dark:bg-slate-800/60"
                    >
                      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {stat.value}
                      </p>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <motion.div
          className="grid gap-10 lg:grid-cols-[0.4fr_0.6fr] lg:items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              Craft & Focus
            </div>
            <h2
              className={`${headingFont.className} mt-6 text-3xl font-semibold text-slate-900 dark:text-slate-100 md:text-4xl`}
            >
              Building experiences that feel effortless
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
              I blend product strategy with engineering to ship reliable software
              systems. From architecture to UI polish, I focus on outcomes that
              help teams scale.
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg md:grid-cols-2 dark:border-slate-800 dark:bg-slate-900"
          >
            {[
              {
                title: "Product-led Development",
                description: "Strategy-driven builds with measurable impact.",
                icon: Briefcase,
              },
              {
                title: "Data-ready Architecture",
                description: "Reliable, clean, and scalable backend systems.",
                icon: Code,
              },
              {
                title: "Design-conscious UI",
                description: "Interfaces that feel refined and consistent.",
                icon: Monitor,
              },
              {
                title: "Collaboration",
                description: "Clear communication and fast iteration loops.",
                icon: BookOpen,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-100 bg-[color:var(--mist)] p-4 dark:border-slate-800 dark:bg-slate-800/60"
              >
                <item.icon className="h-5 w-5 text-[color:var(--accent-strong)]" />
                <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {item.description}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <section className="bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2
              className={`${headingFont.className} text-3xl font-semibold text-slate-900 dark:text-slate-100 md:text-4xl`}
            >
              Technical Expertise
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
              Balanced skills across product engineering, backend, and design.
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {skillCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                className="rounded-3xl border border-slate-200 bg-[color:var(--sand)] p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: categoryIndex * 0.15 }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${category.tone.chip}`}
                  >
                    <category.icon className={`h-5 w-5 ${category.tone.icon}`} />
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {category.category}
                  </h3>
                </div>
                <div className="mt-6 space-y-4">
                  {category.skills.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-800 dark:text-slate-100">
                          {skill.name}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {skill.experience}
                        </span>
                      </div>
                      <div
                        className={`mt-2 h-2 w-full rounded-full ${category.tone.track}`}
                      >
                        <motion.div
                          className={`h-2 rounded-full bg-gradient-to-r ${category.tone.bar}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
            <h2
              className={`${headingFont.className} text-3xl font-semibold text-slate-900 dark:text-slate-100 md:text-4xl`}
            >
              Featured Projects
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
              A selection of delivery-focused builds and product launches.
            </p>
          </motion.div>

        <div className="space-y-12">
          {featuredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg lg:grid-cols-[1.2fr_1fr] dark:border-slate-800 dark:bg-slate-900"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
            >
              <div className="relative h-60 overflow-hidden rounded-2xl">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
                  <Calendar className="h-3 w-3" />
                  {project.year}
                </div>
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    <span>{project.category}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-400 dark:bg-slate-500" />
                    <span>{project.status}</span>
                  </div>
                  <h3
                    className={`${headingFont.className} mt-4 text-2xl font-semibold text-slate-900 dark:text-slate-100`}
                  >
                    {project.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {project.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-slate-200 bg-[color:var(--mist)] px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <ul className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                    {project.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 flex flex-wrap gap-4">
                  <motion.a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[color:var(--accent-strong)]"
                    whileHover={{ y: -2 }}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Live Demo
                  </motion.a>
                  <motion.a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    whileHover={{ y: -2 }}
                  >
                    <Github className="h-4 w-4" />
                    Source Code
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2
              className={`${headingFont.className} text-3xl font-semibold text-slate-900 dark:text-slate-100 md:text-4xl`}
            >
              Achievements & Certifications
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
              Continuous learning with industry-recognized credentials.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.title}
                className="rounded-2xl border border-slate-200 bg-[color:var(--sand)] p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <achievement.icon className="h-6 w-6 text-[color:var(--accent-strong)]" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {achievement.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {achievement.issuer}
                </p>
                <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-300">
                  <Calendar className="h-3 w-3" />
                  {achievement.date}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="scroll-mt-24 bg-[color:var(--mist)] dark:bg-slate-900"
      >
        <div className="mx-auto max-w-5xl px-4 py-16">
          <motion.div
            className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl md:p-12 dark:border-slate-800 dark:bg-slate-950"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2
              className={`${headingFont.className} text-3xl font-semibold text-slate-900 dark:text-slate-100 md:text-4xl`}
            >
              Let’s build something exceptional
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
              Share your vision and I will help turn it into a high-performing
              product.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <motion.a
                href={`mailto:${rokonData.email}`}
                className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--accent)] px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-[color:var(--accent-strong)]"
                whileHover={{ y: -2 }}
              >
                <Mail className="h-4 w-4" />
                Send Email
              </motion.a>
              <motion.a
                href={rokonData.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-700 shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                whileHover={{ y: -2 }}
              >
                <Linkedin className="h-4 w-4" />
                Connect on LinkedIn
              </motion.a>
              <motion.a
                href={`tel:${rokonData.phone}`}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm font-semibold text-emerald-700 shadow-lg dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                whileHover={{ y: -2 }}
              >
                <Phone className="h-4 w-4" />
                Call Me
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

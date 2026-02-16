"use client";
import type { CSSProperties } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Code,
  Zap,
  Users,
  Award,
  Download,
  Eye,
  Heart,
  MessageCircle,
  Briefcase,
  Target,
  Lightbulb,
  Rocket,
  CheckCircle,
  Globe,
  Coffee,
  BookOpen,
  Cpu,
  Database,
  Palette,
  Monitor,
  PenTool,
  Camera,
  Megaphone,
  TrendingUp,
  BarChart3,
  Edit3,
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Manrope, Space_Grotesk } from "next/font/google";
import BackButton from "../../components/BackButton";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function MasrufaPortfolio() {
  const themeVars = {
    "--ink": "#0f172a",
    "--accent": "#0ea5a4",
    "--accent-strong": "#0f766e",
    "--sand": "#f6f4ee",
    "--mist": "#edf6f5",
  } as CSSProperties;
  // Masrufa's detailed information
  const masrufaData = {
    name: "Masrufa Sarkar",
    title: "Creative Content Strategist & Digital Marketing Specialist",
    tagline: "Transforming Ideas into Compelling Digital Stories",
    bio: "Creative content strategist with 4+ years of experience in digital marketing, content creation, and brand storytelling. I specialize in creating engaging content that drives audience engagement and business growth through strategic storytelling and data-driven insights.",
    location: "Dhaka, Bangladesh",
    email: "masrufa.sarkar896@gmail.com",
    phone: "+880 1987-654321",
    linkedin: "https://www.linkedin.com/in/masrufa-sarkar/",
    github: "https://github.com/masrufa-sarkar",
    website: "https://masrufasarkar.com",
    avatar: "/team/masrufa.jpg",
    experience: "4+ Years",
    projectsCompleted: "65+",
    clientsSatisfied: "28+",
    contentCreated: "500+",
  };

  // Skills with proficiency levels
  const skillCategories = [
    {
      category: "Content Strategy",
      icon: Edit3,
      color: "purple",
      skills: [
        { name: "Content Planning", level: 95, experience: "4 years" },
        { name: "Brand Storytelling", level: 92, experience: "4 years" },
        { name: "Editorial Calendar", level: 88, experience: "3 years" },
        { name: "Content Optimization", level: 90, experience: "3 years" },
        { name: "Copywriting", level: 94, experience: "4 years" },
        { name: "Content Auditing", level: 85, experience: "2 years" },
      ],
    },
    {
      category: "Digital Marketing",
      icon: Megaphone,
      color: "blue",
      skills: [
        { name: "Social Media Marketing", level: 93, experience: "4 years" },
        { name: "SEO Strategy", level: 87, experience: "3 years" },
        { name: "Email Marketing", level: 85, experience: "3 years" },
        { name: "PPC Campaigns", level: 80, experience: "2 years" },
        { name: "Influencer Marketing", level: 88, experience: "3 years" },
        { name: "Marketing Automation", level: 82, experience: "2 years" },
      ],
    },
    {
      category: "Analytics & Tools",
      icon: BarChart3,
      color: "green",
      skills: [
        { name: "Google Analytics", level: 90, experience: "3 years" },
        { name: "Social Media Analytics", level: 92, experience: "4 years" },
        { name: "Content Performance", level: 88, experience: "3 years" },
        { name: "A/B Testing", level: 85, experience: "2 years" },
        { name: "Canva Pro", level: 95, experience: "4 years" },
        { name: "Adobe Creative Suite", level: 78, experience: "2 years" },
      ],
    },
  ];

  // Featured projects/campaigns
  const featuredProjects = [
    {
      id: 1,
      title: "E-Commerce Brand Revival Campaign",
      description:
        "Complete brand transformation and content strategy for a struggling e-commerce business, resulting in 300% increase in engagement and 150% boost in sales within 6 months.",
      image: "/projects/brand-revival.jpg",
      technologies: [
        "Content Strategy",
        "Social Media",
        "SEO",
        "Email Marketing",
        "Analytics",
      ],
      liveUrl: "https://brandrevival-case-study.com",
      category: "Brand Strategy",
      year: "2024",
      status: "Completed",
      results: [
        "300% increase in social media engagement",
        "150% boost in online sales",
        "200% growth in email subscribers",
        "85% improvement in brand awareness",
        "40% increase in customer retention",
        "250% growth in organic traffic",
      ],
      metrics: {
        engagement: "+300%",
        sales: "+150%",
        traffic: "+250%",
        retention: "+40%",
      },
    },
    {
      id: 2,
      title: "Tech Startup Content Ecosystem",
      description:
        "Developed comprehensive content strategy and marketing funnel for a B2B SaaS startup, creating thought leadership content that generated 500+ qualified leads.",
      image: "/projects/saas-content.jpg",
      technologies: [
        "B2B Marketing",
        "Lead Generation",
        "Content Marketing",
        "LinkedIn Strategy",
      ],
      liveUrl: "https://saas-content-case.com",
      category: "B2B Marketing",
      year: "2023",
      status: "Completed",
      results: [
        "500+ qualified leads generated",
        "180% increase in website traffic",
        "95% improvement in lead quality",
        "220% growth in LinkedIn followers",
        "60% increase in demo requests",
        "140% boost in content engagement",
      ],
      metrics: {
        leads: "500+",
        traffic: "+180%",
        quality: "+95%",
        demos: "+60%",
      },
    },
    {
      id: 3,
      title: "Multi-Platform Influencer Campaign",
      description:
        "Orchestrated a cross-platform influencer marketing campaign for a lifestyle brand, managing 50+ influencers and achieving viral reach of 2M+ impressions.",
      image: "/projects/influencer-campaign.jpg",
      technologies: [
        "Influencer Marketing",
        "Campaign Management",
        "Analytics",
        "Brand Partnerships",
      ],
      liveUrl: "https://influencer-campaign-study.com",
      category: "Influencer Marketing",
      year: "2024",
      status: "Completed",
      results: [
        "2M+ total impressions achieved",
        "50+ influencers managed",
        "400% increase in brand mentions",
        "180% growth in follower base",
        "250% boost in user-generated content",
        "320% increase in brand hashtag usage",
      ],
      metrics: {
        impressions: "2M+",
        influencers: "50+",
        mentions: "+400%",
        ugc: "+250%",
      },
    },
  ];

  // Achievements and certifications
  const achievements = [
    {
      title: "Google Analytics Certified",
      issuer: "Google",
      date: "2023",
      icon: BarChart3,
      color: "blue",
    },
    {
      title: "Content Marketing Certification",
      issuer: "HubSpot",
      date: "2022",
      icon: Edit3,
      color: "purple",
    },
    {
      title: "Social Media Marketing Expert",
      issuer: "Facebook Blueprint",
      date: "2023",
      icon: Megaphone,
      color: "blue",
    },
    {
      title: "Best Content Creator Award",
      issuer: "Digital Marketing Summit 2023",
      date: "2023",
      icon: Award,
      color: "yellow",
    },
  ];

  // Client testimonials
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechFlow Solutions",
      content:
        "Masrufa transformed our content strategy completely. Her creative approach and data-driven insights helped us achieve unprecedented engagement rates.",
      rating: 5,
    },
    {
      name: "Ahmed Rahman",
      role: "CEO",
      company: "GreenLife Organics",
      content:
        "Working with Masrufa was a game-changer for our brand. She understood our vision and created content that truly resonated with our audience.",
      rating: 5,
    },
  ];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" as const },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  return (
    <div
      className={`${bodyFont.className} relative min-h-screen bg-[color:var(--sand)] text-[color:var(--ink)] dark:bg-slate-950 dark:text-slate-100`}
      style={themeVars}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 right-0 h-72 w-72 rounded-full bg-[color:var(--mist)] dark:bg-emerald-900/20 blur-3xl" />
        <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-emerald-100/60 dark:bg-slate-800/40 blur-3xl" />
      </div>
      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="mb-8">
          <BackButton className="inline-flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium group transition-all duration-300">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm uppercase tracking-[0.2em]">
              Back to Portfolio
            </span>
          </BackButton>
        </div>
        <div className="max-w-6xl mx-auto">
            <motion.div
              className="grid lg:grid-cols-2 gap-12 items-center"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* Profile Info */}
              <motion.div variants={fadeInUp}>
                <div className="text-center lg:text-left">
                  {/* Profile Image */}
                  <div className="relative w-48 h-48 mx-auto lg:mx-0 mb-8">
                    <div className="w-full h-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-2xl">
                      <span className="text-6xl font-semibold text-slate-800 dark:text-slate-100">
                        {masrufaData.name.charAt(0)}
                      </span>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-[color:var(--accent)] rounded-2xl flex items-center justify-center shadow-lg">
                      <PenTool className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Name and Title */}
                  <h1
                    className={`${headingFont.className} text-4xl md:text-5xl font-semibold text-slate-900 dark:text-slate-100 mb-4`}
                  >
                    {masrufaData.name}
                  </h1>
                  <h2 className="text-xl md:text-2xl text-[color:var(--accent-strong)] font-semibold mb-4">
                    {masrufaData.title}
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 italic">
                    "{masrufaData.tagline}"
                  </p>

                  {/* Contact Info */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8 text-sm text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <MapPin className="h-4 w-4" />
                      {masrufaData.location}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <Mail className="h-4 w-4" />
                      {masrufaData.email}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <Phone className="h-4 w-4" />
                      {masrufaData.phone}
                    </span>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <motion.a
                      href="#contact"
                      className="px-8 py-4 bg-[color:var(--accent)] text-white font-semibold rounded-2xl shadow-lg hover:bg-[color:var(--accent-strong)] transition-all duration-300 flex items-center justify-center"
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Hire Me
                    </motion.a>
                    <motion.a
                      href="/resume-masrufa.pdf"
                      className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Portfolio
                    </motion.a>
                  </div>
                </div>
              </motion.div>

              {/* Stats and Quick Info */}
              <motion.div variants={fadeInUp}>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {[
                    {
                      label: "Experience",
                      value: masrufaData.experience,
                      icon: Briefcase,
                      color: "purple",
                    },
                    {
                      label: "Projects",
                      value: masrufaData.projectsCompleted,
                      icon: Target,
                      color: "pink",
                    },
                    {
                      label: "Happy Clients",
                      value: masrufaData.clientsSatisfied,
                      icon: Users,
                      color: "indigo",
                    },
                    {
                      label: "Content Created",
                      value: masrufaData.contentCreated,
                      icon: Edit3,
                      color: "blue",
                    },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center border border-slate-200 dark:border-slate-800"
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <div
                        className="w-12 h-12 mx-auto mb-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center"
                      >
                        <stat.icon className="w-6 h-6 text-[color:var(--accent-strong)]" />
                      </div>
                      <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Bio */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800">
                  <h3
                    className={`${headingFont.className} text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center`}
                  >
                    <BookOpen className="w-5 h-5 mr-2 text-[color:var(--accent-strong)]" />
                    About Me
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {masrufaData.bio}
                  </p>
                </div>
              </motion.div>
            </motion.div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-16 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2
              className={`${headingFont.className} text-3xl md:text-4xl font-semibold text-slate-900 dark:text-slate-100 mb-6`}
            >
              Creative Expertise
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Comprehensive skill set in content strategy, digital marketing,
              and brand storytelling
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {skillCategories.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200 dark:border-slate-800"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: categoryIndex * 0.2 }}
                whileHover={{ y: -10 }}
              >
                {/* Category Header */}
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-slate-900 dark:bg-slate-800 rounded-2xl flex items-center justify-center mr-4">
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {category.category}
                  </h3>
                </div>

                {/* Skills List */}
                <div className="space-y-4">
                  {category.skills.map((skill, skillIndex) => (
                    <div key={skillIndex} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {skill.name}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {skill.experience}
                          </span>
                          <span className="text-sm font-semibold text-[color:var(--accent-strong)]">
                            {skill.level}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                        <motion.div
                          className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 1,
                            delay: skillIndex * 0.1,
                          }}
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
      {/* Featured Projects Section */}
      <section className="py-16 bg-[color:var(--mist)] dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2
              className={`${headingFont.className} text-3xl md:text-4xl font-semibold text-slate-900 dark:text-slate-100 mb-6`}
            >
              Featured Campaigns
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Showcasing successful campaigns and content strategies that
              delivered exceptional results
            </p>
          </motion.div>

          <div className="space-y-16">
            {featuredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:grid-flow-col-dense" : ""
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                  {/* Project Metrics & Visual */}
                  <div className={`${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                    <motion.div
                      className="relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl p-8 border border-slate-200 dark:border-slate-800"
                      whileHover={{ scale: 1.02 }}
                    >
                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {Object.entries(project.metrics).map(
                          ([key, value], metricIndex) => (
                            <div
                              key={metricIndex}
                              className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center"
                            >
                              <div className="text-2xl font-semibold text-[color:var(--accent-strong)] mb-1">
                                {value}
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-300 capitalize">
                                {key}
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      {/* Project Status Badge */}
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            project.status === "Completed"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>

                      {/* Campaign Icon */}
                      <div className="flex justify-center">
                        <div className="w-20 h-20 bg-[color:var(--accent)] rounded-2xl flex items-center justify-center">
                          <TrendingUp className="w-10 h-10 text-white" />
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Project Details */}
                  <div
                    className={`${
                      index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""
                    }`}
                  >
                    <div className="space-y-6">
                      {/* Project Header */}
                      <div>
                        <div className="flex items-center space-x-4 mb-4">
                          <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200 px-3 py-1 rounded-lg text-sm font-medium">
                            {project.category}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 text-sm">
                            {project.year}
                          </span>
                        </div>
                        <h3
                          className={`${headingFont.className} text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-4`}
                        >
                          {project.title}
                        </h3>
                        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      {/* Technologies/Skills Used */}
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                          Skills & Tools Applied:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl text-sm font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Key Results */}
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                          Key Results Achieved:
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {project.results.map((result, resultIndex) => (
                            <li
                              key={resultIndex}
                              className="flex items-center text-slate-600 dark:text-slate-300"
                            >
                              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-300 mr-2 flex-shrink-0" />
                              <span className="text-sm">{result}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Project Link */}
                      <div className="pt-4">
                        <motion.a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 bg-[color:var(--accent)] text-white font-semibold rounded-xl shadow-lg hover:bg-[color:var(--accent-strong)] transition-all duration-300 flex items-center inline-flex"
                          whileHover={{ scale: 1.05, y: -2 }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Case Study
                        </motion.a>
                      </div>
                    </div>
                  </div>
                </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2
              className={`${headingFont.className} text-3xl md:text-4xl font-semibold text-slate-900 dark:text-slate-100 mb-6`}
            >
              Client Testimonials
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              What clients say about working with me
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200 dark:border-slate-800"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
              >
                  {/* Rating Stars */}
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className="w-5 h-5 text-amber-400 fill-current"
                      />
                    ))}
                  </div>

                  {/* Testimonial Content */}
                  <blockquote className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed italic">
                    "{testimonial.content}"
                  </blockquote>

                  {/* Client Info */}
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mr-4">
                      <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 bg-[color:var(--mist)] dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2
              className={`${headingFont.className} text-3xl md:text-4xl font-semibold text-slate-900 dark:text-slate-100 mb-6`}
            >
              Achievements & Certifications
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Recognition and continuous learning in digital marketing and
              content strategy
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200 dark:border-slate-800"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                  <div className="flex items-start">
                    <div
                      className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mr-4 flex-shrink-0"
                    >
                      <achievement.icon className="w-6 h-6 text-[color:var(--accent-strong)]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        {achievement.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-2">
                        {achievement.issuer}
                      </p>
                      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                        <Calendar className="w-4 h-4 mr-1" />
                        {achievement.date}
                      </div>
                    </div>
                  </div>
                </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-16 bg-[color:var(--mist)] dark:bg-slate-900"
      >
        <div className="mx-auto max-w-5xl px-4">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2
                className={`${headingFont.className} text-3xl md:text-4xl font-semibold text-slate-900 dark:text-slate-100 mb-6`}
              >
                Let’s build something exceptional
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
                Ready to elevate your brand with compelling content and
                strategic marketing? Let's discuss your project and create
                something amazing.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <motion.a
                  href={`mailto:${masrufaData.email}`}
                  className="px-8 py-4 bg-[color:var(--accent)] text-white font-semibold rounded-2xl shadow-lg hover:bg-[color:var(--accent-strong)] transition-all duration-300 flex items-center"
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Send Email
                </motion.a>

                <motion.a
                  href={masrufaData.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <Linkedin className="w-5 h-5 mr-2" />
                  Connect on LinkedIn
                </motion.a>

                <motion.a
                  href={`tel:${masrufaData.phone}`}
                  className="px-8 py-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200 font-semibold rounded-2xl border border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Me
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

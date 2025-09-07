"use client";
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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function RokonPortfolio() {
  // Rokon's detailed information
  const rokonData = {
    name: "Md Roknuzzaman Rokon",
    title: "Lead Full Stack Developer & Data Engineer",
    tagline: "Crafting Digital Excellence Through Code & Design",
    bio: "Passionate full-stack developer with 6+ years of experience in creating exceptional web applications. I specialize in React ecosystem, Python backend development. My goal is to bridge the gap between beautiful design and robust functionality.",
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

  // Skills with proficiency levels
  const skillCategories = [
    {
      category: "Frontend Development",
      icon: Monitor,
      color: "blue",
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
      icon: Database,
      color: "green",
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
      color: "purple",
      skills: [
        { name: "Figma", level: 88, experience: "1 years" },
        { name: "UI/UX Design", level: 85, experience: "1 years" },
        { name: "Adobe XD", level: 75, experience: ".5 years" },
        { name: "Photoshop", level: 70, experience: "2 years" },
        { name: "Framer Motion", level: 80, experience: "2 years" },
        { name: "Responsive Design", level: 92, experience: "2 years" },
      ],
    },
  ];

  // Featured projects
  const featuredProjects = [
    {
      id: 3,
      title: "Hotel Integration Technologies",
      description:
        "The Hotel API is a FastAPI-based application designed to manage hotels, users, and related entities. It provides endpoints for authentication, hotel management, and provider mappings. The application uses SQLAlchemy for database interactions and Alembic for migrations.",
      image: "/projects/hita_tech.png",
      technologies: ["FastAPI", "React", "Tailwind", "mysql", "Contabo"],
      liveUrl: "https://portfolio-builder.com",
      githubUrl: "https://github.com/RoknuzzamanRokon/HITA-with-FASTapi",
      category: "SaaS",
      year: "2024",
      status: "In Progress",
      features: [
        "Hotel mapping api service",
        "Give Uniq hotel mapping.",
        "Give content for B2B and B2C",
        "Mapping with ML",
        "Verified with AI.",
        "Add new hotel with API",
      ],
    },
    {
      id: 2,
      title: "Story Teller AI",
      description:
        "Collaborative task management application with real-time updates, team collaboration features, and advanced project tracking capabilities.",
      image: "/projects/storyteller.png",
      technologies: ["Python", "AWS", "MySQL"],
      liveUrl: "https://taskmanager-demo.com",
      githubUrl: "https://github.com/RoknuzzamanRokon/storytellerai",
      category: "Web App",
      year: "2024",
      status: "Completed",
      features: [
        "Real-time Story Generator",
        "Generate full story base Your prompt",
        "Unlimited prompt accept",
        "Notification System",
        "Mobile Responsive",
        "Desktop exe file also available",
      ],
    },
    {
      id: 1,
      title: "E-Commerce Platform",
      description:
        "Full-stack e-commerce solution with React, Next.js, and Python backend. Features include user authentication, payment integration, inventory management, and admin dashboard.",
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
        "User Authentication & Authorization",
        "Payment Gateway Integration",
        "Real-time Inventory Management",
        "Admin Dashboard",
        "Responsive Design",
        "SEO Optimized",
      ],
    },
  ];

  // Achievements and certifications
  const achievements = [
    {
      title: "AWS Certified Developer",
      issuer: "Amazon Web Services",
      date: "2023",
      icon: Award,
      color: "orange",
    },
    {
      title: "React Advanced Certification",
      issuer: "My self",
      date: "2022",
      icon: Code,
      color: "blue",
    },
    {
      title: "Python 100 Days challenge",
      issuer: "Dr. Anglea U",
      date: "2022",
      icon: Code,
      color: "blue",
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header with Back Button */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/portfolio">
              <motion.button
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                whileHover={{ x: -5 }}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Portfolio
              </motion.button>
            </Link>
            <div className="flex items-center space-x-4">
              <motion.a
                href={rokonData.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                <Linkedin className="w-4 h-4" />
              </motion.a>
              <motion.a
                href={rokonData.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                <Github className="w-4 h-4" />
              </motion.a>
            </div>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        <div className="container mx-auto px-4">
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
                    <div className="w-full h-full rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 to-purple-900 flex items-center justify-center shadow-2xl">
                      <span className="text-6xl font-bold text-blue-800 dark:text-blue-200 rounded-3xl overflow-hidden">
                        <img
                          src={rokonData.avatar}
                          alt={rokonData.name}
                          className="w-full h-full object-cover"
                        />
                      </span>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Name and Title */}
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                    {rokonData.name}
                  </h1>
                  <h2 className="text-xl md:text-2xl text-blue-600 dark:text-blue-400 font-semibold mb-4">
                    {rokonData.title}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 italic">
                    "{rokonData.tagline}"
                  </p>

                  {/* Contact Info */}
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-center lg:justify-start text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{rokonData.location}</span>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{rokonData.email}</span>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{rokonData.phone}</span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <motion.a
                      href="#contact"
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Hire Me
                    </motion.a>
                    <motion.a
                      href="/resume-rokon.pdf"
                      className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-semibold rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download CV
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
                      value: rokonData.experience,
                      icon: Briefcase,
                      color: "blue",
                    },
                    {
                      label: "Projects",
                      value: rokonData.projectsCompleted,
                      icon: Code,
                      color: "green",
                    },
                    {
                      label: "Happy Clients",
                      value: rokonData.clientsSatisfied,
                      icon: Users,
                      color: "purple",
                    },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <div
                        className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 dark:from-${stat.color}-900/30 dark:to-${stat.color}-800/30 rounded-xl flex items-center justify-center`}
                      >
                        <stat.icon
                          className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`}
                        />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Bio */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    About Me
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {rokonData.bio}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Skills Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Technical{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Expertise
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Comprehensive skill set with hands-on experience in modern
                technologies
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {skillCategories.map((category, categoryIndex) => (
                <motion.div
                  key={categoryIndex}
                  className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: categoryIndex * 0.2 }}
                  whileHover={{ y: -10 }}
                >
                  {/* Category Header */}
                  <div className="flex items-center mb-6">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-${category.color}-500 to-${category.color}-600 rounded-2xl flex items-center justify-center mr-4`}
                    >
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
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
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {skill.experience}
                            </span>
                            <span
                              className={`text-sm font-semibold text-${category.color}-600 dark:text-${category.color}-400`}
                            >
                              {skill.level}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <motion.div
                            className={`h-2 bg-gradient-to-r from-${category.color}-500 to-${category.color}-600 rounded-full`}
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
        </div>
      </section>{" "}
      {/*
 Featured Projects Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Featured{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Projects
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Showcasing my best work and innovative solutions
              </p>
            </motion.div>

            <div className="space-y-12">
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
                  {/* Project Image */}
                  <div className={`${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                    <motion.div
                      className="relative bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-3xl overflow-hidden shadow-2xl"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="aspect-video flex items-center justify-center">
                        <span className="text-6xl font-bold text-blue-800 dark:text-blue-200 h-96 overflow-hidden w-full inline-block">
                          <img
                            src={project.image}
                            alt={rokonData.name}
                            className="w-full h-full object-cover"
                          />
                        </span>
                        <Code className="w-24 h-24 text-blue-400 dark:text-blue-300 absolute" />
                      </div>

                      {/* Project Status Badge */}
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            project.status === "Completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>

                      {/* Overlay with Links */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
                        <div className="flex space-x-4">
                          <motion.a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors flex items-center"
                            whileHover={{ scale: 1.05 }}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Live Demo
                          </motion.a>
                          <motion.a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors flex items-center"
                            whileHover={{ scale: 1.05 }}
                          >
                            <Github className="w-4 h-4 mr-2" />
                            Code
                          </motion.a>
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
                          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg text-sm font-medium">
                            {project.category}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            {project.year}
                          </span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                          {project.title}
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      {/* Technologies */}
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                          Technologies Used:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-xl text-sm font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Key Features */}
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                          Key Features:
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {project.features.map((feature, featureIndex) => (
                            <li
                              key={featureIndex}
                              className="flex items-center text-gray-600 dark:text-gray-400"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Project Links */}
                      <div className="flex space-x-4 pt-4">
                        <motion.a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                          whileHover={{ scale: 1.05, y: -2 }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Live
                        </motion.a>
                        <motion.a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                          whileHover={{ scale: 1.05, y: -2 }}
                        >
                          <Github className="w-4 h-4 mr-2" />
                          Source Code
                        </motion.a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Achievements Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Achievements &{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Certifications
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Recognition and continuous learning in the field of technology
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="flex items-start">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-${achievement.color}-100 to-${achievement.color}-200 dark:from-${achievement.color}-900/30 dark:to-${achievement.color}-800/30 rounded-xl flex items-center justify-center mr-4 flex-shrink-0`}
                    >
                      <achievement.icon
                        className={`w-6 h-6 text-${achievement.color}-600 dark:text-${achievement.color}-400`}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {achievement.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {achievement.issuer}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {achievement.date}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section
        id="contact"
        className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-blue-900/20 dark:to-purple-900/20"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Let's Work{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Together
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
                Ready to bring your ideas to life? I'm available for freelance
                projects and full-time opportunities.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <motion.a
                  href={`mailto:${rokonData.email}`}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Send Email
                </motion.a>

                <motion.a
                  href={rokonData.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-semibold rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <Linkedin className="w-5 h-5 mr-2" />
                  Connect on LinkedIn
                </motion.a>

                <motion.a
                  href={`tel:${rokonData.phone}`}
                  className="px-8 py-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 font-semibold rounded-2xl border-2 border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-500 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
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

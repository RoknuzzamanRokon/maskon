"use client";
import { getPortfolio } from "../lib/api";
import {
  ExternalLink,
  Github,
  Calendar,
  Star,
  Code,
  Zap,
  Users,
  Award,
  Mail,
  Linkedin,
  MapPin,
  Phone,
  Globe,
  ArrowRight,
  Download,
  Play,
  Briefcase,
  Target,
  Lightbulb,
  Rocket,
  CheckCircle,
  Eye,
  Heart,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Variants, motion } from "framer-motion";

export default function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const items = await getPortfolio();
        setPortfolioItems(items);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  // Professional team data
  const teamMembers = [
    {
      name: "Rokon",
      role: "Lead Full Stack Developer",
      title: "Technical Architect & UI/UX Designer",
      bio: "Passionate about creating seamless digital experiences with cutting-edge technologies. Specialized in React ecosystem and modern web development.",
      skills: [
        "React",
        "Next.js",
        "TypeScript",
        "Python",
        "FastAPI",
        "UI/UX Design",
      ],
      photo: "/team/rokon.jpg",
      email: "rokon.raz@gmail.com",
      linkedin: "https://www.linkedin.com/in/rokon-raz/",
      github: "https://github.com/rokon-raz",
      experience: "5+ Years",
      projects: "48+",
    },
    {
      name: "Masrufa",
      role: "Creative Content Strategist",
      title: "Content Creator & Digital Marketing Specialist",
      bio: "Expert in crafting compelling content strategies and building engaging digital narratives that resonate with target audiences.",
      skills: [
        "Content Strategy",
        "Digital Marketing",
        "SEO",
        "Social Media",
        "Copywriting",
        "Analytics",
      ],
      photo: "/team/masrufa.jpg",
      email: "masrufa.sarkar896@gmail.com",
      linkedin: "https://www.linkedin.com/in/masrufa-sarkar/",
      github: "https://github.com/masrufa-sarkar",
      experience: "4+ Years",
      projects: "32+",
    },
  ];

  // Enhanced stats
  const stats = [
    {
      icon: Briefcase,
      label: "Projects Delivered",
      value: "80+",
      color: "blue",
    },
    { icon: Users, label: "Happy Clients", value: "45+", color: "green" },
    { icon: Star, label: "GitHub Stars", value: "1.5K+", color: "yellow" },
    { icon: Award, label: "Years Experience", value: "6+", color: "purple" },
  ];

  // Services offered
  const services = [
    {
      icon: Code,
      title: "Full Stack Development",
      description:
        "End-to-end web application development with modern technologies",
      features: [
        "React & Next.js",
        "Python & FastAPI",
        "Database Design",
        "API Development",
      ],
      color: "blue",
    },
    {
      icon: Lightbulb,
      title: "UI/UX Design",
      description:
        "User-centered design solutions that drive engagement and conversion",
      features: [
        "User Research",
        "Wireframing",
        "Prototyping",
        "Design Systems",
      ],
      color: "purple",
    },
    {
      icon: Rocket,
      title: "Digital Strategy",
      description: "Comprehensive digital transformation and growth strategies",
      features: [
        "Content Strategy",
        "SEO Optimization",
        "Performance Analytics",
        "Brand Development",
      ],
      color: "green",
    },
  ];

  // Animation variants
  const fadeInUp: Variants = {
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

  const scaleIn: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-hidden">
      {/* Hero Section - Modern & Professional */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8"
            >
              {/* Brand Logo/Name */}
              <motion.div variants={fadeInUp} className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-2xl">
                  <span className="text-2xl font-bold text-white">MK</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent leading-tight">
                  MASHKON
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mt-4 font-light">
                  Digital Innovation Studio
                </p>
              </motion.div>

              {/* Hero Description */}
              <motion.div variants={fadeInUp} className="max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-4xl font-semibold text-gray-800 dark:text-gray-200 mb-6 leading-relaxed">
                  We craft exceptional digital experiences that{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    drive results
                  </span>
                </h2>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
                  Combining technical expertise with creative vision to deliver
                  innovative solutions that transform businesses and delight
                  users.
                </p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
              >
                <motion.a
                  href="#projects"
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Eye className="w-5 h-5 mr-2" />
                  View Our Work
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.a>

                <motion.a
                  href="#contact"
                  className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-semibold rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Start a Project
                </motion.a>
              </motion.div>

              {/* Stats Preview */}
              <motion.div variants={fadeInUp} className="pt-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      className="text-center"
                      variants={scaleIn}
                      whileHover={{ y: -5 }}
                    >
                      <div
                        className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 dark:from-${stat.color}-900/30 dark:to-${stat.color}-800/30 rounded-xl flex items-center justify-center`}
                      >
                        <stat.icon
                          className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`}
                        />
                      </div>
                      <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 dark:bg-gray-600 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>
      {/* Services Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Our{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Services
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Comprehensive digital solutions tailored to your business needs
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  className="group relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  whileHover={{ y: -10 }}
                >
                  <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 h-full">
                    {/* Service Icon */}
                    <div
                      className={`w-16 h-16 bg-gradient-to-br from-${service.color}-500 to-${service.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <service.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Service Content */}
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Features List */}
                    <ul className="space-y-3">
                      {service.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center text-gray-700 dark:text-gray-300"
                        >
                          <CheckCircle
                            className={`w-5 h-5 text-${service.color}-500 mr-3 flex-shrink-0`}
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Hover Effect */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br from-${service.color}-500/5 to-${service.color}-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    ></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section - Enhanced */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Meet Our{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Team
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Passionate professionals dedicated to delivering exceptional
                results
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  className="group"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                >
                  <Link href={`/portfolio/${member.name.toLowerCase()}`}>
                    <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200 dark:border-gray-700 cursor-pointer group-hover:scale-105">
                      {/* Header with Gradient */}
                      <div className="relative h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                        <div className="absolute inset-0 bg-black/10"></div>

                        {/* Profile Image */}
                        <div className="absolute -bottom-16 left-8">
                          <div className="w-32 h-32 rounded-3xl border-4 border-white dark:border-gray-900 overflow-hidden shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 to-purple-900 flex items-center justify-center">
                              <span className="text-3xl font-bold text-blue-800 dark:text-blue-200">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="absolute top-4 right-4 flex space-x-2">
                          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                            {member.experience}
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                            {member.projects} Projects
                          </div>
                        </div>
                      </div>

                      <div className="pt-20 pb-8 px-8">
                        {/* Name and Role */}
                        <div className="mb-6">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {member.name}
                          </h3>
                          <p className="text-blue-600 dark:text-blue-400 font-semibold text-lg mb-1">
                            {member.role}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {member.title}
                          </p>
                        </div>

                        {/* Bio */}
                        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                          {member.bio}
                        </p>

                        {/* Skills */}
                        <div className="mb-8">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                            <Code className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                            Core Skills
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {member.skills.map((skill, skillIndex) => (
                              <motion.span
                                key={skillIndex}
                                className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-xl text-sm font-medium border border-blue-100 dark:border-blue-800 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/50 dark:hover:to-purple-800/50 transition-all duration-300"
                                whileHover={{ scale: 1.05 }}
                              >
                                {skill}
                              </motion.span>
                            ))}
                          </div>
                        </div>

                        {/* Contact & Social */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <Mail className="w-4 h-4 mr-2" />
                              <span className="text-sm">{member.email}</span>
                            </div>
                            <div className="flex space-x-3">
                              <motion.a
                                href={member.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Linkedin className="w-4 h-4" />
                              </motion.a>
                              <motion.a
                                href={member.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Github className="w-4 h-4" />
                              </motion.a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Projects Section - Enhanced */}
      <section id="projects" className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Featured{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Projects
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12">
                Showcasing our latest work and innovative solutions that drive
                business growth
              </p>

              {/* Project Filters */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {["all", "web", "mobile", "design", "backend"].map((filter) => (
                  <motion.button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                      activeFilter === filter
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-200 dark:bg-gray-700 rounded-3xl h-80 animate-pulse"
                  ></div>
                ))}
              </div>
            ) : (
              <motion.div
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {portfolioItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="group relative"
                    variants={fadeInUp}
                    whileHover={{ y: -10 }}
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700">
                      {/* Project Image */}
                      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 overflow-hidden">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Code className="w-16 h-16 text-blue-400 dark:text-blue-300" />
                          </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                            <div className="flex space-x-2">
                              {item.project_url && (
                                <motion.a
                                  href={item.project_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </motion.a>
                              )}
                              {item.github_url && (
                                <motion.a
                                  href={item.github_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Github className="w-4 h-4" />
                                </motion.a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Project Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed line-clamp-3">
                          {item.description}
                        </p>

                        {/* Technologies */}
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {item.technologies
                              ?.split(", ")
                              .slice(0, 3)
                              .map((tech: string, techIndex: number) => (
                                <span
                                  key={techIndex}
                                  className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg text-sm font-medium"
                                >
                                  {tech}
                                </span>
                              ))}
                            {item.technologies?.split(", ").length > 3 && (
                              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-lg text-sm">
                                +{item.technologies.split(", ").length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Project Meta */}
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(item.created_at).getFullYear()}
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              <span>View</span>
                            </div>
                            <div className="flex items-center">
                              <Heart className="w-4 h-4 mr-1" />
                              <span>Like</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* View More Projects */}
            <motion.div
              className="text-center mt-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.button
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center mx-auto"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Briefcase className="w-5 h-5 mr-2" />
                View All Projects
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section
        id="contact"
        className="py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-800 dark:via-blue-900/20 dark:to-purple-900/20"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Let's{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Work Together
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Ready to bring your vision to life? Let's discuss your project
                and create something amazing together.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      Get in Touch
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                      We're always excited to work on new projects and help
                      businesses achieve their digital goals. Drop us a message
                      and let's start the conversation.
                    </p>
                  </div>

                  {/* Contact Methods */}
                  <div className="space-y-6">
                    <motion.div
                      className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
                      whileHover={{ x: 10 }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Email Us
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          hello@mashkon.com
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
                      whileHover={{ x: 10 }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Call Us
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          +1 (555) 123-4567
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
                      whileHover={{ x: 10 }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Visit Us
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          Remote & Global
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Social Links */}
                  <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Follow Us
                    </h4>
                    <div className="flex space-x-4">
                      {[
                        { icon: Linkedin, href: "#", color: "blue" },
                        { icon: Github, href: "#", color: "gray" },
                        { icon: Globe, href: "#", color: "green" },
                      ].map((social, index) => (
                        <motion.a
                          key={index}
                          href={social.href}
                          className={`w-12 h-12 bg-${social.color}-100 dark:bg-${social.color}-900/30 rounded-xl flex items-center justify-center text-${social.color}-600 dark:text-${social.color}-400 hover:bg-${social.color}-200 dark:hover:bg-${social.color}-800/50 transition-colors`}
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <social.icon className="w-5 h-5" />
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Start Your Project
                  </h3>

                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project Type
                      </label>
                      <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white">
                        <option>Web Development</option>
                        <option>Mobile App</option>
                        <option>UI/UX Design</option>
                        <option>Digital Strategy</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project Details
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white resize-none"
                        placeholder="Tell us about your project, goals, and timeline..."
                      ></textarea>
                    </div>

                    <motion.button
                      type="submit"
                      className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Rocket className="w-5 h-5 mr-2" />
                      Send Message
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6">
                <span className="text-xl font-bold text-white">MK</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">MASHKON</h3>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                Creating exceptional digital experiences that drive results and
                inspire innovation.
              </p>

              <div className="flex justify-center space-x-6 mb-8">
                {[
                  { icon: Mail, href: "mailto:hello@mashkon.com" },
                  { icon: Linkedin, href: "#" },
                  { icon: Github, href: "#" },
                  { icon: Globe, href: "#" },
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>

              <div className="border-t border-gray-800 pt-8">
                <p className="text-gray-500 text-sm">
                  © 2024 MASHKON. All rights reserved. Built with ❤️ and
                  cutting-edge technology.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

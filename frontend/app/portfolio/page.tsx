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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Variants, motion } from "framer-motion";

export default function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Team members data
  const teamMembers = [
    {
      name: "Rokon",
      role: "Full Stack Developer & Designer",
      bio: "Specializing in React ecosystem with a passion for creating intuitive user experiences. Award-winning designer with 5+ years of experience.",
      skills: [
        "React",
        "Next.js",
        "TypeScript",
        "Figma",
        "Tailwind CSS",
        "UI/UX Design",
      ],
      photo: "/team/20240827_185556.jpg",
      email: "rokon.raz@gmail.com",
    },
    {
      name: "Masrufa",
      role: "Content Creator",
      bio: "Expert inteamMembers scalable backend systems and cloud infrastructure. Focused on building secure, high-performance APIs and services.",
      skills: [
        "Node.js",
        "Python",
        "AWS",
        "Docker",
        "PostgreSQL",
        "Kubernetes",
      ],
      photo: "/team/20240827_185556.jpg",
      email: "sdfsdfsdf.raz@gmail.com",
    },
  ];

  const stats = [
    { icon: Code, label: "Projects Completed", value: "48+" },
    { icon: Star, label: "GitHub Stars", value: "1.2K+" },
    { icon: Users, label: "Happy Clients", value: "32+" },
    { icon: Award, label: "Years Experience", value: "6+" },
  ];

  // Animation variants
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Professional Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20"
              style={{
                top: `${20 + i * 30}%`,
                left: `${10 + i * 40}%`,
                width: `${150 + i * 50}px`,
                height: `${150 + i * 50}px`,
                filter: "blur(40px)",
              }}
              animate={{
                y: [0, 20, 0],
                x: [0, 15, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              {/* Team Photos */}
              <motion.div
                className="flex justify-center items-center mb-12"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <div className="flex -space-x-4">
                  {teamMembers.map((member, index) => (
                    <motion.div
                      key={index}
                      className="relative group"
                      variants={fadeInUp}
                      whileHover={{ y: -8, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/30 overflow-hidden shadow-2xl bg-gradient-to-br from-blue-100 to-indigo-100">
                        <div className="w-full h-full bg-gradient-to-br from-blue-200 to-indigo-200 flex items-center justify-center">
                          <span className="text-2xl md:text-3xl font-bold text-blue-800">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-xs font-semibold text-gray-800">
                          {member.name}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Main Heading */}
              <motion.div variants={fadeInUp}>
                <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    MASKON
                  </span>
                  <br />
                  <span className="text-3xl md:text-4xl font-light text-blue-100">
                    Digital Portfolio
                  </span>
                </h1>
              </motion.div>

              {/* Professional Tagline */}
              <motion.p
                className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed"
                variants={fadeInUp}
              >
                Crafting exceptional digital experiences through innovative
                design and cutting-edge technology.
                <br />
                <span className="text-lg text-blue-200">
                  Full-stack development • UI/UX Design • Digital Strategy
                </span>
              </motion.p>

              {/* Professional Stats */}
              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto"
                variants={staggerContainer}
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
                    variants={fadeInUp}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <stat.icon className="w-8 h-8 mx-auto mb-2 text-blue-300" />
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-blue-200">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                variants={fadeInUp}
              >
                <motion.a
                  href="#projects"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center justify-center group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  View Projects
                </motion.a>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/blog"
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 inline-flex items-center justify-center"
                  >
                    Read Our Blog
                  </Link>
                </motion.div>
                <motion.a
                  href="#contact"
                  className="px-8 py-4 bg-transparent border-2 border-blue-400 text-blue-400 font-semibold rounded-xl hover:bg-blue-400 hover:text-white transition-all duration-300 inline-flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Get In Touch
                </motion.a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Professional About Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                About{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Our Work
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                We combine technical expertise with creative vision to deliver
                exceptional digital solutions
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-6 rounded-full"></div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Our Approach
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4 mt-1">
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                        1
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Discovery & Strategy
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Understanding your goals and crafting the perfect
                        solution strategy.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4 mt-1">
                      <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                        2
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Design & Development
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Creating beautiful, functional solutions with modern
                        technologies.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-4 mt-1">
                      <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">
                        3
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Launch & Support
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Deploying your solution and providing ongoing support
                        and optimization.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-2 gap-6"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center p-6 bg-white dark:bg-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-xl flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Team Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Meet{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Our Team
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Passionate professionals dedicated to creating exceptional digital
              experiences
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-6 rounded-full"></div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                  {/* Header with gradient */}
                  <div className="relative h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute -bottom-12 left-8">
                      <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-gray-800 overflow-hidden shadow-xl bg-gradient-to-br from-blue-100 to-indigo-100">
                        <div className="w-full h-full bg-gradient-to-br from-blue-200 to-indigo-200 flex items-center justify-center">
                          <span className="text-2xl font-bold text-blue-800">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-16 pb-8 px-8">
                    {/* Name and Role */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {member.name}
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                        {member.role}
                      </p>
                    </div>

                    {/* Bio */}
                    <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                      {member.bio}
                    </p>

                    {/* Skills */}
                    <div className="mb-8">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                        <Code className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                        Expertise
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {member.skills.map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <Mail className="w-4 h-4 mr-2" />
                          <span className="text-sm">{member.email}</span>
                        </div>
                        <div className="flex space-x-3">
                          <motion.a
                            href="#"
                            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Linkedin className="w-4 h-4" />
                          </motion.a>
                          <motion.a
                            href="#"
                            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Skills Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Technical{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Expertise
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Comprehensive skill set covering the entire development
                lifecycle
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-6 rounded-full"></div>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Frontend Development",
                  icon: Code,
                  description:
                    "Creating responsive, interactive user interfaces with modern frameworks and best practices",
                  gradient: "from-blue-500 to-cyan-500",
                  bgGradient:
                    "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
                  skills: [
                    "React",
                    "Next.js",
                    "Vue.js",
                    "TypeScript",
                    "Tailwind CSS",
                    "HTML5",
                    "CSS3",
                    "JavaScript",
                    "Redux",
                    "GraphQL",
                    "SASS",
                    "Framer Motion",
                  ],
                },
                {
                  title: "Backend & DevOps",
                  icon: Zap,
                  description:
                    "Building robust APIs and scalable server-side applications with modern infrastructure",
                  gradient: "from-green-500 to-emerald-500",
                  bgGradient:
                    "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
                  skills: [
                    "Python",
                    "FastAPI",
                    "Node.js",
                    "Express.js",
                    "PostgreSQL",
                    "MongoDB",
                    "MySQL",
                    "REST APIs",
                    "Docker",
                    "AWS",
                    "Firebase",
                    "CI/CD",
                  ],
                },
                {
                  title: "Design & Strategy",
                  icon: Award,
                  description:
                    "Crafting intuitive user experiences and effective product strategies",
                  gradient: "from-purple-500 to-violet-500",
                  bgGradient:
                    "from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20",
                  skills: [
                    "Figma",
                    "UX Research",
                    "UI Design",
                    "Prototyping",
                    "User Testing",
                    "Product Strategy",
                    "Agile",
                    "Jira",
                    "Branding",
                    "Wireframing",
                    "Accessibility",
                    "Responsive Design",
                  ],
                },
              ].map((category, index) => (
                <motion.div
                  key={index}
                  className="group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <div
                    className={`bg-gradient-to-br ${category.bgGradient} border border-gray-200 dark:border-gray-700 rounded-3xl p-8 h-full transition-all duration-300 shadow-lg hover:shadow-2xl group-hover:-translate-y-2`}
                  >
                    {/* Header */}
                    <div className="flex items-center mb-6">
                      <div
                        className={`w-14 h-14 bg-gradient-to-r ${category.gradient} rounded-2xl flex items-center justify-center mr-4 shadow-lg`}
                      >
                        <category.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {category.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                      {category.description}
                    </p>

                    {/* Skills Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {category.skills.map((skill, skillIndex) => (
                        <motion.div
                          key={skillIndex}
                          className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm px-3 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 text-center hover:bg-white dark:hover:bg-gray-600 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {skill}
                        </motion.div>
                      ))}
                    </div>

                    {/* Progress Indicator */}
                    <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-600/50">
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Proficiency Level</span>
                        <span className="font-semibold">Expert</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <motion.div
                          className={`h-2 bg-gradient-to-r ${category.gradient} rounded-full`}
                          initial={{ width: 0 }}
                          whileInView={{ width: "90%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: index * 0.2 + 0.5 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section id="projects" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Featured{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Projects
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Showcasing our latest work and innovative solutions
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-6 rounded-full"></div>
            </motion.div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                  >
                    <div className="h-56 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                    <div className="p-8">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-6 animate-pulse"></div>
                      <div className="flex gap-2 mb-6">
                        {[1, 2, 3].map((j) => (
                          <div
                            key={j}
                            className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"
                          ></div>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse"></div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : portfolioItems.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {portfolioItems.map((item: any, index: number) => (
                  <motion.div
                    key={item.id}
                    className="group"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group-hover:-translate-y-2">
                      {/* Project Image */}
                      <div className="relative overflow-hidden h-56">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center">
                            <Code className="w-16 h-16 text-white/80" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Project Number Badge */}
                        <div className="absolute top-4 right-4">
                          <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                            #{String(index + 1).padStart(2, "0")}
                          </span>
                        </div>

                        {/* Year Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {new Date(item.created_at).getFullYear()}
                          </span>
                        </div>
                      </div>

                      <div className="p-8">
                        {/* Project Title */}
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </h3>

                        {/* Project Description */}
                        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed line-clamp-3">
                          {item.description}
                        </p>

                        {/* Technologies */}
                        <div className="mb-8">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                            <Code className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                            Tech Stack
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {item.technologies
                              .split(",")
                              .slice(0, 6)
                              .map((tech: string) => (
                                <span
                                  key={tech}
                                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 text-sm rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                >
                                  {tech.trim()}
                                </span>
                              ))}
                            {item.technologies.split(",").length > 6 && (
                              <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-3 py-1 text-sm rounded-lg font-medium">
                                +{item.technologies.split(",").length - 6} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          {item.project_url && (
                            <motion.a
                              href={item.project_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Live Demo
                            </motion.a>
                          )}
                          {item.github_url && (
                            <motion.a
                              href={item.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 inline-flex items-center justify-center px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Github className="w-4 h-4 mr-2" />
                              Source
                            </motion.a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Code className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Projects Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                  We're currently working on some exciting projects. Check back
                  soon to see our latest work!
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Professional Contact Section */}
      <section
        id="contact"
        className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20"
              style={{
                top: `${20 + i * 30}%`,
                right: `${10 + i * 30}%`,
                width: `${100 + i * 50}px`,
                height: `${100 + i * 50}px`,
                filter: "blur(40px)",
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Let's Create Something{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Extraordinary
                </span>
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-3xl mx-auto">
                Ready to bring your vision to life? We're here to help you build
                innovative digital solutions that make a difference.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold mb-8 text-center">
                    Get In Touch
                  </h3>

                  <div className="space-y-6">
                    {teamMembers.map((member, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mr-4">
                          <span className="text-lg font-bold text-blue-800">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">
                            {member.name}
                          </h4>
                          <p className="text-blue-200 text-sm">{member.role}</p>
                        </div>
                        <div className="flex space-x-2">
                          <motion.a
                            href={`mailto:${member.email}`}
                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-200 hover:text-white hover:bg-white/20 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Mail className="w-4 h-4" />
                          </motion.a>
                          <motion.a
                            href="#"
                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-200 hover:text-white hover:bg-white/20 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Linkedin className="w-4 h-4" />
                          </motion.a>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Additional Contact Info */}
                  <div className="mt-8 pt-8 border-t border-white/20">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center text-blue-100">
                        <MapPin className="w-5 h-5 mr-3 text-blue-300" />
                        <span>Remote & On-site Available</span>
                      </div>
                      <div className="flex items-center text-blue-100">
                        <Globe className="w-5 h-5 mr-3 text-blue-300" />
                        <span>Worldwide Collaboration</span>
                      </div>
                      <div className="flex items-center text-blue-100">
                        <Phone className="w-5 h-5 mr-3 text-blue-300" />
                        <span>Available for Consultation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* CTA Section */}
              <motion.div
                className="text-center lg:text-left"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-3xl font-bold mb-6">
                  Ready to Start Your Project?
                </h3>
                <p className="text-blue-100 mb-8 leading-relaxed">
                  Whether you need a complete digital solution or want to
                  enhance your existing platform, we're here to help you achieve
                  your goals with cutting-edge technology and creative design.
                </p>

                <div className="space-y-4">
                  <motion.a
                    href="mailto:maskon@gmail.com"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Start a Conversation
                  </motion.a>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href="/blog"
                        className="inline-flex items-center justify-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
                      >
                        Read Our Blog
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href="/products"
                        className="inline-flex items-center justify-center px-6 py-3 bg-transparent border border-blue-400 text-blue-400 font-semibold rounded-xl hover:bg-blue-400 hover:text-white transition-all"
                      >
                        View Products
                      </Link>
                    </motion.div>
                  </div>
                </div>

                {/* Response Time */}
                <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-center text-blue-100">
                    <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                    <span className="font-semibold">Quick Response:</span>
                    <span className="ml-2">Usually within 24 hours</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

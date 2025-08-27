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
  PenTool,
  Camera,
  Megaphone,
  TrendingUp,
  BarChart3,
  Edit3,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function MasrufaPortfolio() {
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header with Back Button */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/portfolio">
              <motion.button
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                whileHover={{ x: -5 }}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Portfolio
              </motion.button>
            </Link>
            <div className="flex items-center space-x-4">
              <motion.a
                href={masrufaData.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                <Linkedin className="w-4 h-4" />
              </motion.a>
              <motion.a
                href={masrufaData.github}
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
      <section className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
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
                    <div className="w-full h-full rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 to-pink-900 flex items-center justify-center shadow-2xl">
                      <span className="text-6xl font-bold text-purple-800 dark:text-purple-200">
                        {masrufaData.name.charAt(0)}
                      </span>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <PenTool className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Name and Title */}
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                    {masrufaData.name}
                  </h1>
                  <h2 className="text-xl md:text-2xl text-purple-600 dark:text-purple-400 font-semibold mb-4">
                    {masrufaData.title}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 italic">
                    "{masrufaData.tagline}"
                  </p>

                  {/* Contact Info */}
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-center lg:justify-start text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{masrufaData.location}</span>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{masrufaData.email}</span>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{masrufaData.phone}</span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <motion.a
                      href="#contact"
                      className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Hire Me
                    </motion.a>
                    <motion.a
                      href="/resume-masrufa.pdf"
                      className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-semibold rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
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
                    <BookOpen className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                    About Me
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {masrufaData.bio}
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
                Creative{" "}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Expertise
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Comprehensive skill set in content strategy, digital marketing,
                and brand storytelling
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
      </section>
      {/* Featured Projects Section */}
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
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Campaigns
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
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
                      className="relative bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-3xl overflow-hidden shadow-2xl p-8"
                      whileHover={{ scale: 1.02 }}
                    >
                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {Object.entries(project.metrics).map(
                          ([key, value], metricIndex) => (
                            <div
                              key={metricIndex}
                              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 text-center"
                            >
                              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                                {value}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
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
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>

                      {/* Campaign Icon */}
                      <div className="flex justify-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
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
                          <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-lg text-sm font-medium">
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

                      {/* Technologies/Skills Used */}
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                          Skills & Tools Applied:
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

                      {/* Key Results */}
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                          Key Results Achieved:
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {project.results.map((result, resultIndex) => (
                            <li
                              key={resultIndex}
                              className="flex items-center text-gray-600 dark:text-gray-400"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
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
                          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center inline-flex"
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
        </div>
      </section>

      {/* Testimonials Section */}
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
                Client{" "}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Testimonials
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                What clients say about working with me
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700"
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
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>

                  {/* Testimonial Content */}
                  <blockquote className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed italic">
                    "{testimonial.content}"
                  </blockquote>

                  {/* Client Info */}
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 to-pink-900 rounded-xl flex items-center justify-center mr-4">
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
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
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Certifications
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Recognition and continuous learning in digital marketing and
                content strategy
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
        className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-800 dark:via-purple-900/20 dark:to-pink-900/20"
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
                Let's Create{" "}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Together
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
                Ready to elevate your brand with compelling content and
                strategic marketing? Let's discuss your project and create
                something amazing.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <motion.a
                  href={`mailto:${masrufaData.email}`}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Send Email
                </motion.a>

                <motion.a
                  href={masrufaData.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-semibold rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <Linkedin className="w-5 h-5 mr-2" />
                  Connect on LinkedIn
                </motion.a>

                <motion.a
                  href={`tel:${masrufaData.phone}`}
                  className="px-8 py-4 bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-400 font-semibold rounded-2xl border-2 border-pink-200 dark:border-pink-700 hover:border-pink-300 dark:hover:border-pink-500 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
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

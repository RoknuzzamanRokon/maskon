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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default async function PortfolioPage() {
  const portfolioItems = await getPortfolio();

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
    },
  ];

  const stats = [
    { icon: Code, label: "Projects Completed", value: "48+" },
    { icon: Star, label: "GitHub Stars", value: "1.2K+" },
    { icon: Users, label: "Happy Clients", value: "32+" },
    { icon: Award, label: "Years Experience", value: "6+" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-700 via-indigo-800 to-purple-900 text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-soft-light filter blur-3xl"></div>
          <div className="absolute bottom-10 right-0 w-80 h-80 bg-purple-500 rounded-full mix-blend-soft-light filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Team photos */}
              <div className="flex -space-x-6">
                {teamMembers.map((member, index) => (
                  <div
                    key={index}
                    className="relative group transform hover:-translate-y-2 transition-transform duration-300"
                  >
                    <div className="relative w-40 h-40 rounded-full border-4 border-white/20 overflow-hidden shadow-2xl">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full">
                        <img src={`${member?.photo}`} />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                      <span className="text-xs font-semibold text-white">
                        {member.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-yellow-400">
                    Rokon & Masrufa
                  </span>{" "}
                  <br />
                  Digital Crafters
                </h1>
                <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl leading-relaxed">
                  We transform complex ideas into elegant digital solutions.
                  Partners in code, design, and innovation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a
                    href="#projects"
                    className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 rounded-xl font-bold hover:from-amber-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    View Our Projects
                  </a>
                  <Link
                    href="/blog"
                    className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 rounded-xl font-bold hover:bg-white/10 transition-all"
                  >
                    Read Our Blog
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                The Team
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Two passionate developers with complementary skills creating
              exceptional digital experiences
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative h-64 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center">
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-xl">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full">
                      <img src={`${member?.photo}`} />
                    </div>
                  </div>
                </div>

                <div className="pt-16 pb-8 px-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-6">
                    {member.role}
                  </p>
                  <p className="text-gray-600 mb-8">{member.bio}</p>

                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center justify-center">
                      <Code className="w-4 h-4 mr-2 text-indigo-600" />
                      Core Skills:
                    </h4>
                    <div className="flex flex-wrap justify-center gap-2">
                      {member.skills.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <a
                      href="#"
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Expertise
                </span>
              </h2>
              <p className="text-xl text-gray-600">
                Combined technical skills that enable us to deliver full-stack
                solutions
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mb-6">
                  <Code className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                  Frontend Development
                </h3>
                <p className="text-gray-600 mb-6">
                  Creating responsive and interactive user interfaces with
                  modern frameworks
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
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
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                  Backend & DevOps
                </h3>
                <p className="text-gray-600 mb-6">
                  Building robust APIs and server-side applications with
                  scalable architecture
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
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
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-violet-100 rounded-lg flex items-center justify-center mb-6">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                  Design & Strategy
                </h3>
                <p className="text-gray-600 mb-6">
                  Creating intuitive user experiences and effective product
                  strategies
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
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
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Projects
                </span>
              </h2>
              <p className="text-xl text-gray-600">
                A collection of projects that showcase our skills and creativity
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolioItems.map((item: any, index: number) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="relative overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Code className="w-16 h-16 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                        Project #{index + 1}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(item.created_at).getFullYear()}
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mb-6">
                      <h4 className="font-semibold text-sm text-gray-800 mb-3 flex items-center">
                        <Code className="w-4 h-4 mr-1" />
                        Technologies Used:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {item.technologies.split(",").map((tech: string) => (
                          <span
                            key={tech}
                            className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded-md font-medium hover:bg-gray-200 transition-colors"
                          >
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {item.project_url && (
                        <a
                          href={item.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-800 transition-all"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Live Demo
                        </a>
                      )}
                      {item.github_url && (
                        <a
                          href={item.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          <Github className="w-4 h-4 mr-2" />
                          Code
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-blue-700 to-indigo-800 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-soft-light filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500 rounded-full mix-blend-soft-light filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Let's Build Something Amazing Together
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl mx-auto">
              Have a project in mind? We'd love to hear about it and discuss how
              we can bring your ideas to life.
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto mb-12">
              <div className="grid md:grid-cols-2 gap-8">
                {teamMembers.map((member, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-white/30 overflow-hidden">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full">
                        <img src={`${member?.photo}`} />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                    <p className="text-blue-200 mb-3">{member.role}</p>
                    <a
                      href="mailto:contact@example.com"
                      className="inline-flex items-center text-blue-100 hover:text-white transition-colors"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      rokon.raz@gmail.com
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:maskon@gmail.com"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 rounded-xl font-bold hover:from-amber-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl"
              >
                <Mail className="w-5 h-5 mr-2" />
                Get In Touch
              </a>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 rounded-xl font-bold hover:bg-white/10 transition-colors"
              >
                Read Our Blog
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

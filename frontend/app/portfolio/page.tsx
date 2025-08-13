import { getPortfolio } from "../lib/api";
import { ExternalLink, Github, Calendar, Star, Code, Zap, Users, Award } from "lucide-react";
import Link from "next/link";

export default async function PortfolioPage() {
  const portfolioItems = await getPortfolio();

  const stats = [
    { icon: Code, label: "Projects Completed", value: "15+" },
    { icon: Star, label: "GitHub Stars", value: "200+" },
    { icon: Users, label: "Happy Clients", value: "10+" },
    { icon: Award, label: "Years Experience", value: "3+" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-32 h-32 mx-auto mb-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Code className="w-16 h-16" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Our Portfolio
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Crafting digital experiences with passion and precision. 
              Here's a showcase of our journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#projects"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <Zap className="w-5 h-5 mr-2" />
                View Projects
              </a>
              <Link
                href="/blog"
                className="inline-flex items-center px-8 py-4 border-2 border-white/30 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Read My Blog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Skills & Technologies
              </h2>
              <p className="text-xl text-gray-600">
                The tools and technologies I use to bring ideas to life
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <Code className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-blue-800">
                  Frontend Development
                </h3>
                <p className="text-gray-600 mb-6">
                  Creating responsive and interactive user interfaces with modern frameworks
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "React", "Next.js", "Vue.js", "TypeScript", 
                    "Tailwind CSS", "HTML5", "CSS3", "JavaScript"
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

              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-green-800">
                  Backend Development
                </h3>
                <p className="text-gray-600 mb-6">
                  Building robust APIs and server-side applications with scalable architecture
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Python", "FastAPI", "Node.js", "Express.js", 
                    "PostgreSQL", "MongoDB", "MySQL", "REST APIs"
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

              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-purple-800">
                  Tools & DevOps
                </h3>
                <p className="text-gray-600 mb-6">
                  Streamlining development workflow with modern tools and deployment strategies
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Git", "Docker", "AWS", "Vercel", "Netlify", 
                    "Figma", "VS Code", "Linux"
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
      <section id="projects" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Featured Projects
              </h2>
              <p className="text-xl text-gray-600">
                A collection of projects that showcase my skills and creativity
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolioItems.map((item: any, index: number) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
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
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
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
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Let's Build Something Amazing Together</h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Have a project in mind? I'd love to hear about it and discuss how we can bring your ideas to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:your-email@example.com"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <Users className="w-5 h-5 mr-2" />
                Get In Touch
              </a>
              <Link
                href="/blog"
                className="inline-flex items-center px-8 py-4 border-2 border-white/30 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Read My Blog
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
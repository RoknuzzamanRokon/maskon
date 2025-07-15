import { getPortfolio } from "../lib/api";

export default async function PortfolioPage() {
  const portfolioItems = await getPortfolio();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16 mb-12">
        <h1 className="text-5xl font-bold mb-4">My Portfolio</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Here are some of the projects I've worked on. Each one represents a
          unique challenge and learning experience in my development journey.
        </p>
      </section>

      {/* Skills Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Skills & Technologies
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-blue-800">
              Frontend
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                "React",
                "Next.js",
                "Vue.js",
                "TypeScript",
                "Tailwind CSS",
                "HTML/CSS",
              ].map((skill) => (
                <span
                  key={skill}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-green-800">
              Backend
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                "Python",
                "FastAPI",
                "Node.js",
                "Express.js",
                "PostgreSQL",
                "MongoDB",
              ].map((skill) => (
                <span
                  key={skill}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-purple-800">
              Tools & Others
            </h3>
            <div className="flex flex-wrap gap-2">
              {["Git", "Docker", "AWS", "Vercel", "Figma", "REST APIs"].map(
                (skill) => (
                  <span
                    key={skill}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">
          Featured Projects
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioItems.map((item: any) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
            >
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>

                <div className="mb-4">
                  <h4 className="font-medium text-sm text-gray-800 mb-2">
                    Technologies:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {item.technologies.split(",").map((tech: string) => (
                      <span
                        key={tech}
                        className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded"
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
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition"
                    >
                      Live Demo
                    </a>
                  )}
                  {item.github_url && (
                    <a
                      href={item.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-50 transition"
                    >
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="mt-16 text-center bg-gray-50 py-12 rounded-lg">
        <h2 className="text-3xl font-bold mb-4">Let's Work Together</h2>
        <p className="text-gray-600 mb-6">
          Interested in collaborating? I'd love to hear about your project.
        </p>
        <div className="space-x-4">
          <a
            href="mailto:your-email@example.com"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Get In Touch
          </a>
          <a
            href="/blog"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition"
          >
            Read My Blog
          </a>
        </div>
      </section>
    </div>
  );
}

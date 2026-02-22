// app/blog/category/[category]/page.tsx
import PostsGrid from "./PostsGrid";
import { getBlogPosts } from "../../../lib/api";
export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const posts = await getBlogPosts(20, params.category);

  const categoryEmojis: Record<string, string> = {
    tech: "🚀",
    food: "🍕",
    activity: "🏃",
  };

  const categoryNames: Record<string, string> = {
    tech: "Technology",
    food: "Food & Recipes",
    activity: "Activities & Life",
  };

  const title = `${categoryEmojis[params.category] ?? "📚"} ${
    categoryNames[params.category] ?? params.category
  }`;

  return (
    <main className="container mx-auto px-4 pt-16 pb-10 sm:pt-20 md:pt-24">
      <header className="mb-10 text-center">
        <div className="inline-block bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-2xl px-4 py-2 shadow-md">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {title}
          </h1>
        </div>
        <p className="mt-3 text-gray-500">
          Curated posts from the {params.category} collection
        </p>
      </header>

      {/* Interactive client component */}
      <PostsGrid initialPosts={posts} category={params.category} />
    </main>
  );
}

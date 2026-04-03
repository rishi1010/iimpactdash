import { getBlogs } from "@/actions/blog-actions";
import { BlogDataRow } from "@/components/blog-data-row";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function BlogsPage() {
  const blogs = await getBlogs();

  return (
    <main className="p-8 flex flex-col gap-4 w-full overflow-hidden items-center ">
      <div className="flex w-full justify-between items-cente mb-20">
        <h1 className="text-2xl font-bold font-mono text-center">Live Blogs</h1>
        <Button variant="outline" className="group" asChild>
          <Link href="/blogs/new">
            <Plus className="transition-transform duration-200 group-hover:rotate-90" />
            New Blog
          </Link>
        </Button>
      </div>

      {blogs.length === 0 ? (
        <p className="text-muted-foreground font-mono">
          No blogs found. Create one using the sidebar.
        </p>
      ) : (
        <div className="rounded-lg overflow-hidden border border-border">
          {blogs.map((blog, i) => (
            <BlogDataRow
              key={blog.id}
              index={i + 1}
              id={blog.id}
              title={blog.title}
              blurb={blog.blurb}
              slug={blog.slug}
              createdAt={blog.created_at}
            />
          ))}
        </div>
      )}
    </main>
  );
}

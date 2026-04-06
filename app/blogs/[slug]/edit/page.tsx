import { BlogForm } from "@/components/blog-form";
import { getBlogById } from "@/actions/blog-actions";
import { notFound } from "next/navigation";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlogById(slug);
  console.log(blog);

  if (!blog) notFound();

  return <BlogForm existing={blog} />;
}

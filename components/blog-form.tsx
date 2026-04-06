"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import {
  createBlog,
  updateBlog,
  uploadBlogImage,
} from "@/actions/blog-actions";
import type { Blog } from "@/actions/blog-actions";

type Props = {
  existing?: Blog;
};

export function BlogForm({ existing }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: existing?.title ?? "",
    blurb: existing?.blurb ?? "",
    slug: existing?.slug ?? "",
    content: existing?.content ?? "",
    cover_image_url: existing?.cover_image_url ?? "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "title" && !existing
        ? {
            slug: value
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
          }
        : {}),
    }));
  }

  async function handleImageUpload(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const { url, error } = await uploadBlogImage(formData);
    if (error) throw new Error(error);
    return url!;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    let cover_image_url = form.cover_image_url;

    if (image) {
      try {
        cover_image_url = await handleImageUpload(image);
      } catch (err: any) {
        toast("Failed to upload image", { description: err.message });
        setLoading(false);
        return;
      }
    }

    if (existing) {
      const { error } = await updateBlog(existing.id, {
        ...form,
        cover_image_url,
      });
      setLoading(false);
      if (error) {
        toast("Failed to update blog", { description: error });
      } else {
        toast("Blog updated", {
          description: `"${form.title}" has been updated.`,
        });
        router.push("/blogs");
        router.refresh();
      }
    } else {
      const { error } = await createBlog({ ...form, cover_image_url });
      setLoading(false);
      if (error) {
        toast("Failed to create blog", { description: error });
      } else {
        toast("Blog created", { description: `"${form.title}" is now live.` });
        router.push("/blogs");
      }
    }
  }

  return (
    <main className="p-8 max-w-2xl flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-mono">
          {existing ? "Edit Blog" : "New Blog"}
        </h1>
        <p className="text-sm text-muted-foreground font-mono">
          {existing
            ? "Update the details below."
            : "Fill in the details below. All fields are required."}
        </p>
      </div>

      <div className="border border-red-500 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-lg p-3 text-sm font-mono">
        <p className="font-semibold">⚠ Warning</p>
        <p>
          Changes are immediately live on the website. Review carefully before
          submitting.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title" className="font-mono">
            Title
          </Label>
          <Input
            id="title"
            name="title"
            placeholder="My Awesome Blog Post"
            value={form.title}
            onChange={handleChange}
            required
            className="font-mono"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slug" className="font-mono">
            Slug
          </Label>
          <Input
            id="slug"
            name="slug"
            placeholder="my-awesome-blog-post"
            value={form.slug}
            onChange={handleChange}
            required
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground font-mono">
            {existing
              ? "Changing the slug will break existing links."
              : "Auto-generated from title. You can edit it manually."}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="blurb" className="font-mono">
            Blurb
          </Label>
          <Input
            id="blurb"
            name="blurb"
            placeholder="A short description of the blog post"
            value={form.blurb}
            onChange={handleChange}
            required
            className="font-mono"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="image" className="font-mono">
            Cover Image
          </Label>
          {existing?.cover_image_url && (
            <img
              src={existing.cover_image_url}
              alt="current cover"
              className="h-24 w-40 object-cover rounded border border-border"
            />
          )}
          <Input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            className="font-mono cursor-pointer"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-muted-foreground font-mono">
            {existing
              ? "Upload a new image to replace the current one."
              : "Uploaded to Supabase storage."}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="content" className="font-mono">
            Content
          </Label>
          <Textarea
            id="content"
            name="content"
            placeholder="Write your blog content here..."
            value={form.content}
            onChange={handleChange}
            required
            className="font-mono min-h-64 resize-y"
          />
          <p className="text-xs text-muted-foreground font-mono">
            Use markdown format. — To convert plain text, paste it into{" "}
            <a
              href="https://claude.ai"
              target="_blank"
              className="underline text-foreground"
            >
              claude.ai
            </a>{" "}
            or{" "}
            <a
              href="https://chatgpt.com"
              target="_blank"
              className="underline text-foreground"
            >
              chatgpt.com
            </a>{" "}
            with the prompt:{" "}
            <span className="text-foreground bg-muted px-1 py-0.5 rounded text-xs">
              "Convert this to markdown with proper h1, h2, h3 headings, lists,
              bold, italic, and links."
            </span>
          </p>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="font-mono">
            {loading ? "Saving..." : existing ? "Update Blog" : "Create Blog"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/blogs")}
            className="font-mono group"
          >
            <X className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
            Cancel
          </Button>
        </div>
      </form>
    </main>
  );
}

// this page will be where the user can add new blogs and stuff
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"; // Adjust this path to your component location
import { createBlog, handleImageUpload } from "@/actions/blog-actions";
import { X } from "lucide-react";

export default function NewBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    blurb: "",
    slug: "",
    content: "",
  });
  const [image, setImage] = useState<File | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // auto generate slug from title
      ...(name === "title" && {
        slug: value
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      }),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    let cover_image_url = "";
    if (image) {
      try {
        cover_image_url = await handleImageUpload(image);
      } catch (err: any) {
        toast.error("Failed to upload image", { description: err.message });
        setLoading(false);
        return;
      }
    }

    const { error } = await createBlog({ ...form, cover_image_url });
    setLoading(false);

    if (error) {
      toast.error("Failed to create blog", { description: error });
    } else {
      toast.success("Blog created", {
        description: `"${form.title}" is now live.`,
      });
      router.push("/blogs");
    }
  }

  function handleCancel() {
    setForm({ title: "", blurb: "", slug: "", content: "" });
    router.push("/blogs");
  }

  return (
    <main className="p-8 max-w-2xl flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-mono">New Blog</h1>
        <p className="text-sm text-muted-foreground font-mono">
          Fill in the details below. All fields are required.
        </p>
      </div>

      {/* Warning */}
      <div className="border border-red-500 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-lg p-3 text-sm font-mono">
        <p className="font-semibold">⚠ Warning</p>
        <p>
          Published blogs are immediately live on the website. Review carefully
          before submitting.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Title */}
        <Field>
          <FieldLabel htmlFor="title" className="font-mono">
            Title
          </FieldLabel>
          <Input
            id="title"
            name="title"
            placeholder="My Awesome Blog Post"
            value={form.title}
            onChange={handleChange}
            required
            className="font-mono"
          />
        </Field>

        {/* Slug */}
        <Field>
          <FieldLabel htmlFor="slug" className="font-mono">
            Slug
          </FieldLabel>
          <Input
            id="slug"
            name="slug"
            placeholder="my-awesome-blog-post"
            value={form.slug}
            onChange={handleChange}
            required
            className="font-mono"
          />
          <FieldDescription className="font-mono">
            Auto-generated from title. You can edit it manually.
          </FieldDescription>
        </Field>

        {/* Blurb */}
        <Field>
          <FieldLabel htmlFor="blurb" className="font-mono">
            Blurb
          </FieldLabel>
          <Input
            id="blurb"
            name="blurb"
            placeholder="A short description of the blog post"
            value={form.blurb}
            onChange={handleChange}
            required
            className="font-mono"
          />
        </Field>

        {/* Cover Image */}
        <Field>
          <FieldLabel htmlFor="image" className="font-mono">
            Cover Image
          </FieldLabel>
          <Input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            className="font-mono cursor-pointer"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          />
        </Field>

        {/* Content */}
        <Field>
          <FieldLabel htmlFor="content" className="font-mono">
            Content
          </FieldLabel>
          <Textarea
            id="content"
            name="content"
            placeholder="Write your blog content here..."
            value={form.content}
            onChange={handleChange}
            required
            className="font-mono min-h-64 resize-y"
          />
          <FieldDescription className="font-mono">
            <span className="text-red-500">
              Use markdown format as this area only supports markdown format not
              plain text for styling.
            </span>{" "}
            — To convert plain text, paste it into{" "}
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
          </FieldDescription>
        </Field>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading} className="font-mono">
            {loading ? "Creating..." : "Create Blog"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
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

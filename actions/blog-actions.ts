"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export type Blog = {
  id: string;
  title: string;
  blurb: string;
  content: string;
  cover_image_url: string;
  slug: string;
  created_at: string;
  updated_at: string;
};

export async function getBlogs(): Promise<Blog[]> {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function deleteBlog(id: string): Promise<{ error?: string }> {
  // 1. Get the image URL first
  const { data: blog, error: fetchError } = await supabase
    .from("blogs")
    .select("cover_image_url")
    .eq("id", id)
    .single();

  if (fetchError) return { error: `Blog not found: ${fetchError.message}` };

  // 2. Delete the image from the bucket
  if (blog?.cover_image_url) {
    const filename = blog.cover_image_url.split("/").pop();

    if (filename) {
      const { error: storageError } = await supabase.storage
        .from("content-images")
        .remove([filename]); // Must be an array

      if (storageError) {
        // We log this but don't stop the process
        console.error("Failed to delete storage file:", storageError.message);
      }
    }
  }

  // 3. Delete the database row
  const { error: deleteError } = await supabase
    .from("blogs")
    .delete()
    .eq("id", id);

  if (deleteError) return { error: deleteError.message };

  // 4. Refresh the cache so the blog disappears from the list
  revalidatePath("/blogs");

  return {};
}

export async function createBlog(data: {
  title: string;
  blurb: string;
  content: string;
  slug: string;
  cover_image_url: string;
}): Promise<{ error?: string }> {
  const { error } = await supabase.from("blogs").insert([data]);
  if (error) return { error: error.message };
  return {};
}

export async function handleImageUpload(file: File): Promise<string> {
  const filename = `${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from("content-images")
    .upload(filename, file);

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from("content-images")
    .getPublicUrl(filename);

  return data.publicUrl;
}

export async function getBlogById(id: string): Promise<Blog | null> {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", id)
    .single();

  if (error) return null;
  return data;
}

export async function updateBlog(
  id: string,
  data: {
    title: string;
    blurb: string;
    content: string;
    slug: string;
    cover_image_url: string;
  },
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("blogs")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  return {};
}

export async function uploadBlogImage(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file") as File;
  const filename = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("content-images")
    .upload(filename, file);

  if (error) return { error: error.message };

  const { data } = supabase.storage
    .from("content-images")
    .getPublicUrl(filename);

  return { url: data.publicUrl };
}

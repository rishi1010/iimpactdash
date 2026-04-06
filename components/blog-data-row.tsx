"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteBlog } from "@/actions/blog-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  index: number;
  id: string;
  title: string;
  blurb: string;
  slug: string;
  createdAt: string;
};

export function BlogDataRow({
  index,
  id,
  title,
  blurb,
  slug,
  createdAt,
}: Props) {
  const router = useRouter();

  async function handleDelete() {
    const { error } = await deleteBlog(id);
    if (error) {
      toast("Failed to delete blog", { description: error });
    } else {
      toast("Blog deleted", { description: `"${title}" has been removed.` });
      router.refresh();
    }
  }

  return (
    <div className="font-mono flex items-center gap-4 px-4 py-3 border-x border-t last:border-b first:rounded-t-lg last:rounded-b-lg border-border ring-inset bg-card text-card-foreground w-full">
      <span className="text-muted-foreground w-6 shrink-0 text-sm">
        {index}
      </span>

      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-sm font-semibold truncate max-w-sm">{title}</span>
        <span className="text-xs text-muted-foreground truncate max-w-xs">
          {blurb}
        </span>
      </div>

      <span className="text-xs text-muted-foreground w-40 truncate hidden md:block">
        {slug}
      </span>

      <span className="text-xs text-muted-foreground w-32 shrink-0 hidden lg:block">
        {new Date(createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </span>

      <div className="flex gap-2 shrink-0">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(`/blogs/${slug}/edit`)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-mono">
                Delete Blog?
              </AlertDialogTitle>
              <AlertDialogDescription className="font-mono">
                This will permanently delete{" "}
                <span className="text-foreground font-semibold">"{title}"</span>{" "}
                and its cover image. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-mono">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                className="font-mono bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      toast.error("Failed to delete blog, try again later.");
    } else {
      toast.success("Blog has been deleted successfully");
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

      <span className="text-xs text-muted-foreground w-40 truncate hidden  md:block">
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
        <Button variant="destructive" size="icon" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

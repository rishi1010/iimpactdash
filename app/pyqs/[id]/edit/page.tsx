import { PyqForm } from "@/components/pyq-form";
import { getPaperById } from "@/actions/pyq-actions";
import { notFound } from "next/navigation";

export default async function EditPaperPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const paper = await getPaperById(id);

  if (!paper) notFound();

  return <PyqForm existing={paper} />;
}

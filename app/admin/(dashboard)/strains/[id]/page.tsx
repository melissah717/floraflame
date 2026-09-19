import { notFound } from "next/navigation";

import { getBatch } from "@/lib/admin/strains";
import { StrainForm } from "@/components/admin/strain-form";

/**
 * One route for both create and edit — /admin/strains/new is the create
 * case. Two nearly-identical route files drift; one with a null row doesn't.
 */
export default async function AdminStrainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id === "new") {
    return <StrainForm batch={null} />;
  }

  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  const batch = await getBatch(numericId);
  if (!batch) notFound();

  return <StrainForm batch={batch} />;
}

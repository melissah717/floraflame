import { notFound } from "next/navigation";

import { getStockist } from "@/lib/admin/stockists";
import { StockistForm } from "@/components/admin/stockist-form";

export default async function AdminStockistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id === "new") {
    return <StockistForm stockist={null} />;
  }

  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  const stockist = await getStockist(numericId);
  if (!stockist) notFound();

  return <StockistForm stockist={stockist} />;
}

import { redirect } from "next/navigation";

export default async function LegacySavedSizingRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/sales/saved-sizings/${id}`);
}

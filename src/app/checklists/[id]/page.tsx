import ChecklistDetailsClient from "./ChecklistDetailsClient";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChecklistDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return <ChecklistDetailsClient id={id} />;
}

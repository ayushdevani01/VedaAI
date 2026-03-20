import { AppShell } from "@/components/layout/app-shell";
import { GeneratingView } from "@/components/assignment/generating-view";

export default async function GeneratingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AppShell>
      <GeneratingView assignmentId={id} />
    </AppShell>
  );
}

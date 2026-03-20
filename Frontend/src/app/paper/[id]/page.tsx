import { AppShell } from "@/components/layout/app-shell";
import { PaperView } from "@/components/paper/paper-view";

export default async function PaperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AppShell>
      <PaperView assignmentId={id} />
    </AppShell>
  );
}

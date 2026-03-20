import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";

export default function LibraryPage() {
  return (
    <AppShell>
      <Card>
        <p className="text-sm text-slate-400">Library</p>
        <h2 className="mt-1 text-3xl font-bold">Resource hub coming soon</h2>
        <p className="mt-3 max-w-2xl text-slate-500">This placeholder keeps the navigation consistent with the provided design while focusing implementation on the requested frontend flows.</p>
      </Card>
    </AppShell>
  );
}

import { AppShell } from "@/components/layout/app-shell";
import { AssignmentsList } from "@/components/assignment/assignments-list";

export default function HomePage() {
  return (
    <AppShell>
      <AssignmentsList />
    </AppShell>
  );
}

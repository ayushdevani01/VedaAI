import { AppShell } from "@/components/layout/app-shell";
import { AssignmentsList } from "@/components/assignment/assignments-list";

export default function AssignmentsPage() {
  return (
    <AppShell>
      <AssignmentsList />
    </AppShell>
  );
}

"use client";

import Link from "next/link";
import { Search, SlidersHorizontal, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/use-app-store";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export function AssignmentsList() {
  const assignments = useAppStore((state) => state.assignments);
  const fetchAssignments = useAppStore((state) => state.fetchAssignments);
  const deleteAssignment = useAppStore((state) => state.deleteAssignment);
  const assignmentsLoading = useAppStore((state) => state.assignmentsLoading);
  const assignmentsError = useAppStore((state) => state.assignmentsError);
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const filtered = useMemo(
    () =>
      assignments.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.subject.toLowerCase().includes(query.toLowerCase()),
      ),
    [assignments, query],
  );

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteAssignment(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (assignmentsLoading) {
    return (
      <Card className="flex min-h-[520px] flex-col items-center justify-center bg-[#f4f3f0]">
        <Loader2 className="h-12 w-12 animate-spin text-slate-400" />
        <p className="mt-4 text-slate-500">Loading assignments…</p>
      </Card>
    );
  }

  if (assignmentsError) {
    return (
      <Card className="flex min-h-[520px] flex-col items-center justify-center bg-[#f4f3f0] text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-red-600">{assignmentsError}</p>
        <button onClick={() => fetchAssignments()} className="mt-4 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
          Retry
        </button>
      </Card>
    );
  }

  if (!assignments.length) {
    return (
      <Card className="flex min-h-[520px] flex-col items-center justify-center bg-[#f4f3f0] text-center">
        <div className="mb-6 flex h-36 w-36 items-center justify-center rounded-full bg-white text-6xl shadow-inner">📄</div>
        <h2 className="text-3xl font-bold">No assignments yet</h2>
        <p className="mt-3 max-w-xl text-slate-500">Create your first assignment to generate AI-powered question papers.</p>
        <Link href="/create" className="mt-8 rounded-full bg-slate-950 px-6 py-3 font-semibold text-white shadow-[0_0_0_2px_rgba(251,146,60,0.55)]">
          Create Your First Assignment
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[#f4f3f0]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-slate-400">Assignments</p>
            <h2 className="text-2xl font-bold">
              {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600">
              <SlidersHorizontal className="h-4 w-4" /> Filter
            </button>
            <label className="flex min-w-[260px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search assignment"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {filtered.map((assignment) => (
          <Card key={assignment.id} className="relative overflow-hidden">
            <div className="absolute right-5 top-5">
              <StatusBadge status={assignment.status} />
            </div>
            <div className="space-y-5">
              <div>
                <h3 className="pr-24 text-xl font-bold">{assignment.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{assignment.subject}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Created</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {new Date(assignment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Due</p>
                  <p className="mt-1 font-semibold text-slate-800">{assignment.dueDate}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Questions</p>
                  <p className="mt-1 font-semibold text-slate-800">{assignment.totalQuestions}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Marks</p>
                  <p className="mt-1 font-semibold text-slate-800">{assignment.totalMarks}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={assignment.status === "ready" ? `/paper/${assignment.id}` : `/generating/${assignment.id}`}
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  {assignment.status === "ready" ? "View Paper" : assignment.status === "failed" ? "View Status" : "View Progress"}
                </Link>
                <button
                  onClick={() => handleDelete(assignment.id)}
                  disabled={deletingId === assignment.id}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 disabled:opacity-50"
                >
                  {deletingId === assignment.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

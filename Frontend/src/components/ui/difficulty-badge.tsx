import { cn } from "@/lib/utils";
import { Difficulty } from "@/lib/types";

const styles: Record<Difficulty, string> = {
  easy: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-rose-100 text-rose-700",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <span className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize", styles[difficulty])}>{difficulty}</span>;
}

import { cn } from "@/lib/utils";

const MAP: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SENT: "bg-sky-100 text-sky-800",
  ISSUED: "bg-sky-100 text-sky-800",
  ACCEPTED: "bg-emerald-100 text-emerald-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  PAID: "bg-emerald-100 text-emerald-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  ACTIVE: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
  CANCELLED: "bg-rose-100 text-rose-800",
  EXPIRED: "bg-rose-100 text-rose-800",
  OVERDUE: "bg-rose-100 text-rose-800",
  INACTIVE: "bg-slate-200 text-slate-600",
  PARTIALLY_PAID: "bg-amber-100 text-amber-900",
  IN_PROGRESS: "bg-amber-100 text-amber-900",
  ON_HOLD: "bg-amber-100 text-amber-900",
  PLANNING: "bg-indigo-100 text-indigo-800",
  QUOTATION: "bg-indigo-100 text-indigo-800",
  AWARDED: "bg-teal-100 text-teal-800",
  FOR_REVIEW: "bg-violet-100 text-violet-800",
  AS_BUILT: "bg-teal-100 text-teal-800",
  SUPERSEDED: "bg-slate-200 text-slate-600",
  RECEIVED: "bg-emerald-100 text-emerald-800",
  PENDING: "bg-amber-100 text-amber-900",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        MAP[value] ?? "bg-slate-100 text-slate-700",
      )}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm placeholder:text-slate/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-navy shadow-sm placeholder:text-slate/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("text-xs font-semibold uppercase tracking-wide text-slate", className)} {...props} />;
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate">{label}</span>
      {children}
    </label>
  );
}

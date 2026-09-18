import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type HeaderAction = { href: string; label: string };

function isHeaderAction(action: ReactNode | HeaderAction): action is HeaderAction {
  return Boolean(action && typeof action === "object" && "href" in action && "label" in action);
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: HeaderAction | ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brass">VoltNex ERP</p>
        <h1 className="font-display text-2xl font-semibold text-navy">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-slate">{description}</p> : null}
      </div>
      {action && isHeaderAction(action) ? (
        <Button asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      ) : (
        action
      )}
    </div>
  );
}

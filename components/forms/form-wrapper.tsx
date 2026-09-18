"use client";

import { ReactNode } from "react";
import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";

interface FormWrapperProps {
  action: (formData: FormData) => Promise<void>;
  children: ReactNode;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function FormWrapper({ action, children, submitLabel = "Save", isSubmitting = false }: FormWrapperProps) {
  const [state, formAction] = useFormState(async (_state: string | null, formData: FormData) => {
    await action(formData);
    return null;
  }, null);

  return (
    <form action={formAction} className="grid gap-4">
      {children}
      {state && typeof state === "string" && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-900">
          {state}
        </div>
      )}
      <Button type="submit" disabled={isSubmitting} className="justify-self-start">
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
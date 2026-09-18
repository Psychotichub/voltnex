"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await signIn("credentials", {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
      router.push(callbackUrl ?? "/dashboard");
      router.refresh();
    });
  }

  return (
    <main className="grid min-h-screen bg-paper lg:grid-cols-[1fr_520px]">
      <section className="hidden bg-navy px-12 py-10 text-paper lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-brass" />
          <span className="font-display text-xl font-semibold">VoltNex Engineering</span>
        </div>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brass">Contractor ERP</p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-tight">
            Electrical project control from estimate to handover.
          </h1>
          <p className="mt-5 text-lg leading-8 text-paper/70">
            Manage BOQ, quotations, invoices, materials, labour, project costing, and company governance in NPR.
          </p>
        </div>
        <p className="text-sm text-paper/50">Demo admin: admin@voltnex.com / VoltNex@2026</p>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <form action={submit} className="w-full max-w-sm rounded-lg border border-line bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brass">Secure staff access</p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-navy">Sign in</h1>
          </div>
          <div className="grid gap-4">
            <Field label="Email">
              <Input name="email" type="email" defaultValue="admin@voltnex.com" autoComplete="email" required />
            </Field>
            <Field label="Password">
              <Input name="password" type="password" defaultValue="VoltNex@2026" autoComplete="current-password" required />
            </Field>
            {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}

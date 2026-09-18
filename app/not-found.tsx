import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper">
      <h1 className="font-display text-7xl font-semibold text-navy">404</h1>
      <p className="mt-4 text-lg text-slate">Page not found.</p>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}

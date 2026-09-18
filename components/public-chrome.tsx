import Link from "next/link";
import { Phone, Zap } from "lucide-react";
import { PUBLIC_NAV } from "@/lib/nav";
import { prisma } from "@/lib/db";

export async function PublicHeader() {
  const company = await prisma.company.findFirst();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-navy text-paper">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-brass" />
          <span className="font-display text-lg font-semibold">{company?.name ?? "VoltNex Engineering"}</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm md:flex">
          {PUBLIC_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-paper/80 hover:text-brass">
              {item.label}
            </Link>
          ))}
          <Link href="/login" className="rounded-md bg-brass px-3 py-1.5 font-medium text-navy">
            Staff login
          </Link>
        </nav>
        <Link href="/contact" className="md:hidden text-brass">
          Contact
        </Link>
      </div>
    </header>
  );
}

export async function PublicFooter() {
  const company = await prisma.company.findFirst();
  const phone = company?.phone ?? "+977-1-5900000";
  const wa = company?.whatsappNumber ?? "9779800000000";
  return (
    <footer className="mt-auto border-t border-line bg-navy text-paper">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="font-display text-lg">{company?.name}</p>
          <p className="mt-2 max-w-sm text-sm text-paper/70">{company?.address}</p>
        </div>
        <div className="text-sm text-paper/80">
          <p>{company?.email}</p>
          <p>{phone}</p>
          <p>{company?.website}</p>
        </div>
        <div className="flex items-start gap-3">
          <a
            href={`https://wa.me/${wa.replace(/\D/g, "")}`}
            className="rounded-md bg-brass px-3 py-2 text-sm font-medium text-navy"
          >
            WhatsApp
          </a>
          <a href={`tel:${phone}`} className="inline-flex items-center gap-1 rounded-md border border-white/20 px-3 py-2 text-sm">
            <Phone className="h-4 w-4" /> Call
          </a>
        </div>
      </div>
    </footer>
  );
}

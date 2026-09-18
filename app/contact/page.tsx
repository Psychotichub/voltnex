import { Phone, MapPin, Clock, Send } from "lucide-react";
import { prisma } from "@/lib/db";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | VoltNex Engineering",
  description: "Get in touch with VoltNex Engineering for electrical contracting, BOQ, and project management services in Nepal.",
  openGraph: { title: "Contact Us | VoltNex Engineering", description: "Reach out to our team.", type: "website" },
};

export default async function ContactPage() {
  const company = await prisma.company.findFirst();

  return (
    <div className="min-h-screen bg-paper">
      <main className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="font-display text-4xl font-semibold text-navy">Contact {company?.name ?? "VoltNex Engineering"}</h1>
        <p className="mt-4 text-lg text-slate">Get in touch with our team.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-brass" />
              <span className="text-slate">{company?.phone ?? "+977-1-XXXXXXX"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-brass" />
              <span className="text-slate">Mon - Sat: 9:00 AM - 6:00 PM</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-brass" />
              <span className="text-slate">{company?.address ?? "Kathmandu, Nepal"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Send className="h-5 w-5 text-brass" />
              <span className="text-slate">{company?.email ?? "info@voltnex.com"}</span>
            </div>
          </div>
          <div className="rounded-lg border border-line bg-white p-6">
            <h2 className="font-display text-xl font-semibold text-navy">Send us a message</h2>
            <form className="mt-4 grid gap-4">
              <div>
                <label className="text-sm font-medium text-slate">Name</label>
                <input type="text" className="mt-1 h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm" placeholder="Your name" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate">Email</label>
                <input type="email" className="mt-1 h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm" placeholder="Your email" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate">Message</label>
                <textarea className="mt-1 h-24 w-full rounded-md border border-line bg-white px-3 text-sm text-navy shadow-sm" placeholder="Your message" />
              </div>
              <button type="submit" className="rounded-md bg-navy px-4 py-2 text-sm text-paper">Send Message</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

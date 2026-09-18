import { Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Team | VoltNex Engineering",
  description: "Meet the licensed professional engineers and technicians behind VoltNex Engineering in Nepal.",
  openGraph: { title: "Our Team | VoltNex Engineering", description: "Licensed professional engineers.", type: "website" },
};

export default async function TeamPage() {
  const [users] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, role: true, phone: true },
      take: 20,
    }),
  ]);

  return (
    <div className="min-h-screen bg-paper">
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="font-display text-4xl font-semibold text-navy">Our Team</h1>
        <p className="mt-4 text-lg text-slate">Meet the professionals behind VoltNex Engineering.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div key={user.id} className="rounded-lg border border-line bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-paper font-display text-lg font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-navy">{user.name}</h3>
                  <p className="text-sm text-slate capitalize">{user.role.replaceAll("_", " ")}</p>
                  <p className="text-sm text-slate">{user.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

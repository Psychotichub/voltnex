import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

  const [projects, clients] = await Promise.all([
    prisma.project.findMany({ where: { deletedAt: null }, select: { id: true, code: true } }),
    prisma.client.findMany({ where: { deletedAt: null }, select: { id: true, company: true } }),
  ]);

  const pages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/work`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/industries`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/team`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/certifications`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  for (const p of projects) {
    pages.push({ url: `${base}/projects/${p.id}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 });
  }
  for (const c of clients) {
    pages.push({ url: `${base}/clients/${c.id}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 });
  }

  return pages;
}

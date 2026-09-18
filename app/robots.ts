import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const site = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/login", "/(app)/"],
    },
    sitemap: `${site}/sitemap.xml`,
  };
}

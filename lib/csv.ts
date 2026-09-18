import { NextResponse } from "next/server";

export function toCSV(rows: Record<string, string | number | null | undefined>[], filename: string): NextResponse {
  if (rows.length === 0) {
    return NextResponse.json({ error: "No data" }, { status: 400 });
  }
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number | null | undefined) => {
    const s = v == null ? "" : String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h] ?? "")).join(","))].join("\n");
  const buffer = new TextEncoder().encode(`\uFEFF${csv}`);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

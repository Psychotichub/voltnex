"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type Hit = { type: string; id: string; title: string; href: string };

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { results: Hit[] };
      setHits(data.results);
    }, 200);
    return () => clearTimeout(t);
  }, [q, open]);

  const grouped = useMemo(() => {
    const map = new Map<string, Hit[]>();
    for (const hit of hits) {
      map.set(hit.type, [...(map.get(hit.type) ?? []), hit]);
    }
    return map;
  }, [hits]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-md items-center gap-2 rounded-md border border-line bg-paper px-3 text-sm text-slate"
      >
        <Search className="h-4 w-4" />
        Search records
        <kbd className="ml-auto rounded border border-line bg-white px-1.5 text-[10px]">Ctrl K</kbd>
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-navy/40 p-4 pt-24" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-xl overflow-hidden rounded-xl border border-line bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search projects, clients, materials, invoices..."
              className="h-12 w-full border-b border-line px-4 text-sm outline-none"
            />
            <div className="max-h-80 overflow-y-auto p-2">
              {hits.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-slate">No matching records.</p>
              ) : (
                [...grouped.entries()].map(([type, rows]) => (
                  <div key={type} className="mb-2">
                    <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate">{type}</p>
                    {rows.map((hit) => (
                      <button
                        key={hit.id}
                        className="block w-full rounded-md px-2 py-2 text-left text-sm hover:bg-paper"
                        onClick={() => {
                          setOpen(false);
                          router.push(hit.href);
                        }}
                      >
                        {hit.title}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

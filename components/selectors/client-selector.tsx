"use client";

import { useState } from "react";
import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  company?: string;
  type: string;
}

interface ClientSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  clients?: Client[];
  placeholder?: string;
  className?: string;
}

export function ClientSelector({
  value,
  onChange,
  clients = [],
  placeholder = "Select client",
  className,
}: ClientSelectorProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      (client.company && client.company.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedClient = clients.find((c) => c.id === value);

  return (
    <div className={cn("relative", className)}>
      <Field label="Client">
        <div className="relative">
          <Input
            value={selectedClient ? `${selectedClient.name}${selectedClient.company ? ` (${selectedClient.company})` : ""}` : search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            placeholder={placeholder}
            className="cursor-pointer"
          />
          {isOpen && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-line bg-white shadow-lg">
              {filteredClients.length === 0 ? (
                <div className="p-3 text-sm text-slate">No clients found</div>
              ) : (
                filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="cursor-pointer px-3 py-2 text-sm hover:bg-slate-50"
                    onClick={() => {
                      onChange(client.id);
                      setSearch("");
                      setIsOpen(false);
                    }}
                  >
                    <div className="font-medium text-navy">{client.name}</div>
                    {client.company && (
                      <div className="text-xs text-slate">{client.company}</div>
                    )}
                    <div className="text-xs text-slate">{client.type}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </Field>
    </div>
  );
}
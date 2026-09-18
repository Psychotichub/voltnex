"use client";

import { useState, useEffect } from "react";
import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  code: string;
  name: string;
  client: { name: string };
}

interface ProjectSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  projects?: Project[];
  placeholder?: string;
  className?: string;
}

export function ProjectSelector({
  value,
  onChange,
  projects = [],
  placeholder = "Select project",
  className,
}: ProjectSelectorProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.code.toLowerCase().includes(search.toLowerCase())
  );

  const selectedProject = projects.find((p) => p.id === value);

  return (
    <div className={cn("relative", className)}>
      <Field label="Project">
        <div className="relative">
          <Input
            value={selectedProject ? `${selectedProject.code} - ${selectedProject.name}` : search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            placeholder={placeholder}
            className="cursor-pointer"
          />
          {isOpen && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-line bg-white shadow-lg">
              {filteredProjects.length === 0 ? (
                <div className="p-3 text-sm text-slate">No projects found</div>
              ) : (
                filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="cursor-pointer px-3 py-2 text-sm hover:bg-slate-50"
                    onClick={() => {
                      onChange(project.id);
                      setSearch("");
                      setIsOpen(false);
                    }}
                  >
                    <div className="font-medium text-navy">{project.code}</div>
                    <div className="text-xs text-slate">{project.name}</div>
                    <div className="text-xs text-slate">{project.client.name}</div>
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
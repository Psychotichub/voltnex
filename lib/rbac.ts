import { Role } from "@prisma/client";

export type Permission =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "export"
  | "upload"
  | "manage_users"
  | "finance"
  | "estimate"
  | "site";

const ALL: Permission[] = [
  "view",
  "create",
  "edit",
  "delete",
  "approve",
  "export",
  "upload",
  "manage_users",
  "finance",
  "estimate",
  "site",
];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: ALL,
  DIRECTOR: ALL.filter((p) => p !== "manage_users"),
  PROJECT_MANAGER: [
    "view",
    "create",
    "edit",
    "approve",
    "export",
    "upload",
    "estimate",
    "site",
    "finance",
  ],
  ENGINEER: ["view", "create", "edit", "export", "upload", "estimate", "site"],
  ESTIMATOR: ["view", "create", "edit", "export", "estimate"],
  SITE_SUPERVISOR: ["view", "create", "edit", "upload", "site"],
  ELECTRICIAN: ["view", "upload", "site"],
  ACCOUNTANT: ["view", "create", "edit", "export", "finance"],
  VIEWER: ["view"],
};

export function can(role: Role | undefined, permission: Permission) {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canAccessModule(role: Role | undefined, module: string) {
  if (!role) return false;
  if (module === "reports" || module === "payments" || module === "invoices" || module === "costing") {
    if (role === "ELECTRICIAN") return false;
    if (role === "VIEWER") return module === "reports" ? false : true;
  }
  if (module === "users" || module === "settings") {
    return role === "ADMIN" || role === "DIRECTOR";
  }
  if ((module === "boq" || module === "quotations") && role === "ELECTRICIAN") return false;
  return true;
}

export function roleLabel(role: Role) {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

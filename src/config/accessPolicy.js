export const ROLES = Object.freeze({
  OWNER: "owner",
  ADMIN: "admin",
});

export const PRIVILEGED_ROLES = Object.freeze([ROLES.OWNER, ROLES.ADMIN]);

export const OWNER_ONLY_PATHS = Object.freeze([
  "/product-management",
  "/service-management",
  "/finance-tracking",
  "/technician-payouts",
  "/commission-management",
  "/admin-payments",
  "/rewards",
  "/product-insights",
  "/credentials",
]);

export const normalizeRole = (role) =>
  (role || "").toString().trim().toLowerCase();

export const isOwnerRole = (role) => normalizeRole(role) === ROLES.OWNER;

export const isAdminRole = (role) => normalizeRole(role) === ROLES.ADMIN;

export const isPrivilegedRole = (role) =>
  PRIVILEGED_ROLES.includes(normalizeRole(role));

const normalizePath = (path) => {
  const raw = String(path || "").split("?")[0].split("#")[0];
  const withoutLayout = raw.startsWith("/owner/")
    ? raw.slice("/owner".length)
    : raw === "/owner"
    ? "/"
    : raw;
  if (!withoutLayout) return "/";
  return withoutLayout.length > 1
    ? withoutLayout.replace(/\/+$/, "")
    : withoutLayout;
};

export const canAccessPath = (role, path) => {
  const normalizedRole = normalizeRole(role);
  if (!isPrivilegedRole(normalizedRole)) return false;
  if (isOwnerRole(normalizedRole)) return true;
  return !OWNER_ONLY_PATHS.includes(normalizePath(path));
};

export const canAccessRoute = (role, route) => {
  const normalizedRole = normalizeRole(role);
  if (!isPrivilegedRole(normalizedRole) || !route) return false;
  if (Array.isArray(route.roles) && route.roles.length > 0) {
    return route.roles.map(normalizeRole).includes(normalizedRole);
  }
  return canAccessPath(normalizedRole, route.path);
};

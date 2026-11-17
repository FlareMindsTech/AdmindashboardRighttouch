import {
  canAccessPath,
  canAccessRoute,
  isAdminRole,
  isOwnerRole,
  isPrivilegedRole,
  normalizeRole,
  OWNER_ONLY_PATHS,
} from "./accessPolicy";

describe("accessPolicy", () => {
  test("normalizes roles and rejects non-privileged accounts", () => {
    expect(normalizeRole(" Owner ")).toBe("owner");
    expect(isOwnerRole("OWNER")).toBe(true);
    expect(isAdminRole("Admin")).toBe(true);
    expect(isPrivilegedRole("Customer")).toBe(false);
    expect(isPrivilegedRole("")).toBe(false);
  });

  test("Owner can access every registered path", () => {
    OWNER_ONLY_PATHS.forEach((path) => {
      expect(canAccessPath("owner", path)).toBe(true);
    });
    expect(canAccessPath("owner", "/admin-management")).toBe(true);
  });

  test("Admin is denied owner-only modules", () => {
    OWNER_ONLY_PATHS.forEach((path) => {
      expect(canAccessPath("admin", path)).toBe(false);
    });
  });

  test("Admin can access shared operational modules", () => {
    [
      "/dashboard",
      "/admin-management",
      "/user-management",
      "/city-zones",
      "/scheduling-ops",
      "/dispatch-ops",
      "/reports-ratings",
      "/skill-requests",
      "/permissions",
      "/profile",
    ].forEach((path) => {
      expect(canAccessPath("admin", path)).toBe(true);
    });
  });

  test("layout-prefixed paths use the same policy", () => {
    expect(canAccessPath("admin", "/owner/reports-ratings")).toBe(true);
    expect(canAccessPath("admin", "/owner/finance-tracking")).toBe(false);
    expect(canAccessPath("owner", "/owner/finance-tracking")).toBe(true);
  });

  test("route metadata is authoritative for explicit role lists", () => {
    expect(
      canAccessRoute("admin", { path: "/dashboard", roles: ["owner", "admin"] })
    ).toBe(true);
    expect(
      canAccessRoute("admin", { path: "/finance-tracking", roles: ["owner"] })
    ).toBe(false);
    expect(
      canAccessRoute("owner", { path: "/finance-tracking", roles: ["owner"] })
    ).toBe(true);
  });

  test("unauthenticated and unknown roles fail closed", () => {
    expect(canAccessPath("", "/dashboard")).toBe(false);
    expect(canAccessPath("customer", "/dashboard")).toBe(false);
    expect(canAccessRoute(null, { path: "/dashboard" })).toBe(false);
  });
});

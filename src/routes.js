
import React from "react";
import Dashboard from "views/Dashboard/Dashboard.js";
import Billing from "views/Dashboard/Billing.js";
import Profile from "views/Dashboard/Profile.js";
import SignIn from "views/Pages/SignIn.js";
import AdminManagement from "views/Dashboard/AdminManagement.js"; 
import UserManagement from "views/Dashboard/UserManagement.js"; 
import ServiceManagement from "views/Dashboard/ServiceManagement.js";
import { MdLogout } from "react-icons/md";

import {
  HomeIcon,
  StatsIcon,
  CreditIcon,
} from "components/Icons/Icons";

import ProductManagement from "views/Dashboard/ProductManagement";

const ICON_COLOR = "#008080";


const Logout = () => {
  localStorage.clear();
  sessionStorage.clear();
  const base = window.location.origin + window.location.pathname;
  window.location.replace(`${base}#/auth/signin`);
  return <div>Logging out...</div>;
};

const getCurrentUserRole = () => {
  const userString = localStorage.getItem("user");
  if (!userString) return "";

  try {
    const userData = JSON.parse(userString);
    return userData.role?.toLowerCase() || "";
  } catch (error) {
    return "";
  }
};

const userRole = getCurrentUserRole();


const isOwner = userRole === "owner";
console.log("User Role:", userRole);
console.log("Is Owner:", isOwner);

const dashRoutes = [
  // ---------------- OWNER ONLY ROUTES ----------------
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: <HomeIcon color="#008080" />,
    element: <Dashboard />,
    layout: "/owner",
  },
  {
    path: "/admin-management",
    name: "Technician Management",
    icon: <StatsIcon color="#008080" />,
    element: <AdminManagement />,
    layout: "/owner",
  },
  {
    path: "/service-management",
    name: "Service Management",
    icon: <StatsIcon color="#008080" />,
    element: <ServiceManagement />,
    layout: "/owner",
  },
  {
    path: "/product-management",
    name: "Product Management",
    icon: <StatsIcon color="#008080" />,
    element: <ProductManagement />,
    layout: "/owner",
  },
  /* {
    path: "/user-management",
    name: "User Management",
    icon: <StatsIcon color="#008080" />,
    element: <UserManagement />,
    layout: "/owner",
  }, */
  {
    path: "/billing",
    name: "Billing",
    icon: <CreditIcon color="#008080" />,
    element: <Billing />,
    layout: "/owner",
  },
  {
    path: "/profile",
    name: "Profile",
    element: <Profile />,
    layout: "/owner",
  },

  // ---------------- PUBLIC ROUTES ----------------
  {
    path: "/signin",
    name: "Sign In",
    icon: <MdLogout color={ICON_COLOR} />,
    element: <SignIn />,
    layout: "/auth",
  },
  {
    path: "/logout",
    name: "Logout",
    icon: <MdLogout color={ICON_COLOR} />,
    element: <Logout />,
    layout: "/owner",
  },
];

export default dashRoutes;

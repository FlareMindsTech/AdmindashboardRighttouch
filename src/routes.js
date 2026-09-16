
import React, { lazy } from "react";

// Lazy-loaded views for on-demand bundle splitting & fast initial paint
const Dashboard = lazy(() => import("views/Dashboard/Dashboard.js"));
const Billing = lazy(() => import("views/Dashboard/Billing.js"));
const Profile = lazy(() => import("views/Dashboard/Profile.js"));
const SignIn = lazy(() => import("views/Pages/SignIn.js"));
const AdminManagement = lazy(() => import("views/Dashboard/AdminManagement.js")); 
const UserManagement = lazy(() => import("views/Dashboard/UserManagement.js")); 
const ServiceManagement = lazy(() => import("views/Dashboard/ServiceManagement.js"));
const ReportsManagement = lazy(() => import("views/Dashboard/ReportsManagement.js"));
const CommissionManagement = lazy(() => import("views/Dashboard/CommissionManagement.js"));
const CityZones = lazy(() => import("views/Dashboard/CityZones.js"));
const FinanceTracking = lazy(() => import("views/Dashboard/FinanceTracking.js"));
const TechnicianPayouts = lazy(() => import("views/Dashboard/TechnicianPayouts.js"));
const ProductManagement = lazy(() => import("views/Dashboard/ProductManagement"));

// Icons for Sidebar Navigation
import { 
  MdLogout, 
  MdLogin, 
  MdHomeRepairService, 
  MdInventory2, 
  MdReceiptLong, 
  MdPayments 
} from "react-icons/md";
import { 
  FaUserGear, 
  FaUsers, 
  FaHandHoldingDollar, 
  FaMapLocationDot, 
  FaChartLine 
} from "react-icons/fa6";
import { HiDocumentChartBar } from "react-icons/hi2";

import {
  HomeIcon,
} from "components/Icons/Icons";

import { clearAuth } from "views/utils/axiosInstance";

const ICON_COLOR = "#008080";
const ICON_SIZE = 20;

const Logout = () => {
  clearAuth();
  const base = window.location.origin + window.location.pathname;
  window.location.replace(`${base}#/auth/signin`);
  return <div>Logging out...</div>;
};

const getCurrentUserRole = () => {
  const userString = localStorage.getItem("user") || sessionStorage.getItem("user");
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
    icon: <HomeIcon color={ICON_COLOR} />,
    element: <Dashboard />,
    layout: "/owner",
  },
  {
    path: "/product-management",
    name: "Product Management",
    icon: <MdInventory2 color={ICON_COLOR} size={ICON_SIZE} />,
    element: <ProductManagement />,
    layout: "/owner",
  },
  {
    path: "/service-management",
    name: "Service Management",
    icon: <MdHomeRepairService color={ICON_COLOR} size={ICON_SIZE} />,
    element: <ServiceManagement />,
    layout: "/owner",
  },
  {
    path: "/admin-management",
    name: "Technician Management",
    icon: <FaUserGear color={ICON_COLOR} size={ICON_SIZE} />,
    element: <AdminManagement />,
    layout: "/owner",
  },
  {
    path: "/user-management",
    name: "User Management",
    icon: <FaUsers color={ICON_COLOR} size={ICON_SIZE} />,
    element: <UserManagement />,
    layout: "/owner",
  },
  {
    path: "/city-zones",
    name: "City Zone",
    icon: <FaMapLocationDot color={ICON_COLOR} size={ICON_SIZE} />,
    element: <CityZones />,
    layout: "/owner",
  },
  {
    path: "/technician-payouts",
    name: "Pay to Technician",
    icon: <MdPayments color={ICON_COLOR} size={ICON_SIZE} />,
    element: <TechnicianPayouts />,
    layout: "/owner",
  },
  {
    path: "/commission-management",
    name: "Commission Management",
    icon: <FaHandHoldingDollar color={ICON_COLOR} size={ICON_SIZE} />,
    element: <CommissionManagement />,
    layout: "/owner",
  },
  {
    path: "/reports-ratings",
    name: "Report & Ratings",
    icon: <HiDocumentChartBar color={ICON_COLOR} size={ICON_SIZE} />,
    element: <ReportsManagement />,
    layout: "/owner",
  },
  {
    path: "/finance-tracking",
    name: "Finance Tracking",
    icon: <FaChartLine color={ICON_COLOR} size={ICON_SIZE} />,
    element: <FinanceTracking />,
    layout: "/owner",
  },
  {
    path: "/billing",
    name: "Billing",
    icon: <MdReceiptLong color={ICON_COLOR} size={ICON_SIZE} />,
    element: <Billing />,
    layout: "/owner",
    hideInSidebar: true,
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
    icon: <MdLogin color={ICON_COLOR} size={ICON_SIZE} />,
    element: <SignIn />,
    layout: "/auth",
  },
  {
    path: "/logout",
    name: "Logout",
    icon: <MdLogout color={ICON_COLOR} size={ICON_SIZE} />,
    element: <Logout />,
    layout: "/owner",
  },
];

export default dashRoutes;

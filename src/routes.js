
import React, { lazy } from "react";

// Icons for Sidebar Navigation
import {
  MdLogout,
  MdLogin,
  MdHomeRepairService,
  MdInventory2,
  MdReceiptLong,
  MdPayments,
  MdInsights,
} from "react-icons/md";
import {
  FaUserGear,
  FaUsers,
  FaHandHoldingDollar,
  FaMapLocationDot,
  FaChartLine,
  FaTruckFast,
  FaGift,
  FaWallet,
  FaUserShield,
} from "react-icons/fa6";
import { FaTools } from "react-icons/fa";
import { HiDocumentChartBar } from "react-icons/hi2";

import {
  HomeIcon,
} from "components/Icons/Icons";

import { clearAuth } from "views/utils/axiosInstance";
import { useDispatch } from "react-redux";
import { logout } from "store/slices/authSlice";

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
const SkillRequests = lazy(() => import("views/Dashboard/SkillRequests.js"));
const DispatchOps = lazy(() => import("views/Dashboard/DispatchOps.js"));
const RewardsManagement = lazy(() => import("views/Dashboard/RewardsManagement.js"));
const ProductInsights = lazy(() => import("views/Dashboard/ProductInsights.js"));
const AdminPayments = lazy(() => import("views/Dashboard/AdminPayments.js"));
const PermissionsManagement = lazy(() => import("views/Dashboard/PermissionsManagement.js"));

const ICON_COLOR = "#008080";
const ICON_SIZE = 20;

const Logout = () => {
  // Keep legacy storage cleanup (canonical path) and sync Redux state.
  // Rendered as a route element inside the Redux Provider.
  const dispatch = useDispatch();
  try {
    dispatch(logout());
  } catch (e) {
    clearAuth();
  }
  const base = window.location.origin + window.location.pathname;
  window.location.replace(`${base}#/auth/signin`);
  return <div>Logging out...</div>;
};

// NOTE (Phase 2): the previous module-level role snapshot
// (getCurrentUserRole/userRole/isOwner evaluated once at import) was removed.
// It went stale after login/logout until a full reload. Owner gating now
// subscribes via Redux selectors (layouts/Admin.js, index.js AuthRedirect).

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
    path: "/skill-requests",
    name: "Skill Requests",
    icon: <FaTools color={ICON_COLOR} size={ICON_SIZE} />,
    element: <SkillRequests />,
    layout: "/owner",
  },
  {
    path: "/dispatch-ops",
    name: "Dispatch Ops",
    icon: <FaTruckFast color={ICON_COLOR} size={ICON_SIZE} />,
    element: <DispatchOps />,
    layout: "/owner",
  },
  {
    path: "/rewards",
    name: "Rewards",
    icon: <FaGift color={ICON_COLOR} size={ICON_SIZE} />,
    element: <RewardsManagement />,
    layout: "/owner",
  },
  {
    path: "/product-insights",
    name: "Product Insights",
    icon: <MdInsights color={ICON_COLOR} size={ICON_SIZE} />,
    element: <ProductInsights />,
    layout: "/owner",
  },
  {
    path: "/admin-payments",
    name: "Admin Payments",
    icon: <FaWallet color={ICON_COLOR} size={ICON_SIZE} />,
    element: <AdminPayments />,
    layout: "/owner",
  },
  {
    path: "/permissions",
    name: "Permissions",
    icon: <FaUserShield color={ICON_COLOR} size={ICON_SIZE} />,
    element: <PermissionsManagement />,
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

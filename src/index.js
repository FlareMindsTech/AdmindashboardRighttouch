import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "layouts/Auth.js";
import AdminLayout from "layouts/Admin.js";
import AccessDenied from "views/Pages/AccessDenied";

import { ChakraProvider } from "@chakra-ui/react";
import { Provider } from "react-redux";
import store from "store/store";
import theme from "theme/theme.js";
import { initializeAuth, selectIsOwner } from "store/slices/authSlice";
import { useAppSelector } from "store/hooks";

// Restore the pre-Redux session once, before any guard decides.
store.dispatch(initializeAuth());

// Dynamic redirect component based on authentication state
const AuthRedirect = () => {
  const isOwner = useAppSelector(selectIsOwner);
  return isOwner ? <Navigate to="/owner/dashboard" replace /> : <Navigate to="/auth/signin" replace />;
};

ReactDOM.render(
  <Provider store={store}>
  <ChakraProvider theme={theme} resetCss={false} position="relative">
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Auth routes */}
        <Route path="/auth/*" element={<AuthLayout />} />

        {/*  ONLY OWNER ROUTES */}
        <Route path="/owner/*" element={<AdminLayout />} />

        <Route
          path="/admin/*"
          element={<AuthRedirect />}
        />

        <Route path="/access-denied" element={<AccessDenied />} />

        <Route
          path="/"
          element={<AuthRedirect />}
        />

        <Route
          path="*"
          element={<AuthRedirect />}
        />
      </Routes>
    </HashRouter>
  </ChakraProvider>
  </Provider>,
  document.getElementById("root")
);

import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "layouts/Auth.js";
import AdminLayout from "layouts/Admin.js";
import AccessDenied from "views/Pages/AccessDenied";

import { ChakraProvider } from "@chakra-ui/react";
import theme from "theme/theme.js";

ReactDOM.render(
  <ChakraProvider theme={theme} resetCss={false} position="relative">
    <HashRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/auth/*" element={<AuthLayout />} />
        
        {/*  ONLY OWNER ROUTES */}
        <Route path="/owner/*" element={<AdminLayout />} />
        
        
        <Route 
          path="/admin/*" 
          element={
            localStorage.getItem("user") ? 
            <Navigate to="/owner/dashboard" replace /> : 
            <Navigate to="/auth/signin" replace />
          } 
        />
  
        <Route path="/access-denied" element={<AccessDenied />} />

        <Route 
          path="/" 
          element={
            localStorage.getItem("user") ? 
            <Navigate to="/owner/dashboard" replace /> : 
            <Navigate to="/auth/signin" replace />
          } 
        />

        
        <Route 
          path="*" 
          element={
            localStorage.getItem("user") ? 
            <Navigate to="/owner/dashboard" replace /> : 
            <Navigate to="/auth/signin" replace />
          } 
        />
      </Routes>
    </HashRouter>
  </ChakraProvider>,
  document.getElementById("root")
);
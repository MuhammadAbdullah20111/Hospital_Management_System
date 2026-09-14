import { Routes, Route, Navigate } from "react-router-dom";
import AdminRoutes from "./admin";
import StaffRoutes from "./staff";
import AuthRoutes from "./auth";
import Unauthorized from "../pages/Unauthorized";

// Layouts
import WebLayout from "../layouts/WebLayout";

// Web Pages
import Home from "../pages/web/Home";
import About from "../pages/web/About";
import Services from "../pages/web/Services";
import Doctors from "../pages/web/Doctors";
import Contact from "../pages/web/Contact";

/**
 * Main App Router
 * Integrates all sub-route modules.
 * Note: Sub-routers like AdminRoutes must use wildcard paths in the parent route
 * or handle their own Routes wrapper if imported as a component.
 * Here we use the /* wildcard to delegate routing to sub-components.
 */
const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Website Routes */}
            <Route element={<WebLayout />} >
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/contact" element={<Contact />} />
            </Route>

            {/* Redirect old login path to proper auth route */}
            <Route path="/login" element={<Navigate to="/auth/staff/login" replace />} />

            {/* Auth Routes */}
            <Route path="/auth/*" element={<AuthRoutes />} />

            {/* Admin Routes - Protected inside the component itself, but mounted here */}
            <Route path="/admin/*" element={<AdminRoutes />} />

            {/* Staff Routes - Protected inside the component itself, but mounted here */}
            <Route path="/staff/*" element={<StaffRoutes />} />

            {/* Error Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />


            {/* 404 Fallback */}
            <Route path="*" element={<div className="p-4 text-center">404 - Not Found</div>} />
        </Routes>
    );
};

export default AppRoutes;

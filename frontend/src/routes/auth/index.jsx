import { Route, Routes, Navigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import AdminLogin from "../../pages/auth/admin/Login";
import AdminForgotPassword from "../../pages/auth/admin/ForgotPassword";
import AdminResetPassword from "../../pages/auth/admin/ResetPassword";
import StaffLogin from "../../pages/auth/staff/Login";
import StaffForgotPassword from "../../pages/auth/staff/ForgotPassword";
import StaffResetPassword from "../../pages/auth/staff/ResetPassword";
import LogoutSummary from "../../pages/auth/LogoutSummary";

const AuthRoutes = () => {
    return (
        <Routes>
            {/* Logout summary — standalone, no AuthLayout wrapper */}
            <Route path="logout-summary" element={<LogoutSummary />} />

            <Route element={<AuthLayout />}>
                <Route path="admin/login" element={<AdminLogin />} />
                <Route path="admin/forgot-password" element={<AdminForgotPassword />} />
                <Route path="admin/reset-password" element={<AdminResetPassword />} />
                <Route path="staff/login" element={<StaffLogin />} />
                <Route path="staff/forgot-password" element={<StaffForgotPassword />} />
                <Route path="staff/reset-password" element={<StaffResetPassword />} />
            </Route>
        </Routes>
    );
};

export default AuthRoutes;

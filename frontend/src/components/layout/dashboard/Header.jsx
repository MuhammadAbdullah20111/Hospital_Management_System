import { Bell, User, LogOut, Settings, ChevronDown } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { adminLogoutAPI } from "../../../api/admin/auth";
import { removeFromLocalStorage } from "../../../helpers/localStorageFile";
import { toast } from "react-hot-toast";
import ApiService from "../../../services/ApiService";

const Header = ({ user }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const navigate = useNavigate();



    const handleLogout = async () => {
        try {
            const role = localStorage.getItem('role')?.toUpperCase();

            // Capture session data before clearing storage
            const loginTime = localStorage.getItem('loginTime') || null;  // null = not tracked
            const logoutTime = new Date().toISOString();

            if (role === 'ADMIN') {
                await adminLogoutAPI();
            }
            // For staff, we just clear local storage as there is no specific logout endpoint
            removeFromLocalStorage("token");
            removeFromLocalStorage("role");
            removeFromLocalStorage("user");
            removeFromLocalStorage("userId");
            removeFromLocalStorage("name");
            removeFromLocalStorage("loginTime");

            // Navigate to logout summary page with session info
            navigate("/auth/logout-summary", {
                replace: true,
                state: { loginTime, logoutTime, role: role || "STAFF" },
            });
        } catch (error) {
            console.error("Logout failed:", error);
            // Still clear local storage and redirect even if API fails
            removeFromLocalStorage("token");
            removeFromLocalStorage("role");
            removeFromLocalStorage("loginTime");
            navigate("/auth/logout-summary", { replace: true });
        }
    };

    return (
        <nav className="fixed top-0 z-30 w-full border-b border-slate-200 bg-white sm:pl-64">
            <div className="px-3 py-3 lg:px-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start rtl:justify-end">
                        <h2 className="text-xl font-bold text-teal-600 sm:hidden">MKMC</h2>
                    </div>

                    <div className="flex items-center">
                        <div className="ml-3 flex items-center gap-3">


                            {/* Profile Menu - Hover Based */}
                            <div
                                className="relative py-1"
                                onMouseEnter={() => setIsProfileOpen(true)}
                                onMouseLeave={() => setIsProfileOpen(false)}
                            >
                                <button
                                    className="flex items-center gap-2 rounded-lg py-1 px-2 hover:bg-slate-50 transition-all duration-200"
                                >
                                    <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                        {user?.profileImage ? (
                                            <img
                                                src={user.profileImage.startsWith('http') ? user.profileImage : `${import.meta.env.VITE_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${user.profileImage}`}
                                                alt="Profile"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-5 w-5 text-slate-500" />
                                        )}
                                    </div>
                                    <div className="hidden text-left sm:block">
                                        <p className="text-sm font-medium text-slate-700">
                                            {user?.name || 'User'}
                                        </p>
                                        <p className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider mt-0.5">
                                            {user?.role || 'Role'}
                                        </p>
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileOpen && (
                                    <div className="absolute z-50 w-48 mt-2 right-0 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-4 py-2 border-b border-slate-50">
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Account</p>
                                            <p className="text-sm font-medium text-slate-800 truncate">{user?.name}</p>
                                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">{user?.role}</p>
                                        </div>

                                        <Link
                                            to={user?.role === 'ADMIN' ? "/admin/dashboard/profile" : "/staff/profile"}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-teal-600 transition-colors"
                                        >
                                            <User className="h-4 w-4" />
                                            Settings
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;

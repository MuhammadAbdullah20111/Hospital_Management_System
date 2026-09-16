import LoadingPlaceholder from '../components/ui/LoadingPlaceholder';
import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/dashboard/Sidebar";
import Header from "../components/layout/dashboard/Header";
import Footer from "../components/layout/dashboard/Footer";
import { getAdminLayoutAPI } from "../api/admin/layout";
import { getStaffLayoutAPI } from "../api/staff/layout";
import { getFromLocalStorage } from "../helpers/localStorageFile";

const DashboardLayout = () => {
    const [layoutData, setLayoutData] = useState({
        user: null,
        sidebarOptions: [],
        isLoading: true
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    const closeSidebar = () => setIsSidebarOpen(false);

    useEffect(() => {
        const fetchLayoutData = async () => {
            try {
                const userType = getFromLocalStorage("userType");
                const role = getFromLocalStorage("role")?.toLowerCase();
                let response;

                if (userType === 'SYSTEM_ADMIN') {
                    response = await getAdminLayoutAPI();
                } else if (role || userType === 'STAFF') {
                    response = await getStaffLayoutAPI();
                } else {
                    // No role found, redirect to login
                    navigate('/login');
                    return;
                }

                if (response.success) {
                    // Store permissions if they exist in response (typically for staff)
                    if (response.permissions) {
                        localStorage.setItem("permissions", JSON.stringify(response.permissions));
                    }

                    // Store allowed paths if they exist
                    if (response.sidebarOptions) {
                        const allowedPaths = response.sidebarOptions.map(opt => opt.path).filter(Boolean);
                        localStorage.setItem("allowedPaths", JSON.stringify(allowedPaths));
                    }
                    setLayoutData({
                        user: response.user,
                        sidebarOptions: response.sidebarOptions,
                        isLoading: false
                    });
                }
            } catch (error) {
                console.error("Failed to fetch layout data:", error);
                setLayoutData(prev => ({ ...prev, isLoading: false }));
            }
        };

        fetchLayoutData();
    }, [navigate]);

    if (layoutData.isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-teal-50">
                <LoadingPlaceholder className="h-24 w-24" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-teal-50">
            <Header user={layoutData.user} onToggleSidebar={toggleSidebar} />

            <Sidebar menuItems={layoutData.sidebarOptions} isOpen={isSidebarOpen} onClose={closeSidebar} />

            <main className="flex-1 mt-14 p-4 sm:ml-64">
                <div className="mx-auto min-h-[calc(100vh-8rem)] w-full max-w-7xl p-4">
                    <Outlet />
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default DashboardLayout;

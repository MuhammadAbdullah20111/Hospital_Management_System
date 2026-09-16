import { Link, useLocation, useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { LogOut, X } from "lucide-react";

const Sidebar = ({ menuItems = [], isOpen = false, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleSignOut = () => {
        localStorage.clear();
        navigate("/login");
    };

    const handleLinkClick = () => {
        // Close sidebar on mobile when a link is clicked
        if (onClose) onClose();
    };

    return (
        <>
            {/* Overlay backdrop - visible only on mobile when sidebar is open */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm sm:hidden transition-opacity duration-300"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } sm:translate-x-0`}
            >
                <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
                    {/* Logo / Brand + Close button */}
                    <div className="mb-6 flex items-center justify-between pl-2.5">
                        <span className="self-center whitespace-nowrap text-xl font-bold text-teal-600">
                            MKMC Hospital
                        </span>
                        {/* Close button - visible only on mobile */}
                        <button
                            onClick={onClose}
                            className="inline-flex items-center rounded-lg p-1.5 text-slate-400 hover:bg-teal-50 hover:text-teal-600 sm:hidden transition-colors duration-200"
                            aria-label="Close sidebar"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Menu Items */}
                    <ul className="space-y-2 font-medium">
                        {menuItems.map((item, index) => {
                            const Icon = LucideIcons[item.icon] || LucideIcons.HelpCircle;
                            const isActive = location.pathname === item.path || 
                                             (item.path !== '/admin/dashboard' && 
                                              item.path !== '/staff' && 
                                              item.path !== '/' && 
                                              location.pathname.startsWith(`${item.path}/`));
                            return (
                                <li key={index}>
                                    <Link
                                        to={item.path}
                                        onClick={handleLinkClick}
                                        className={`group flex items-center rounded-lg p-2 ${isActive
                                            ? "bg-teal-600 text-white shadow-md"
                                            : "text-slate-900 hover:bg-teal-50"
                                            }`}
                                    >
                                        <Icon
                                            className={`h-5 w-5 transition-colors duration-75 ${isActive
                                                ? "text-white"
                                                : "text-slate-500 group-hover:text-slate-900"
                                                }`}
                                        />
                                        <span className="ml-3">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Footer / Logout */}
                    <div className="mt-auto border-t border-slate-200 pt-4">
                        <button onClick={handleSignOut} className="group flex w-full items-center rounded-lg p-2 text-slate-900 hover:bg-teal-50">
                            <LogOut className="h-5 w-5 text-slate-500 transition duration-75 group-hover:text-slate-900" />
                            <span className="ml-3 whitespace-nowrap">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;


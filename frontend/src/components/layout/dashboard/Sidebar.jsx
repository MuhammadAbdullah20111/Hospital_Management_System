import { Link, useLocation, useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { LogOut } from "lucide-react";

const Sidebar = ({ menuItems = [] }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleSignOut = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full border-r border-slate-200 bg-white transition-transform sm:translate-x-0">
            <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
                {/* Logo / Brand */}
                <div className="mb-6 flex items-center pl-2.5">
                    <span className="self-center whitespace-nowrap text-xl font-bold text-teal-600">
                        MKMC Hospital
                    </span>
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
    );
};

export default Sidebar;

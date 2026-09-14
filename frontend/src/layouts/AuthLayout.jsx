import { Outlet } from "react-router-dom";
import Header from "../components/layout/auth/Header";

const AuthLayout = () => {
    return (
        <div className="flex min-h-screen flex-col bg-teal-50">
            <Header />
            <main className="flex flex-1 flex-col items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AuthLayout;

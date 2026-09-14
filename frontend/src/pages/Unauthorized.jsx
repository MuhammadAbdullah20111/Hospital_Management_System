import { Link } from "react-router-dom";

const Unauthorized = () => {
    return (
        <div className="flex h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
            <h1 className="text-4xl font-bold text-red-600">403</h1>
            <p className="mt-2 text-xl text-slate-700 dark:text-slate-300">Unauthorized Access</p>
            <Link to="/" className="mt-4 text-blue-600 hover:underline">
                Go Back Home
            </Link>
        </div>
    );
};

export default Unauthorized;

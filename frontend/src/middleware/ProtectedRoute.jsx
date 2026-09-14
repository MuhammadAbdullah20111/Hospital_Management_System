import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/auth/login" replace />;
    }

    const isAuthorized = allowedRoles
        ? allowedRoles.some(r => r.toUpperCase() === role?.toUpperCase())
        : true;

    if (!isAuthorized) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;

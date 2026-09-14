import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getFromLocalStorage } from '../helpers/localStorageFile';

const PermissionGuard = () => {
    const location = useLocation();
    const role = getFromLocalStorage('role');
    const currentPath = location.pathname;

    if (role?.toUpperCase() === 'ADMIN') {
        return <Outlet />;
    }

    if (currentPath.startsWith('/staff/profile')) {
        return <Outlet />;
    }

    const storedAllowedPaths = getFromLocalStorage('allowedPaths');
    const allowedPaths = storedAllowedPaths ? JSON.parse(storedAllowedPaths) : [];

    const isAllowed = allowedPaths.some(allowed => {
        if (allowed === '/staff') {
            return currentPath === '/staff' || currentPath === '/staff/';
        }
        return currentPath.startsWith(allowed);
    });

    if (!isAllowed) {
        if ((currentPath === '/staff' || currentPath === '/staff/') && allowedPaths.length > 0) {
            return <Navigate to={allowedPaths[0]} replace />;
        }
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default PermissionGuard;

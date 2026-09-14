import { sidebarConfig } from '../../utils/sidebarConfig.js';
import Admin from '../../models/Admin.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const getLayoutData = asyncHandler(async (req, res) => {
    const adminId = req.user.id;

    if (req.user.role !== 'ADMIN') {
        return ApiResponse.error(res, 'Access denied. Use staff layout API.', 403);
    }

    const admin = await Admin.findById(adminId);

    if (!admin) {
        return ApiResponse.error(res, 'Admin not found', 404);
    }

    const sidebarOptions = sidebarConfig.map(item => {
        let mappedItem = {
            ...item,
            path: item.path ? `/admin/dashboard/${item.path}` : '/admin/dashboard'
        };

        // Admin also just sees Transactions by default
        if (item.id === 'finance') {
            mappedItem.label = 'Transactions';
        }

        return mappedItem;
    });

    return ApiResponse.success(res, 'Admin layout data fetched successfully', {
        user: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            profileImage: admin.profileImage,
            role: 'ADMIN'
        },
        sidebarOptions
    });
});

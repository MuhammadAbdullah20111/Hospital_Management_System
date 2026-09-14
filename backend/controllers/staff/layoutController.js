import { sidebarConfig } from '../../utils/sidebarConfig.js';
import Staff from '../../models/Staff.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const getLayoutData = asyncHandler(async (req, res) => {
    const staffId = req.user.id;
    const staff = await Staff.findById(staffId);

    if (!staff) {
        return ApiResponse.error(res, 'Staff member not found', 404);
    }

    const { role } = staff;
    const permissions = role?.rolePermissions?.map(rp => rp.permission.name) || [];

    const sidebarOptions = sidebarConfig
        .filter(item => permissions.includes(item.permission))
        .map(item => {
            let mappedItem = {
                ...item,
                path: item.path ? `/staff/${item.path}` : '/staff'
            };

            // For non-finance roles, show Transactions instead of Finance dashboard
            if (item.id === 'finance' && !['FINANCE_MANAGER', 'ACCOUNTANT'].includes(role?.name)) {
                mappedItem.label = 'Transactions';
            }

            return mappedItem;
        });

    return ApiResponse.success(res, 'Staff layout data fetched successfully', {
        user: {
            id: staff.id,
            name: staff.name,
            email: staff.email,
            profileImage: staff.profileImage,
            role: role?.name,
            department: staff.department?.name,
        },
        permissions,
        sidebarOptions
    });
});

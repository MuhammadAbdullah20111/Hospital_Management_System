import Service from '../../models/Service.js';
import ApiResponse from '../../utils/ApiResponse.js';

export const getPublicServices = async (req, res, next) => {
    try {
        const services = await Service.findAll({ isActive: true });
        return ApiResponse.success(res, 'Services fetched successfully', { services });
    } catch (error) {
        next(error);
    }
};

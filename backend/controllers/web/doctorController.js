import Staff from '../../models/Staff.js';
import ApiResponse from '../../utils/ApiResponse.js';

export const getDoctors = async (req, res, next) => {
    try {
        const doctors = await Staff.findAll({
            role: {
                name: 'DOCTOR'
            },
            isActive: true
        });

        return ApiResponse.success(res, 'Doctors fetched successfully', {
            doctors: doctors.map(doc => ({
                id: doc.id,
                name: doc.name,
                specialty: doc.department ? doc.department.name : 'General',
                role: doc.role ? doc.role.name : 'Doctor',
                image: doc.profileImage || null,
                experience: 'Experienced',
                availability: doc.shift ? doc.shift.name : 'Available'
            }))
        });
    } catch (error) {
        next(error);
    }
};

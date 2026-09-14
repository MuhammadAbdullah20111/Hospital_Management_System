import prisma from '../../config/prismaClient.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const getDoctors = asyncHandler(async (req, res) => {
    // Find staff members whose role is 'Doctor'
    const doctors = await prisma.staff.findMany({
        where: {
            role: {
                name: {
                    equals: 'doctor',
                    mode: 'insensitive'
                }
            },
            isActive: true
        },
        select: {
            id: true,
            name: true,
            phoneNumber: true,
            consultationFee: true,
            department: {
                select: {
                    name: true
                }
            }
        }
    });

    // Format the response to include department name directly
    const formattedDoctors = doctors.map(d => ({
        id: d.id,
        name: d.name,
        phoneNumber: d.phoneNumber,
        consultationFee: d.consultationFee,
        department: d.department ? d.department.name : 'General',
        role: 'DOCTOR' // Explicitly state role for frontend filtering if needed
    }));

    return ApiResponse.success(res, 'Doctors fetched successfully', {
        staff: formattedDoctors
    });
});

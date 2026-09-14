import * as Yup from 'yup';

export const appointmentSchema = Yup.object().shape({
    patientId: Yup.string().required('Patient is required'),
    doctorId: Yup.string().required('Doctor is required'),
    date: Yup.date()
        .required('Date is required')
        .min(new Date(new Date().setHours(0, 0, 0, 0)), 'Appointment date cannot be in the past'),
    time: Yup.string().required('Time is required'),
    reason: Yup.string().max(500, 'Reason cannot exceed 500 characters').nullable(),
});

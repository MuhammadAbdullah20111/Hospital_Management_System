import * as Yup from 'yup';

export const patientSchema = Yup.object().shape({
    name: Yup.string()
        .required('Full Name is required')
        .min(2, 'Name is too short'),
    email: Yup.string()
        .email('Invalid email address')
        .nullable(),
    phoneNumber: Yup.string()
        .required('Phone Number is required')
        .matches(/^03[0-9]{9}$/, 'Must be a valid 11-digit Pakistani phone number starting with 03'),
    cnic: Yup.string()
        .required('CNIC (Identity Card) is required')
        .matches(/^\d{13}$/, 'CNIC must be exactly 13 digits'),
    age: Yup.number()
        .required('Age is required')
        .positive('Age must be a positive number')
        .integer('Age must be an integer')
        .max(100, 'Age cannot exceed 100 years'),
    gender: Yup.string()
        .required('Gender is required')
        .oneOf(['Male', 'Female', 'Other'], 'Invalid gender selection'),
    address: Yup.string()
        .nullable()
});

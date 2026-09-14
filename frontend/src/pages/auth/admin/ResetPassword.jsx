import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toastHelper from '../../../helpers/toastHelper';
import { adminResetPasswordAPI } from '../../../api/admin/auth';

const AdminResetPassword = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const initialValues = {
        otp: '',
        password: '',
        confirmPassword: '',
    };

    const validationSchema = Yup.object({
        otp: Yup.string()
            .length(6, 'OTP must be exactly 6 characters')
            .required('OTP is required'),
        password: Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .required('Password is required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Confirm Password is required'),
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const response = await adminResetPasswordAPI({
                otp: values.otp,
                password: values.password,
                confirmPassword: values.confirmPassword
            });

            if (response.success) {
                toastHelper.success(response.message || 'Password reset successful!');
                navigate('/auth/admin/login');
            } else {
                toastHelper.error(response.message || 'Failed to reset password');
            }
        } catch (error) {
            console.error("Admin Reset Password Error:", error);
            const apiMessage = error.response?.data?.message || error.message || 'An error occurred. Please try again.';
            toastHelper.error(apiMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col w-full p-8 rounded-2xl shadow-xl bg-white">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-teal-600 dark:text-teal-500">Reset Password</h2>
                <p className="text-slate-500 dark:text-slate-400">Enter OTP and new password</p>
            </div>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, touched, errors }) => (
                    <Form className="flex flex-col gap-6">
                        <div>
                            <label
                                htmlFor="otp"
                                className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                6-Digit OTP
                            </label>
                            <Field
                                id="otp"
                                name="otp"
                                type="text"
                                placeholder="123456"
                                maxLength="6"
                                className={`w-full px-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${touched.otp && errors.otp
                                    ? 'border-red-500 focus:ring-red-200'
                                    : 'border-slate-200 focus:border-teal-500 focus:ring-teal-200'
                                    }`}
                            />
                            <ErrorMessage name="otp" component="div" className="mt-1 text-sm text-red-500" />
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                New Password
                            </label>
                            <div className="relative">
                                <Field
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={`w-full px-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${touched.password && errors.password
                                        ? 'border-red-500 focus:ring-red-200'
                                        : 'border-slate-200 focus:border-teal-500 focus:ring-teal-200'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-teal-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-500" />
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Field
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={`w-full px-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${touched.confirmPassword && errors.confirmPassword
                                        ? 'border-red-500 focus:ring-red-200'
                                        : 'border-slate-200 focus:border-teal-500 focus:ring-teal-200'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-teal-600 focus:outline-none"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-sm text-red-500" />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            {isSubmitting ? (
                                <LoadingPlaceholder className="h-5" colorClass="text-white" />
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AdminResetPassword;

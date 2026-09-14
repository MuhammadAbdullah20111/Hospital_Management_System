import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toastHelper from '../../../helpers/toastHelper';
import { staffLoginAPI, verifyStaff2FAAPI } from '../../../api/staff/auth';
import ApiService from '../../../services/ApiService';

const StaffLogin = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [requires2FA, setRequires2FA] = useState(false);
    const [authEmail, setAuthEmail] = useState('');

    const initialValues = {
        email: '',
        password: '',
    };

    const validationSchema = Yup.object({
        email: Yup.string()
            .email('Invalid email address')
            .required('Email is required'),
        password: Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .required('Password is required'),
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const response = await staffLoginAPI(values);

            if (response.success) {
                if (response.requires2FA) {
                    setRequires2FA(true);
                    setAuthEmail(response.email);
                    toastHelper.success('Please check your email for the 2FA code.');
                    return;
                }
                ApiService.saveToken(response.token);
                localStorage.setItem('user', JSON.stringify(response.staff));
                localStorage.setItem('role', response.staff.role);
                localStorage.setItem('permissions', JSON.stringify(response.staff.permissions || []));
                localStorage.setItem('userId', response.staff.id);
                localStorage.setItem('name', response.staff.name);
                localStorage.setItem('userType', 'STAFF');
                localStorage.setItem('loginTime', new Date().toISOString());
                toastHelper.success(response.message || 'Login successful!');
                navigate('/staff/dashboard');
            } else {
                toastHelper.error(response.message || 'Login failed');
            }
        } catch (error) {
            console.error("Staff Login Error:", error);
            const apiMessage = error.response?.data?.message || error.message || 'An error occurred. Please try again.';
            toastHelper.error(apiMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerify2FA = async (values, { setSubmitting }) => {
        try {
            const response = await verifyStaff2FAAPI({ email: authEmail, otp: values.otp });
            if (response.success) {
                ApiService.saveToken(response.token);
                localStorage.setItem('user', JSON.stringify(response.staff));
                localStorage.setItem('role', response.staff.role);
                localStorage.setItem('permissions', JSON.stringify(response.staff.permissions || []));
                localStorage.setItem('userId', response.staff.id);
                localStorage.setItem('name', response.staff.name);
                localStorage.setItem('userType', 'STAFF');
                localStorage.setItem('loginTime', new Date().toISOString());
                toastHelper.success('2FA Verified. Login successful!');
                navigate('/staff/dashboard');
            } else {
                toastHelper.error(response.message || 'Verification failed');
            }
        } catch (error) {
            console.error("2FA Verification Error:", error);
            const apiMessage = error.response?.data?.message || error.message || 'Invalid OTP. Please try again.';
            toastHelper.error(apiMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (requires2FA) {
        return (
            <div className="flex flex-col w-full p-8 rounded-2xl shadow-xl bg-white">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-teal-600 dark:text-teal-500">Two-Factor Auth</h2>
                    <p className="text-slate-500 dark:text-slate-400">Enter the code sent to {authEmail}</p>
                </div>

                <Formik
                    initialValues={{ otp: '' }}
                    validationSchema={Yup.object({
                        otp: Yup.string().length(6, 'OTP must be 6 digits').required('OTP is required'),
                    })}
                    onSubmit={handleVerify2FA}
                >
                    {({ isSubmitting, touched, errors }) => (
                        <Form className="flex flex-col gap-6">
                            <div>
                                <label htmlFor="otp" className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    6-Digit OTP Code
                                </label>
                                <Field
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    placeholder="123456"
                                    className={`w-full px-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors text-center text-lg tracking-widest ${touched.otp && errors.otp ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-teal-500 focus:ring-teal-200'}`}
                                />
                                <ErrorMessage name="otp" component="div" className="mt-1 text-sm text-red-500 text-center" />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                            >
                                {isSubmitting ? <LoadingPlaceholder className="h-5" colorClass="text-white" /> : 'Verify Code'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setRequires2FA(false)}
                                className="w-full py-2 text-sm text-slate-500 hover:text-slate-700"
                            >
                                Back to Login
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full p-8 rounded-2xl shadow-xl bg-white">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-teal-600 dark:text-teal-500">Staff Login</h2>
                <p className="text-slate-500 dark:text-slate-400">Sign in to your staff portal</p>
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
                                htmlFor="email"
                                className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Email Address
                            </label>
                            <Field
                                id="email"
                                name="email"
                                type="email"
                                placeholder="staff@mkmc.com"
                                className={`w-full px-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${touched.email && errors.email
                                    ? 'border-red-500 focus:ring-red-200'
                                    : 'border-slate-200 focus:border-teal-500 focus:ring-teal-200'
                                    }`}
                            />
                            <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-500" />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Password
                                </label>
                                <Link to="/auth/staff/forgot-password" size="sm" className="text-sm text-teal-600 hover:text-teal-700 font-medium">Forgot password?</Link>
                            </div>
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

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            {isSubmitting ? (
                                <LoadingPlaceholder className="h-5" colorClass="text-white" />
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default StaffLogin;

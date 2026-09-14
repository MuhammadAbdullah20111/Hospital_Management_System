import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toastHelper from '../../../helpers/toastHelper';
import { adminForgotPasswordAPI } from '../../../api/admin/auth';

const AdminForgotPassword = () => {
    const navigate = useNavigate();

    const initialValues = {
        email: '',
    };

    const validationSchema = Yup.object({
        email: Yup.string()
            .email('Invalid email address')
            .required('Email is required'),
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const response = await adminForgotPasswordAPI(values);

            if (response.success) {
                toastHelper.success(response.message || 'OTP sent to your email!');
                navigate('/auth/admin/reset-password');
            } else {
                toastHelper.error(response.message || 'Failed to send reset link');
            }
        } catch (error) {
            console.error("Admin Forgot Password Error:", error);
            const apiMessage = error.response?.data?.message || error.message || 'An error occurred. Please try again.';
            toastHelper.error(apiMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col w-full p-8 rounded-2xl shadow-xl bg-white">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-teal-600 dark:text-teal-500">Forgot Password</h2>
                <p className="text-slate-500 dark:text-slate-400">Enter your email to reset password</p>
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
                                placeholder="admin@mkmc.com"
                                className={`w-full px-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${touched.email && errors.email
                                    ? 'border-red-500 focus:ring-red-200'
                                    : 'border-slate-200 focus:border-teal-500 focus:ring-teal-200'
                                    }`}
                            />
                            <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-500" />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            {isSubmitting ? (
                                <LoadingPlaceholder className="h-5" colorClass="text-white" />
                            ) : (
                                'Send OTP'
                            )}
                        </button>
                    </Form>
                )}
            </Formik>
            <div className="mt-4 text-center">
                <button
                    type="button"
                    onClick={() => navigate('/auth/admin/login')}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
};

export default AdminForgotPassword;

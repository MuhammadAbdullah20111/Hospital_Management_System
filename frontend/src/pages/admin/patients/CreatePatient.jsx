import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { useFormik } from 'formik';
import { createPatientAPI, getNextMrNumberAPI } from '../../../api/admin/patients';
import { patientSchema } from '../../../validations/patientSchema';
import toast from 'react-hot-toast';

const CreatePatient = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [nextMrNumber, setNextMrNumber] = useState('');

    useEffect(() => {
        const fetchNextMr = async () => {
            try {
                const response = await getNextMrNumberAPI();
                if (response.success) {
                    setNextMrNumber(response.nextMrNumber);
                }
            } catch (error) {
                console.error("Failed to fetch next MR number:", error);
            }
        };
        fetchNextMr();
    }, []);

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            phoneNumber: '',
            cnic: '',
            age: '',
            gender: '',
            address: ''
        },
        validationSchema: patientSchema,
        onSubmit: async (values) => {
            setIsLoading(true);
            try {
                const payload = {
                    ...values,
                    age: parseInt(values.age),
                    email: values.email || null
                };

                const response = await createPatientAPI(payload);
                if (response.success) {
                    toast.success("Patient registered successfully");
                    navigate('/admin/dashboard');
                }
            } catch (error) {
                console.error("Failed to register patient:", error);
                toast.error(error.message || "Failed to register patient");
            } finally {
                setIsLoading(false);
            }
        }
    });

    return (
        <div className="max-w-4xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/admin/dashboard/patients')}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Register Patient</h1>
                    <p className="text-slate-500">
                        {nextMrNumber ? (
                            <span>Generating MR: <span className="font-mono font-bold text-teal-600">{nextMrNumber}</span></span>
                        ) : (
                            "Add a new patient record to the system"
                        )}
                    </p>
                </div>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-teal-600" />
                        Personal Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                {...formik.getFieldProps('name')}
                                className={`w-full px-4 py-2 bg-slate-50 border ${formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all`}
                                placeholder="e.g. John Doe"
                            />
                            {formik.touched.name && formik.errors.name && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.name}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                {...formik.getFieldProps('email')}
                                className={`w-full px-4 py-2 bg-slate-50 border ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all`}
                                placeholder="e.g. john@example.com"
                            />
                            {formik.touched.email && formik.errors.email && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                {...formik.getFieldProps('phoneNumber')}
                                className={`w-full px-4 py-2 bg-slate-50 border ${formik.touched.phoneNumber && formik.errors.phoneNumber ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all`}
                                placeholder="e.g. 03001234567"
                            />
                            {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.phoneNumber}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                CNIC (Identity Card) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                {...formik.getFieldProps('cnic')}
                                className={`w-full px-4 py-2 bg-slate-50 border ${formik.touched.cnic && formik.errors.cnic ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all`}
                                placeholder="e.g. 1234512345671"
                            />
                            {formik.touched.cnic && formik.errors.cnic && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.cnic}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Age <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="150"
                                {...formik.getFieldProps('age')}
                                className={`w-full px-4 py-2 bg-slate-50 border ${formik.touched.age && formik.errors.age ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all`}
                            />
                            {formik.touched.age && formik.errors.age && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.age}</div>
                            )}
                        </div>

                        <div>
                            <SearchableSelect
                                label="Gender"
                                options={[
                                    { value: 'Male', label: 'Male' },
                                    { value: 'Female', label: 'Female' },
                                    { value: 'Other', label: 'Other' }
                                ]}
                                value={formik.values.gender}
                                onChange={(val) => formik.setFieldValue('gender', val)}
                                searchable={false}
                                placeholder="Select Gender"
                            />
                            {formik.touched.gender && formik.errors.gender && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.gender}</div>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Address
                            </label>
                            <textarea
                                {...formik.getFieldProps('address')}
                                className={`w-full px-4 py-2 bg-slate-50 border ${formik.touched.address && formik.errors.address ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all`}
                                rows="3"
                                placeholder="Residential address..."
                            />
                            {formik.touched.address && formik.errors.address && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.address}</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-xl hover:bg-teal-700 transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20"
                    >
                        {isLoading ? (
                            <>
                                <LoadingPlaceholder className="h-4" colorClass="text-white" />
                                Registering...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Register Patient
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePatient;

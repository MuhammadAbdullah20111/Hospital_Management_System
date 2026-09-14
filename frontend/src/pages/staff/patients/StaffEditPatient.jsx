import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User } from 'lucide-react';
import { useFormik } from 'formik';
import { getPatientByIdAPI, updatePatientAPI } from '../../../api/staff/patients';
import { patientSchema } from '../../../validations/patientSchema';
import toast from 'react-hot-toast';

const StaffEditPatient = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [initialValues, setInitialValues] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        cnic: '',
        age: '',
        gender: '',
        address: ''
    });

    const formik = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,
        validationSchema: patientSchema,
        onSubmit: async (values) => {
            setIsLoading(true);
            try {
                const payload = {
                    ...values,
                    age: parseInt(values.age),
                    email: values.email || null
                };

                const response = await updatePatientAPI(id, payload);
                if (response.success) {
                    toast.success("Patient updated successfully");
                    navigate('/staff/patients');
                }
            } catch (error) {
                console.error("Failed to update patient:", error);
                toast.error(error.message || "Failed to update patient");
            } finally {
                setIsLoading(false);
            }
        }
    });

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const response = await getPatientByIdAPI(id);
                if (response.success) {
                    const p = response.patient;
                    setInitialValues({
                        name: p.name || '',
                        email: p.email || '',
                        phoneNumber: p.phoneNumber || '',
                        cnic: p.cnic || '',
                        age: p.age ? String(p.age) : '',
                        gender: p.gender || '',
                        address: p.address || ''
                    });
                }
            } catch (error) {
                console.error("Failed to fetch patient:", error);
                toast.error("Failed to load patient data");
                navigate('/staff/patients');
            } finally {
                setIsFetching(false);
            }
        };
        fetchPatient();
    }, [id, navigate]);

    if (isFetching) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingPlaceholder className="h-12 w-12" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/staff/patients')}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Edit Patient</h1>
                    <p className="text-slate-500">Update patient record information</p>
                </div>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-teal-600" />
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
                                max="100"
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
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StaffEditPatient;

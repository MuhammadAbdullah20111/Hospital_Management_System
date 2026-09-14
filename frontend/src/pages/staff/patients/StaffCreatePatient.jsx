import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { useFormik } from 'formik';
import { createPatientAPI, getNextMrNumberAPI } from '../../../api/staff/patients';
import { patientSchema } from '../../../validations/patientSchema';
import toast from 'react-hot-toast';
import { ChevronRight } from 'lucide-react';
import { getTransactionCategoriesAPI, createTransactionAPI } from '../../../api/admin/finance';
import BillingStep from '../../../components/finance/BillingStep';

const StaffCreatePatient = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [nextMrNumber, setNextMrNumber] = useState('');

    const [step, setStep] = useState(1);
    const [categories, setCategories] = useState([]);
    const [createdPatient, setCreatedPatient] = useState(null);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [mrRes, catRes] = await Promise.all([
                    getNextMrNumberAPI(),
                    getTransactionCategoriesAPI('INCOME')
                ]);
                if (mrRes.success) setNextMrNumber(mrRes.nextMrNumber);
                if (catRes.success) setCategories(catRes.data || []);
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
            }
        };
        fetchData();
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
                    toast.success("Patient details saved");
                    setCreatedPatient(response.patient);
                    setStep(2);
                }
            } catch (error) {
                console.error("Failed to register patient:", error);
                toast.error(error.message || "Failed to register patient");
            } finally {
                setIsLoading(false);
            }
        }
    });

    const handleBillingSubmit = async (billingData) => {
        setIsLoading(true);
        try {
            if (billingData.categoryId && createdPatient) {
                const txPayload = {
                    type: 'INCOME',
                    categoryId: parseInt(billingData.categoryId),
                    patientId: createdPatient.id,
                    baseAmount: billingData.baseAmount,
                    discount: billingData.discount,
                    amount: Math.max(0, billingData.baseAmount - billingData.discount),
                    method: billingData.paymentMethod,
                    status: billingData.paymentStatus,
                    notes: `Patient Registration Fee for MR: ${createdPatient.mrNumber}`
                };
                await createTransactionAPI(txPayload);
            }
            toast.success("Patient registered and billed successfully");
            navigate('/staff');
        } catch (error) {
            console.error("Billing failed:", error);
            toast.error(error.message || "Failed to process billing");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/staff/patients')}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Register Patient
                    </h1>
                    <p className="text-slate-500">
                        {nextMrNumber ? (
                            <span>Generating MR: <span className="font-mono font-bold text-teal-600">{nextMrNumber}</span></span>
                        ) : "Add a new patient record to the system"}
                    </p>
                </div>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-6">
                
                    <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
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
                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-xl hover:bg-teal-700 transition-colors font-bold shadow-lg shadow-teal-600/20 disabled:opacity-70"
                        >
                            {isLoading ? (
                                <LoadingPlaceholder className="h-5" colorClass="text-white" />
                            ) : (
                                "Register Patient"
                            )}
                            {!isLoading && <Save className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default StaffCreatePatient;

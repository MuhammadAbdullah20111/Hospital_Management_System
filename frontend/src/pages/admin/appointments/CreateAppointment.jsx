import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, User, Stethoscope, Clock, FileText, ChevronRight, Banknote, CheckCircle2 } from 'lucide-react';
import { useFormik } from 'formik';
import { createAppointmentAPI } from '../../../api/admin/appointments';
import { getAllPatientsAPI } from '../../../api/admin/patients';
import { getAllStaffAPI } from '../../../api/admin/staff';
import { getTransactionCategoriesAPI, createTransactionAPI } from '../../../api/admin/finance';
import { appointmentSchema } from '../../../validations/appointmentSchema';
import { getFromLocalStorage } from '../../../helpers/localStorageFile';
import toast from 'react-hot-toast';
import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import BillingStep from '../../../components/finance/BillingStep';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import DatePicker from '../../../components/ui/DatePicker';
import TimePicker from '../../../components/ui/TimePicker';

const CreateAppointment = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isFetchingData, setIsFetchingData] = useState(true);
    
    useEffect(() => {
        const fetchData = async () => {
            setIsFetchingData(true);
            try {
                const [patientsParams, staffParams, catRes] = await Promise.all([
                    getAllPatientsAPI(),
                    getAllStaffAPI(),
                    getTransactionCategoriesAPI('INCOME')
                ]);

                if (patientsParams.success) setPatients(patientsParams.patients);
                if (staffParams.success) {
                    const docList = staffParams.staff.filter(s =>
                        s.role && s.role.toLowerCase().includes('doctor')
                    );
                    setDoctors(docList.length > 0 ? docList : staffParams.staff);
                }
                if (catRes.success) {
                    setCategories(catRes.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast.error("Failed to load necessary data");
            } finally {
                setIsFetchingData(false);
            }
        };
        fetchData();
    }, []);

    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    const formik = useFormik({
        initialValues: {
            patientId: '',
            doctorId: '',
            date: now.toISOString().split('T')[0],
            time: currentTime,
            reason: ''
        },
        validationSchema: appointmentSchema,
        onSubmit: async (values) => {
            if (step === 1) {
                setStep(2);
            }
        }
    });

    const handleBillingSubmit = async (billingData) => {
        setIsLoading(true);
        try {
            // 1. Create Appointment
            const aptPayload = {
                patientId: parseInt(formik.values.patientId),
                doctorId: parseInt(formik.values.doctorId),
                date: new Date(formik.values.date).toISOString(),
                time: formik.values.time,
                reason: formik.values.reason
            };
            const aptRes = await createAppointmentAPI(aptPayload);

            if (!aptRes.success) {
                throw new Error("Failed to create appointment");
            }

            const newAppointmentId = aptRes.appointment.id;

            // 2. Create Transaction if category is selected
            if (billingData.categoryId) {
                const txPayload = {
                    type: 'INCOME',
                    categoryId: parseInt(billingData.categoryId),
                    patientId: parseInt(formik.values.patientId),
                    appointmentId: newAppointmentId,
                    baseAmount: billingData.baseAmount,
                    discount: billingData.discount,
                    amount: Math.max(0, billingData.baseAmount - billingData.discount),
                    method: billingData.paymentMethod,
                    status: billingData.paymentStatus,
                    notes: `Consultation Fee for Appointment #${newAppointmentId}`
                };

                await createTransactionAPI(txPayload);
            }

            toast.success("Appointment & Billing recorded successfully");
            navigate('/admin/dashboard/appointments');
            
        } catch (error) {
            console.error("Submission failed:", error);
            toast.error(error.message || "Failed to complete process");
        } finally {
            setIsLoading(false);
        }
    };

    const selectedDoctor = doctors.find(d => String(d.id) === String(formik.values.doctorId));
    const baseFee = selectedDoctor?.consultationFee || 0;

    if (isFetchingData) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <LoadingPlaceholder className="h-24 w-24" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => step === 2 ? setStep(1) : navigate('/admin/dashboard/appointments')}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        {step === 1 ? 'Book New Appointment' : 'Billing & Payment'}
                    </h1>
                    <p className="text-slate-500">
                        {step === 1 ? 'Schedule a visit for a patient with a doctor.' : 'Confirm pricing and record payment.'}
                    </p>
                </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-center mb-8">
                <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step >= 1 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
                    <span className={`font-medium ${step >= 1 ? 'text-teal-800' : 'text-slate-500'}`}>Details</span>
                    <div className={`w-12 h-1 rounded-full mx-2 ${step >= 2 ? 'bg-teal-600' : 'bg-slate-200'}`}></div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step >= 2 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
                    <span className={`font-medium ${step >= 2 ? 'text-teal-800' : 'text-slate-500'}`}>Billing</span>
                </div>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-6">
                
                {step === 1 && (
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-right-4">
                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-teal-600" />
                            Appointment Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Patient Selection */}
                            <div className="md:col-span-1">
                                <SearchableSelect
                                    label={<span>Patient <span className="text-red-500">*</span></span>}
                                    options={patients.map(p => ({ value: p.id, label: p.name, subLabel: `ID: #${p.id}` }))}
                                    value={formik.values.patientId}
                                    onChange={(val) => formik.setFieldValue('patientId', val)}
                                    placeholder="Select Patient"
                                    icon={User}
                                />
                                {formik.touched.patientId && formik.errors.patientId && (
                                    <div className="text-red-500 text-xs mt-1">{formik.errors.patientId}</div>
                                )}
                            </div>

                            {/* Doctor Selection */}
                            <div className="md:col-span-1">
                                <SearchableSelect
                                    label={<span>Doctor <span className="text-red-500">*</span></span>}
                                    options={doctors.map(d => ({ value: d.id, label: d.name, subLabel: `Fee: Rs ${d.consultationFee || 0}` }))}
                                    value={formik.values.doctorId}
                                    onChange={(val) => formik.setFieldValue('doctorId', val)}
                                    placeholder="Select Doctor"
                                    icon={Stethoscope}
                                />
                                {formik.touched.doctorId && formik.errors.doctorId && (
                                    <div className="text-red-500 text-xs mt-1">{formik.errors.doctorId}</div>
                                )}
                            </div>

                            {/* Date */}
                            <div>
                                <DatePicker
                                    label={<span>Appointment Date <span className="text-red-500">*</span></span>}
                                    value={formik.values.date}
                                    onChange={(val) => formik.setFieldValue('date', val)}
                                    min={now.toISOString().split('T')[0]}
                                    icon={Calendar}
                                />
                                {formik.touched.date && formik.errors.date && (
                                    <div className="text-red-500 text-xs mt-1">{formik.errors.date}</div>
                                )}
                            </div>

                            {/* Time */}
                            <div>
                                <TimePicker
                                    label={<span>Appointment Time <span className="text-red-500">*</span></span>}
                                    value={formik.values.time}
                                    onChange={(val) => formik.setFieldValue('time', val)}
                                    className={`${formik.touched.time && formik.errors.time ? 'border-red-500 ring-1 ring-red-500 rounded-xl' : ''}`}
                                />
                                {formik.touched.time && formik.errors.time && (
                                    <div className="text-red-500 text-xs mt-1">{formik.errors.time}</div>
                                )}
                            </div>

                            {/* Reason / Notes */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Reason for Visit / Clinical Notes
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-slate-400">
                                        <FileText className="w-4 h-4" />
                                    </span>
                                    <textarea
                                        {...formik.getFieldProps('reason')}
                                        className={`w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all`}
                                        rows="3"
                                        placeholder="Briefly describe the reason for appointment..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    formik.setTouched({
                                        patientId: true, doctorId: true, date: true, time: true
                                    });
                                    if (!formik.errors.patientId && !formik.errors.doctorId && !formik.errors.date && !formik.errors.time) {
                                        formik.handleSubmit();
                                    }
                                }}
                                className="flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-xl hover:bg-teal-700 transition-colors font-bold shadow-lg shadow-teal-600/20"
                            >
                                {isLoading ? <LoadingPlaceholder className="h-5" colorClass="text-white" /> : "Continue to Billing"}
                                {!isLoading && <ChevronRight className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <BillingStep 
                        baseAmount={baseFee}
                        entityLabel="Doctor"
                        entityName={selectedDoctor ? selectedDoctor.name : ''}
                        categories={categories}
                        defaultCategorySearch="Appointment"
                        hideCategory={true}
                        isLoading={isLoading}
                        onSubmit={handleBillingSubmit}
                        submitLabel="Confirm & Book Appointment"
                    />
                )}
            </form>
        </div>
    );
};

export default CreateAppointment;

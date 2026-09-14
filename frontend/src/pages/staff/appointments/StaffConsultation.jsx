import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, FileText, History, User, Calendar, Stethoscope, ClipboardList, CheckCircle } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
    getAppointmentByIdAPI, 
    createPrescriptionAPI, 
    getPatientHistoryAPI,
    getPrescriptionByAppointmentIdAPI
} from '../../../api/staff/appointments';
import toast from 'react-hot-toast';
import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import DatePicker from '../../../components/ui/DatePicker';

const StaffConsultation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [appointment, setAppointment] = useState(null);
    const [history, setHistory] = useState({ appointments: [], prescriptions: [] });
    const [existingPrescription, setExistingPrescription] = useState(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setIsFetchingData(true);
        try {
            const appRes = await getAppointmentByIdAPI(id);
            if (appRes.success) {
                setAppointment(appRes.appointment);
                
                // Fetch patient history
                const histRes = await getPatientHistoryAPI(appRes.appointment.patientId);
                if (histRes.success) {
                    setHistory(histRes.history);
                }

                // If appointment is already completed, check for existing prescription
                if (appRes.appointment.status === 'COMPLETED') {
                    const presRes = await getPrescriptionByAppointmentIdAPI(id);
                    if (presRes.success) {
                        setExistingPrescription(presRes.prescription);
                        formik.setValues({
                            diagnosis: presRes.prescription.diagnosis || '',
                            prescriptionContent: presRes.prescription.prescriptionContent || '',
                            nextFollowUp: presRes.prescription.nextFollowUp 
                                ? new Date(presRes.prescription.nextFollowUp).toISOString().split('T')[0] 
                                : ''
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Failed to load clinical data");
            navigate('/staff/appointments');
        } finally {
            setIsFetchingData(false);
        }
    };

    const formik = useFormik({
        initialValues: {
            diagnosis: '',
            prescriptionContent: '',
            nextFollowUp: ''
        },
        validationSchema: Yup.object({
            diagnosis: Yup.string().required('Diagnosis is required'),
            prescriptionContent: Yup.string(),
            nextFollowUp: Yup.date().nullable()
        }),
        onSubmit: async (values) => {
            setIsLoading(true);
            try {
                const payload = {
                    ...values,
                    appointmentId: parseInt(id)
                };

                const response = await createPrescriptionAPI(payload);
                if (response.success) {
                    toast.success("Consultation completed and prescription saved.");
                    navigate('/staff/appointments');
                }
            } catch (error) {
                console.error("Failed to save prescription:", error);
                toast.error(error.message || "Failed to save prescription");
            } finally {
                setIsLoading(false);
            }
        }
    });

    if (isFetchingData) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <LoadingPlaceholder className="h-10 w-10" />
            </div>
        );
    }

    const isCompleted = appointment?.status === 'COMPLETED';

    return (
        <div className="max-w-7xl mx-auto pb-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Professional Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-teal-100 shadow-sm">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => navigate('/staff/appointments')}
                        className="p-2.5 hover:bg-teal-50 rounded-xl text-teal-600 transition-all border border-transparent hover:border-teal-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-600/20">
                            <Stethoscope className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-slate-900">Clinical Consultation</h1>
                                {isCompleted && (
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        Completed
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                                <span className="text-teal-600 font-bold">{appointment?.patient?.name}</span>
                                <span className="text-slate-300">|</span>
                                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">MR: {appointment?.patient?.mrNumber}</span>
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-6 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Age / Gender</p>
                        <p className="text-sm font-bold text-slate-700">{appointment?.patient?.age}y / {appointment?.patient?.gender}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visit Date</p>
                        <p className="text-sm font-bold text-slate-700">{new Date(appointment?.date).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                {/* Main Consultation Form */}
                <div className="lg:col-span-3 space-y-6">
                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        {/* Diagnosis Section */}
                        <div className="bg-white rounded-2xl p-8 border border-teal-100 shadow-sm transition-all hover:shadow-md">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                                    <ClipboardList className="w-5 h-5" />
                                </div>
                                Diagnosis & Clinical Notes
                            </h2>
                            <textarea
                                {...formik.getFieldProps('diagnosis')}
                                disabled={isCompleted}
                                className={`w-full p-5 bg-slate-50 border-2 ${formik.touched.diagnosis && formik.errors.diagnosis ? 'border-red-500' : 'border-slate-100'} rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 transition-all font-medium min-h-[160px] text-slate-700 placeholder:text-slate-400`}
                                placeholder="Describe the patient's symptoms, diagnosis, and clinical findings..."
                            />
                            {formik.touched.diagnosis && formik.errors.diagnosis && (
                                <p className="text-red-500 text-xs font-bold mt-3 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                    {formik.errors.diagnosis}
                                </p>
                            )}
                        </div>

                        {/* Prescription Section */}
                        <div className="bg-white rounded-2xl p-8 border border-teal-100 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    Prescription & Medication
                                </h2>
                                <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 italic">Optional Free-text</span>
                            </div>
                            <textarea
                                {...formik.getFieldProps('prescriptionContent')}
                                disabled={isCompleted}
                                className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono text-sm min-h-[250px] text-slate-700 placeholder:text-slate-400 leading-relaxed shadow-inner"
                                placeholder="Example: 
Tab. Paracetamol 500mg (1-0-1) for 3 days.
Syrup. CoughNil 2 tsp twice daily."
                            />
                        </div>

                        {/* Footer / Submit */}
                        <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                            <div className="flex items-center gap-4">
                                <div className="w-56">
                                    <DatePicker
                                        label="Follow-up Date"
                                        value={formik.values.nextFollowUp}
                                        onChange={(val) => formik.setFieldValue('nextFollowUp', val)}
                                        disabled={isCompleted}
                                        placeholder="No follow-up set"
                                        icon={Calendar}
                                    />
                                </div>
                            </div>
                            
                            {!isCompleted ? (
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full md:w-auto px-12 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-teal-600/30 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <LoadingPlaceholder className="h-5 w-5" colorClass="text-white" />
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Complete Session
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => navigate('/staff/appointments')}
                                    className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all"
                                >
                                    Go Back to List
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Sidebar: Clinical Context */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-teal-100 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <History className="w-5 h-5 text-teal-600" />
                            Visit History
                        </h3>
                        
                        <div className="relative space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                            {history.appointments.length > 0 ? (
                                history.appointments.slice(0, 5).map((app) => (
                                    <div key={app.id} className="relative pl-10 group">
                                        <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-all ${app.id === parseInt(id) ? 'bg-teal-600' : 'bg-slate-200 group-hover:bg-teal-200'}`}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40"></div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(app.date).toLocaleDateString()}</span>
                                            <span className="text-xs font-bold text-slate-700 mt-0.5 group-hover:text-teal-600 transition-colors uppercase">{app.reason || 'Standard Visit'}</span>
                                            <div className="flex gap-2 mt-2">
                                                {history.prescriptions.find(p => p.appointmentId === app.id) && (
                                                    <span className="text-[9px] bg-teal-50 text-teal-600 px-2 py-0.5 rounded font-bold border border-teal-100 uppercase">RX Attached</span>
                                                )}
                                                <span className={`text-[9px] px-2 py-0.5 rounded font-bold border uppercase ${app.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                    {app.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6">
                                    <History className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                    <p className="text-slate-400 text-xs italic">No prior history</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffConsultation;

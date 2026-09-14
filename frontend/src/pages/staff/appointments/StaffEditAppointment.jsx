import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import DatePicker from '../../../components/ui/DatePicker';
import TimePicker from '../../../components/ui/TimePicker';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, User, Stethoscope, Clock, FileText, CheckCircle } from 'lucide-react';
import { useFormik } from 'formik';
import { getAppointmentByIdAPI, updateAppointmentAPI, getDoctorsAPI } from '../../../api/staff/appointments';
import { getAllPatientsAPI } from '../../../api/staff/patients';
import { appointmentSchema } from '../../../validations/appointmentSchema';
import { getFromLocalStorage } from '../../../helpers/localStorageFile';
import toast from 'react-hot-toast';

const StaffEditAppointment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [isFetchingData, setIsFetchingData] = useState(true);
    
    const loggedInUserId = getFromLocalStorage('userId');
    const loggedInRole = localStorage.getItem('role');
    const isDoctor = loggedInRole?.toUpperCase() === 'DOCTOR';
    const isReceptionist = loggedInRole?.toUpperCase() === 'RECEPTIONIST';

    const patientOptions = patients.map(p => ({ value: p.id, label: `${p.name} (${p.mrNumber})` }));
    const doctorOptions = doctors.map(d => ({ value: d.id, label: `${d.name} - ${d.department || 'General'}` }));

    useEffect(() => {
        const fetchData = async () => {
            setIsFetchingData(true);
            try {
                const [patientsRes, staffRes, appointmentRes] = await Promise.all([
                    getAllPatientsAPI(),
                    getDoctorsAPI(),
                    getAppointmentByIdAPI(id)
                ]);

                if (patientsRes.success) {
                    setPatients(patientsRes.patients);
                }
                if (staffRes.success) {
                    const onlyDoctors = staffRes.staff.filter(s => 
                        s.role?.toUpperCase() === 'DOCTOR' || 
                        s.Role?.name?.toUpperCase() === 'DOCTOR'
                    );
                    setDoctors(onlyDoctors);
                }

                if (appointmentRes.success) {
                    const app = appointmentRes.appointment;
                    formik.setValues({
                        patientId: String(app.patientId),
                        doctorId: String(app.doctorId),
                        date: new Date(app.date).toISOString().split('T')[0],
                        time: app.time,
                        reason: app.reason || '',
                        status: app.status
                    });
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast.error("Failed to load appointment details");
                navigate('/staff/appointments');
            } finally {
                setIsFetchingData(false);
            }
        };
        fetchData();
    }, [id]);

    const formik = useFormik({
        initialValues: {
            patientId: '',
            doctorId: '',
            date: '',
            time: '',
            reason: '',
            status: ''
        },
        validationSchema: appointmentSchema,
        onSubmit: async (values) => {
            setIsLoading(true);
            try {
                const payload = {
                    ...values,
                    patientId: parseInt(values.patientId),
                    doctorId: parseInt(values.doctorId),
                    date: new Date(values.date).toISOString()
                };

                const response = await updateAppointmentAPI(id, payload);
                if (response.success) {
                    toast.success("Appointment updated successfully");
                    navigate('/staff/appointments');
                }
            } catch (error) {
                console.error("Failed to update appointment:", error);
                toast.error(error.message || "Failed to update appointment");
            } finally {
                setIsLoading(false);
            }
        }
    });

    if (isFetchingData) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <LoadingPlaceholder className="h-24 w-24" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/staff/appointments')}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Edit Appointment</h1>
                    <p className="text-slate-500">Update appointment details or change status.</p>
                </div>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-teal-600" />
                        Appointment Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Status Selection */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Appointment Status <span className="text-red-500">*</span>
                            </label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        disabled={isReceptionist && status === 'CONFIRMED'}
                                        onClick={() => formik.setFieldValue('status', status)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                                            formik.values.status === status
                                                ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-600/20'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-teal-200 hover:bg-teal-50'
                                        } ${isReceptionist && status === 'CONFIRMED' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Patient Selection */}
                        <div className="md:col-span-1">
                            <SearchableSelect
                                label="Patient"
                                options={patientOptions}
                                value={formik.values.patientId}
                                onChange={(val) => formik.setFieldValue('patientId', val)}
                                placeholder="Select Patient"
                                searchable={true}
                                icon={User}
                            />
                            {formik.touched.patientId && formik.errors.patientId && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.patientId}</div>
                            )}
                        </div>

                        {/* Doctor Selection */}
                        <div className="md:col-span-1">
                            <SearchableSelect
                                label="Doctor"
                                options={doctorOptions}
                                value={formik.values.doctorId}
                                onChange={(val) => formik.setFieldValue('doctorId', val)}
                                placeholder="Select Doctor"
                                searchable={true}
                                disabled={isDoctor}
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
                                    className={`w-full pl-10 pr-4 py-2 bg-slate-50 border ${formik.touched.reason && formik.errors.reason ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all`}
                                    rows="4"
                                    placeholder="Briefly describe the reason for appointment or add notes..."
                                />
                            </div>
                            {formik.touched.reason && formik.errors.reason && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.reason}</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-xl hover:bg-teal-700 transition-colors font-bold disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20"
                    >
                        {isLoading ? (
                            <>
                                <LoadingPlaceholder className="h-5" colorClass="text-white" />
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                Update Appointment
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StaffEditAppointment;

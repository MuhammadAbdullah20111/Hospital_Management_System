import React from 'react';
import { X, Calendar, Clock, User, Stethoscope, FileText, Phone } from 'lucide-react';

const AppointmentDetailsModal = ({ isOpen, onClose, appointment, onEdit, canEdit, onConsult, canConsult, consultText }) => {
    if (!isOpen || !appointment) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
            case 'COMPLETED': return 'bg-blue-50 text-blue-700 border-blue-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const getPaymentStatusColor = (status) => {
        return status === 'PAID' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-red-50 text-red-700 border-red-200';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border-t-4 border-teal-600 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-teal-50 p-2 rounded-full text-teal-600">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">
                                Appointment Details
                            </h2>
                            <p className="text-xs text-slate-500">ID: #{appointment.id}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6 overflow-y-auto space-y-6">
                    {/* Status & Badges */}
                    <div className="flex flex-wrap gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status</span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border max-w-max uppercase ${getStatusColor(appointment.status)}`}>
                                {appointment.status}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Payment Status</span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border max-w-max uppercase ${getPaymentStatusColor(appointment.paymentStatus)}`}>
                                {appointment.paymentStatus}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Queue Token</span>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold border border-teal-200 bg-teal-50 text-teal-700 max-w-max">
                                Token: {appointment.queueToken?.tokenNumber || 'N/A'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Patient Information */}
                        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm space-y-4">
                            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2 text-sm uppercase tracking-wider text-slate-500">
                                <User className="w-4 h-4 text-teal-600" />
                                Patient Info
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-xs text-slate-400">Name</span>
                                    <p className="font-bold text-slate-800 text-base">{appointment.patientName}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400">MR Number</span>
                                    <p className="text-sm font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded max-w-max">
                                        {appointment.mrNumber}
                                    </p>
                                </div>
                                {appointment.patient && (
                                    <>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <span className="text-xs text-slate-400">Age</span>
                                                <p className="text-sm font-semibold text-slate-700">{appointment.patient.age || 'N/A'} Years</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-slate-400">Gender</span>
                                                <p className="text-sm font-semibold text-slate-700 capitalize">{appointment.patient.gender || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-400">Contact</span>
                                            <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mt-0.5">
                                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                {appointment.patient.phoneNumber || 'N/A'}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Doctor & Schedule Information */}
                        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm space-y-4">
                            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2 text-sm uppercase tracking-wider text-slate-500">
                                <Stethoscope className="w-4 h-4 text-teal-600" />
                                Doctor & Schedule
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-xs text-slate-400">Doctor</span>
                                    <p className="font-bold text-slate-800">Dr. {appointment.doctorName}</p>
                                </div>
                                {appointment.doctor?.specialty && (
                                    <div>
                                        <span className="text-xs text-slate-400">Specialty</span>
                                        <p className="text-sm font-semibold text-slate-700">{appointment.doctor.specialty}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-xs text-slate-400">Date</span>
                                        <p className="text-sm font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                                            <Calendar className="w-3.5 h-3.5 text-teal-500" />
                                            {new Date(appointment.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400">Time</span>
                                        <p className="text-sm font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                                            <Clock className="w-3.5 h-3.5 text-teal-500" />
                                            {appointment.time}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400">Consultation Fee</span>
                                    <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                                        Rs. {(appointment.doctor?.consultationFee || 500).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reason for visit */}
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">Reason for Visit / Clinical Notes</span>
                        <div className="flex items-start gap-2.5 text-slate-700">
                            <FileText className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{appointment.reason || 'No specific reason provided.'}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold transition-colors shadow-sm text-sm"
                    >
                        Close
                    </button>
                    {canEdit && onEdit && (
                        <button 
                            onClick={() => {
                                onClose();
                                onEdit(appointment.id);
                            }}
                            className={`px-5 py-2.5 rounded-xl font-bold transition-colors text-sm ${
                                canConsult && onConsult
                                    ? 'bg-white border border-teal-200 text-teal-700 hover:bg-teal-50 shadow-sm'
                                    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-600/10'
                            }`}
                        >
                            Edit Details
                        </button>
                    )}
                    {canConsult && onConsult && (
                        <button 
                            onClick={() => {
                                onClose();
                                onConsult(appointment.id);
                            }}
                            className="px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-bold transition-colors shadow-lg shadow-teal-600/10 text-sm"
                        >
                            {consultText || 'Start Consultation'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetailsModal;

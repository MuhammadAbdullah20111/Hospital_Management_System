import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ListComponent from '../../../components/dashboard/ListComponent';
import DataTable from '../../../components/dashboard/DataTable';
import { getAllAppointmentsAPI, deleteAppointmentAPI, updateAppointmentAPI } from '../../../api/staff/appointments';
import { getAllPaymentsAPI } from '../../../api/staff/payments';
import { Calendar, Search, Filter, Edit, Trash2, CheckCircle, XCircle, User, Clock, Stethoscope, Printer } from 'lucide-react';
import ThermalReceiptPrintView from '../../admin/finance/ThermalReceiptPrintView';
import AppointmentDetailsModal from '../../../components/dashboard/AppointmentDetailsModal';
import toast from 'react-hot-toast';
import { getFromLocalStorage } from '../../../helpers/localStorageFile';

const StaffAppointments = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    
    const loggedInUserId = getFromLocalStorage('userId');
    const role = (getFromLocalStorage('role') || localStorage.getItem('role'))?.toUpperCase();
    const userType = getFromLocalStorage('userType') || localStorage.getItem('userType');
    const isAdmin = role === 'ADMIN' || userType === 'SYSTEM_ADMIN';
    const isReceptionist = role === 'RECEPTIONIST';

    const permissions = JSON.parse(getFromLocalStorage('permissions') || localStorage.getItem('permissions') || '[]');
    const canCreate = isAdmin || permissions.includes('create-appointment') || isReceptionist;
    const canEdit = isAdmin || permissions.includes('edit-appointment');
    const canDelete = isAdmin || permissions.includes('delete-appointment');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setIsLoading(true);
        try {
            const response = await getAllAppointmentsAPI();
            if (response.success) {
                // Map the data to flatten nested objects for easier access in columns
                const formattedAppointments = (response.appointments || []).map(app => ({
                    ...app,
                    patientName: app.patient?.name || 'N/A',
                    mrNumber: app.patient?.mrNumber || 'N/A',
                    doctorName: app.doctor?.name || 'N/A',
                    paymentStatus: app.transaction?.status || 'PENDING'
                }));

                // If Receptionist, show all. If Doctor, show only assigned.
                if (isReceptionist) {
                    setAppointments(formattedAppointments);
                } else {
                    const myAppointments = formattedAppointments.filter(
                        app => Number(app.doctorId) === Number(loggedInUserId)
                    );
                    setAppointments(myAppointments);
                }
            }
        } catch (error) {
            console.error("Failed to fetch appointments:", error);
            toast.error(error.message || "Failed to load appointments");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const response = await updateAppointmentAPI(id, { status: newStatus });
            if (response.success) {
                toast.success(`Appointment ${newStatus.toLowerCase()} successfully`);
                fetchAppointments();
            }
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error(error.message || "Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this appointment?")) {
            try {
                const response = await deleteAppointmentAPI(id);
                if (response.success) {
                    toast.success("Appointment deleted successfully");
                    fetchAppointments();
                }
            } catch (error) {
                console.error("Failed to delete appointment:", error);
                toast.error(error.message || "Failed to delete appointment");
            }
        }
    };

    const handlePrintReceipt = async (appointmentId) => {
        let paymentDataFetched = false;
        try {
            const res = await getAllPaymentsAPI({ appointmentId });
            if (res.success && res.payments && res.payments.length > 0) {
                setSelectedTransaction(res.payments[0]);
                setIsPrintModalOpen(true);
                paymentDataFetched = true;
            }
        } catch (error) {
            console.warn("API payment fetch failed, falling back to local data:", error);
        }

        if (!paymentDataFetched) {
            // Fallback to building a print object from the appointment data directly
            const appointment = appointments.find(a => a.id === appointmentId);
            if (appointment) {
                const tempTx = {
                    id: appointment.id,
                    createdAt: appointment.date || new Date(),
                    amount: appointment.doctor?.consultationFee || 500,
                    method: 'CASH',
                    status: 'PENDING',
                    notes: `Consultation Fee (Dr. ${appointment.doctorName})`,
                    patient: appointment.patient || { name: appointment.patientName, mrNumber: appointment.mrNumber },
                    category: { name: 'Appointment' },
                    appointment: {
                        id: appointment.id,
                        doctor: appointment.doctor || { name: appointment.doctorName },
                        queueToken: appointment.queueToken
                    }
                };
                setSelectedTransaction(tempTx);
                setIsPrintModalOpen(true);
            } else {
                toast.error("No transaction or appointment details found.");
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
            case 'COMPLETED': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const filteredAppointments = useMemo(() => appointments.filter(a =>
        a.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [appointments, searchTerm]);

    const columns = [
        {
            header: "Patient",
            render: (row) => (
                <div 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => navigate(`/staff/patients/view/${row.patientId}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(`/staff/patients/view/${row.patientId}`);
                        }
                    }}
                >
                    <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-xs group-hover:bg-teal-600 group-hover:text-white transition-all">
                        {row.patientName?.[0] || 'P'}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-900 group-hover:text-teal-600 transition-colors">{row.patientName || 'N/A'}</span>
                        <span className="text-[10px] text-slate-500">MR: {row.mrNumber || 'N/A'}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Doctor/Schedule",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-900 flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3 text-teal-500" />
                        {new Date(row.date).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {row.time} • {isReceptionist ? `Dr. ${row.doctorName || 'N/A'}` : 'Me'} • Token: {row.queueToken?.tokenNumber || 'N/A'}
                    </span>
                </div>
            )
        },
        {
            header: "Reason",
            key: "reason",
            render: (row) => <span className="text-sm text-slate-600 line-clamp-1 max-w-[150px]">{row.reason || 'No history'}</span>
        },
        {
            header: "Status",
            key: "status",
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border max-w-max ${getStatusColor(row.status)}`}>
                        Appt: {row.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border max-w-max ${row.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                        Pay: {row.paymentStatus}
                    </span>
                </div>
            )
        },
        {
            header: "Actions",
            render: (row) => (
                <div className="flex items-center gap-1">
                    {/* Clinical Consultation for Doctors */}
                    {!isReceptionist && row.status !== 'CANCELLED' && (
                        <button
                            onClick={() => navigate(`/staff/appointments/consult/${row.id}`)}
                            className={`p-1.5 rounded-lg transition-colors ${row.status === 'COMPLETED' ? 'text-teal-600 bg-teal-50 hover:bg-teal-100' : 'text-white bg-teal-600 hover:bg-teal-700 shadow-sm shadow-teal-600/20'}`}
                            title={row.status === 'COMPLETED' ? "View Consultation" : "Start Consultation"}
                        >
                            <Stethoscope className="w-4 h-4" />
                        </button>
                    )}
                    
                    {/* Quick Status Toggle for Non-Receptionists */}
                    {!isReceptionist && row.status === 'PENDING' && canEdit && (
                        <button
                            onClick={() => handleStatusUpdate(row.id, 'CONFIRMED')}
                            className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Confirm Appointment"
                        >
                            <CheckCircle className="w-4 h-4" />
                        </button>
                    )}
                    {row.status !== 'CANCELLED' && row.status !== 'COMPLETED' && canEdit && (
                        <button
                            onClick={() => handleStatusUpdate(row.id, 'CANCELLED')}
                            className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Cancel Appointment"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    )}
                    
                    <div className="w-px h-4 bg-slate-200 mx-1" />
                    
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePrintReceipt(row.id); }}
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Print Receipt"
                    >
                        <Printer className="w-4 h-4" />
                    </button>
                    
                    {canEdit && (
                        <button
                            onClick={() => navigate(`/staff/appointments/edit/${row.id}`)}
                            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Edit Details"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => handleDelete(row.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="animate-in fade-in duration-500 pb-10">
            <ListComponent
                title={isReceptionist ? "Clinic Appointments" : "My Appointments"}
                description={isReceptionist ? "Manage overall clinic schedule and patient bookings." : "View and manage your scheduled patient visits."}
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                onAdd={canCreate ? () => navigate('/staff/appointments/create') : null}
                addButtonText="Book Appointment"
            />

            <DataTable
                columns={columns}
                data={filteredAppointments}
                isLoading={isLoading}
                onRowClick={(row) => {
                    setSelectedAppointment(row);
                    setIsDetailsModalOpen(true);
                }}
                emptyMessage={
                    <div className="text-center py-12">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">No appointments found</h3>
                        <p className="text-slate-500 max-w-xs mx-auto mt-2">
                            {searchTerm ? "No records match your search criteria." : "There are no appointments scheduled at the moment."}
                        </p>
                    </div>
                }
            />

            <ThermalReceiptPrintView 
                isOpen={isPrintModalOpen} 
                onClose={() => { setIsPrintModalOpen(false); setSelectedTransaction(null); }} 
                transaction={selectedTransaction} 
            />

            <AppointmentDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedAppointment(null);
                }}
                appointment={selectedAppointment}
                onEdit={(id) => navigate(`/staff/appointments/edit/${id}`)}
                canEdit={canEdit}
                onConsult={(id) => navigate(`/staff/appointments/consult/${id}`)}
                canConsult={!isReceptionist && selectedAppointment?.status !== 'CANCELLED'}
                consultText={selectedAppointment?.status === 'COMPLETED' ? 'View Consultation' : 'Start Consultation'}
            />
        </div>
    );
};

export default StaffAppointments;

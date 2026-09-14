import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ListComponent from '../../../components/dashboard/ListComponent';
import DataTable from '../../../components/dashboard/DataTable';
import { getAllAppointmentsAPI, deleteAppointmentAPI } from '../../../api/admin/appointments';
import { getAllPaymentsAPI } from '../../../api/staff/payments';
import { Edit, Trash2, Calendar, Printer } from 'lucide-react';
import ThermalReceiptPrintView from '../finance/ThermalReceiptPrintView';
import AppointmentDetailsModal from '../../../components/dashboard/AppointmentDetailsModal';
import toast from 'react-hot-toast';

import { getFromLocalStorage } from '../../../helpers/localStorageFile';

const AppointmentList = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const role = (getFromLocalStorage('role') || localStorage.getItem('role'))?.toUpperCase();
    const userType = getFromLocalStorage('userType') || localStorage.getItem('userType');
    const isAdmin = role === 'ADMIN' || userType === 'SYSTEM_ADMIN';
    const permissions = JSON.parse(getFromLocalStorage('permissions') || localStorage.getItem('permissions') || '[]');

    const canCreate = isAdmin || permissions.includes('create-appointment');
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
                const formattedAppointments = (response.appointments || []).map(app => ({
                    ...app,
                    patientName: app.patient?.name || 'N/A',
                    mrNumber: app.patient?.mrNumber || 'N/A',
                    doctorName: app.doctor?.name || 'N/A',
                    paymentStatus: app.transaction?.status || 'PENDING'
                }));
                setAppointments(formattedAppointments);
            }
        } catch (error) {
            console.error("Failed to fetch appointments:", error);
            toast.error(error.message || "Failed to load appointments");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this appointment?')) {
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
        let transactionFetched = false;
        try {
            const res = await getAllPaymentsAPI({ appointmentId });
            if (res.success && res.payments && res.payments.length > 0) {
                setSelectedTransaction(res.payments[0]);
                setIsPrintModalOpen(true);
                transactionFetched = true;
            }
        } catch (error) {
            console.warn("API transaction fetch failed, falling back to local data:", error);
        }

        if (!transactionFetched) {
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
                toast.error("No transaction found for this appointment. It might not be completed yet.");
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-700';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            case 'COMPLETED': return 'bg-blue-100 text-blue-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    // Filter logic needs to expand based on nested data if available
    // Assuming backend returns flat ID fields for patient/doctor which isn't ideal for search, 
    // but typically we'd 'include' them in prisma query. 
    // For now searching on ID or Status or Reason.
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
                <div className="flex flex-col">
                    <span className="font-medium text-slate-900">{row.patientName}</span>
                    <span className="text-[10px] text-slate-500">MR: {row.mrNumber}</span>
                </div>
            )
        },
        {
            header: "Doctor/Schedule",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-900 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(row.date).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-slate-500">
                        {row.time} • Dr. {row.doctorName} • Token: {row.queueToken?.tokenNumber || 'N/A'}
                    </span>
                </div>
            )
        },
        {
            header: "Reason",
            key: "reason",
            render: (row) => <span className="font-medium text-slate-700">{row.reason}</span>
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
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePrintReceipt(row.id); }}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                        title="Print Receipt"
                    >
                        <Printer className="w-4 h-4" />
                    </button>
                    {canEdit && (
                        <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/dashboard/appointments/edit/${row.id}`); }}
                            className="p-2 hover:bg-teal-50 rounded-lg text-teal-600 transition-colors"
                            title="Edit Appointment"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                            title="Delete Appointment"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )
        }
    ];

    const filteredColumns = useMemo(() => columns.filter(col => {
        if (col.header === "Actions" && !canEdit && !canDelete) return false;
        return true;
    }), [canEdit, canDelete, columns]);

    return (
        <div className="animate-in fade-in duration-500 pb-10">
            <ListComponent
                title="Appointments"
                description="Manage patient appointments."
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                onAdd={canCreate ? () => {
                    const userType = localStorage.getItem('userType');
                    if (userType === 'SYSTEM_ADMIN') {
                        navigate('/admin/dashboard/appointments/create');
                    } else {
                        navigate('/staff/appointments/create');
                    }
                } : null}
                addButtonText="Book Appointment"
            />

            <DataTable
                columns={filteredColumns}
                data={filteredAppointments}
                isLoading={isLoading}
                emptyMessage="No appointments found."
                onRowClick={(row) => {
                    setSelectedAppointment(row);
                    setIsDetailsModalOpen(true);
                }}
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
                onEdit={(id) => navigate(`/admin/dashboard/appointments/edit/${id}`)}
                canEdit={canEdit}
            />
        </div>
    );
};

export default AppointmentList;

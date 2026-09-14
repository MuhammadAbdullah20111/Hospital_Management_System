import React, { useState, useEffect } from 'react';
import { Edit, Trash2, UserCircle } from 'lucide-react';
import { getAllBedsAPI, deleteBedAPI, updateBedStatusAPI } from '../../../api/admin/inpatient';
import { getAllPaymentsAPI } from '../../../api/staff/payments';
import CascadeInpatientDeleteModal from '../../../components/dashboard/CascadeInpatientDeleteModal';
import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import ListComponent from '../../../components/dashboard/ListComponent';
import DataTable from '../../../components/dashboard/DataTable';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getFromLocalStorage } from '../../../helpers/localStorageFile';
import BedActionModal from './BedActionModal';
import ThermalReceiptPrintView from '../finance/ThermalReceiptPrintView';
import { CheckCircle, LogOut, Printer } from 'lucide-react';

const BedList = () => {
    const navigate = useNavigate();
    const [beds, setBeds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalState, setModalState] = useState({
        isOpen: false,
        action: '',
        bed: null,
        assignment: null
    });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, bed: null });
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    // Permission checks
    const role = getFromLocalStorage('role')?.toUpperCase();
    const isAdmin = role === 'ADMIN';
    const permissions = JSON.parse(getFromLocalStorage('permissions') || '[]');
    
    const isReceptionist = role === 'RECEPTIONIST';
    const canCreate = isAdmin || permissions.includes('create-bed');
    const canEdit = isAdmin || permissions.includes('edit-bed');
    const canDelete = isAdmin || permissions.includes('delete-bed');
    const canAssign = isAdmin || isReceptionist || permissions.includes('assign-bed');
    const canDischarge = isAdmin || isReceptionist || permissions.includes('discharge-patient');

    useEffect(() => {
        fetchBeds(true);
        // Auto-refresh disabled
        // const interval = setInterval(() => fetchBeds(false), 30000);
        // return () => clearInterval(interval);
    }, []);

    const fetchBeds = async (showLoader = false) => {
        if (showLoader || beds.length === 0) setIsLoading(true);
        try {
            const response = await getAllBedsAPI();
            if (response.success) setBeds(response.beds);
        } catch (error) {
            console.error("Failed to fetch beds:", error);
            toast.error("Failed to load beds");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (bed) => {
        setDeleteModal({ isOpen: true, bed });
    };

    const confirmDelete = async (id) => {
        try {
            const response = await deleteBedAPI(id);
            if (response.success) {
                toast.success("Bed deleted successfully");
                fetchBeds();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete bed");
            throw error;
        }
    };
    
    const handleStatusUpdate = async (id, status) => {
        try {
            const response = await updateBedStatusAPI(id, status);
            if (response.success) {
                toast.success(`Bed marked as ${status}`);
                fetchBeds();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handlePrintReceipt = async (bedAssignmentId) => {
        try {
            const res = await getAllPaymentsAPI({ bedAssignmentId });
            if (res.success && res.payments && res.payments.length > 0) {
                setSelectedTransaction(res.payments[0]);
                setIsPrintModalOpen(true);
            } else {
                toast.error("No transaction found for this bed assignment. It might not be billed yet.");
            }
        } catch (error) {
            toast.error("Failed to fetch receipt details.");
        }
    };

    const openModal = (action, bed = null, assignment = null) => {
        setModalState({ isOpen: true, action, bed, assignment });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, action: '', bed: null, assignment: null });
    };

    const filteredBeds = beds.filter(b => 
        b.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.room?.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.room?.ward?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            header: "Bed #",
            key: "bedNumber",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="min-w-[40px] px-2 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center font-bold text-teal-600 text-xs whitespace-nowrap">
                        {row.bedNumber}
                    </div>
                    <div>
                        <span className="font-medium text-slate-900 block">{row.bedNumber}</span>
                        <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">{row.room?.roomNumber}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Location",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-sm text-slate-700">{row.room?.ward?.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase">Room {row.room?.roomNumber}</span>
                </div>
            )
        },
        {
            header: "Current Occupant",
            render: (row) => {
                const activeAssignment = row.assignments?.find(a => a.actualDischargeAt === null);
                return activeAssignment ? (
                    <div className="flex items-center gap-2">
                        <UserCircle className="w-4 h-4 text-teal-500" />
                        <div>
                            <span className="text-sm font-medium text-slate-800 block">{activeAssignment.patient?.name}</span>
                            <span className="text-[10px] text-slate-500">MR: {activeAssignment.patient?.mrNumber}</span>
                        </div>
                    </div>
                ) : (
                    <span className="text-xs text-slate-400">Available</span>
                );
            }
        },
        {
            header: "Status",
            key: "status",
            render: (row) => {
                const statusColors = {
                    'AVAILABLE': 'bg-green-100 text-green-700',
                    'OCCUPIED': 'bg-blue-100 text-blue-700',
                    'MAINTENANCE': 'bg-amber-100 text-amber-700',
                    'CLEANING': 'bg-purple-100 text-purple-700'
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[row.status] || 'bg-slate-100 text-slate-700'}`}>
                        {row.status}
                    </span>
                );
            }
        },
        {
            header: "Actions",
            render: (row) => {
                const isAvailable = row.status === 'AVAILABLE';
                const isOccupied = row.status === 'OCCUPIED';
                const isCleaning = row.status === 'CLEANING';
                const activeAssignment = row.assignments?.find(a => a.actualDischargeAt === null);

                return (
                    <div className="flex items-center gap-2">
                        {isCleaning && (canEdit || canAssign) && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(row.id, 'AVAILABLE'); }}
                                className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                                title="Mark as Available"
                            >
                                <CheckCircle className="w-4 h-4" />
                            </button>
                        )}
                        {activeAssignment && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handlePrintReceipt(activeAssignment.id); }}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                                title="Print Receipt"
                            >
                                <Printer className="w-4 h-4" />
                            </button>
                        )}
                        {isAvailable && canAssign && (
                            <button
                                onClick={(e) => { e.stopPropagation(); openModal('ASSIGN', row); }}
                                className="p-2 hover:bg-teal-50 rounded-lg text-teal-600 transition-colors"
                                title="Assign Patient"
                            >
                                <UserCircle className="w-4 h-4" />
                            </button>
                        )}
                        {isOccupied && canDischarge && (
                            <button
                                onClick={(e) => { e.stopPropagation(); openModal('DISCHARGE', row, activeAssignment); }}
                                className="p-2 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors"
                                title="Discharge Patient"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        )}
                        {canEdit && (
                            <button
                                onClick={(e) => { e.stopPropagation(); navigate(`edit/${row.id}`); }}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                                title="Edit Bed"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                        )}
                        {canDelete && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(row); }}
                                className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                                title="Delete Bed"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                );
            }
        }
    ];

    const filteredColumns = columns.filter(col => {
        if (col.header === "Actions") {
            return canEdit || canDelete || canAssign || canDischarge;
        }
        return true;
    });

    return (
        <div className="animate-in fade-in duration-500 pb-10">
            <ListComponent
                title="Bed Management"
                description="Monitor bed availability, status, and patient assignments across all wards."
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                onAdd={canCreate ? () => navigate('create') : null}
                addButtonText="Add Bed"
            />

            <DataTable
                columns={filteredColumns}
                data={filteredBeds}
                isLoading={isLoading}
                emptyMessage="No beds found."
                onRowClick={canEdit ? (row) => navigate(`edit/${row.id}`) : null}
            />

            <BedActionModal 
                isOpen={modalState.isOpen}
                onClose={closeModal}
                action={modalState.action}
                bed={modalState.bed}
                assignment={modalState.assignment}
                onRefresh={fetchBeds}
            />

            <CascadeInpatientDeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, bed: null })}
                type="BED"
                item={deleteModal.bed}
                onConfirm={confirmDelete}
            />

            <ThermalReceiptPrintView 
                isOpen={isPrintModalOpen} 
                onClose={() => { setIsPrintModalOpen(false); setSelectedTransaction(null); }} 
                transaction={selectedTransaction} 
            />
        </div>
    );
};

export default BedList;

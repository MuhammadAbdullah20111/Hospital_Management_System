import React, { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { getAllWardsAPI, deleteWardAPI } from '../../../api/admin/inpatient';
import CascadeInpatientDeleteModal from '../../../components/dashboard/CascadeInpatientDeleteModal';
import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import ListComponent from '../../../components/dashboard/ListComponent';
import DataTable from '../../../components/dashboard/DataTable';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getFromLocalStorage } from '../../../helpers/localStorageFile';

const WardList = () => {
    const navigate = useNavigate();
    const [wards, setWards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, ward: null });

    // Permission checks
    const role = getFromLocalStorage('role')?.toUpperCase();
    const isAdmin = role === 'ADMIN';
    const permissions = JSON.parse(getFromLocalStorage('permissions') || '[]');
    
    const canCreate = isAdmin || permissions.includes('create-ward');
    const canEdit = isAdmin || permissions.includes('edit-ward');
    const canDelete = isAdmin || permissions.includes('delete-ward');

    useEffect(() => {
        fetchWards(true);
        // Auto-refresh disabled
        // const interval = setInterval(() => fetchWards(false), 30000);
        // return () => clearInterval(interval);
    }, []);

    const fetchWards = async (showLoader = false) => {
        if (showLoader || wards.length === 0) setIsLoading(true);
        try {
            const response = await getAllWardsAPI();
            if (response.success) setWards(response.wards);
        } catch (error) {
            console.error("Failed to fetch wards:", error);
            toast.error("Failed to load wards");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (ward) => {
        setDeleteModal({ isOpen: true, ward });
    };

    const confirmDelete = async (id) => {
        try {
            const response = await deleteWardAPI(id);
            if (response.success) {
                toast.success("Ward deleted successfully");
                fetchWards();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete ward");
            throw error; // Re-throw to let the modal handle the error state if needed
        }
    };

    const filteredWards = wards.filter(w => 
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            header: "Name",
            key: "name",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700 text-xs">
                        {row.name[0]}
                    </div>
                    <div>
                        <span className="font-medium text-slate-900 block">{row.name}</span>
                        <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">{row.code}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Capacity",
            key: "capacity",
            render: (row) => {
                const occupiedCount = row.beds?.length || 0;
                const totalBeds = row._count.beds || 1;
                const percentage = Math.min((occupiedCount / totalBeds) * 100, 100);

                let barColor = "bg-teal-500";
                if (percentage > 90) barColor = "bg-rose-500";
                else if (percentage > 70) barColor = "bg-amber-500";

                return (
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col min-w-[80px]">
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="font-bold text-slate-700">{occupiedCount}/{row._count.beds} Beds</span>
                                <span className="text-slate-400">{Math.round(percentage)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/50">
                                <div 
                                    className={`${barColor} h-full transition-all duration-500 ease-out`} 
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="flex flex-col border-l border-slate-100 pl-3">
                            <span className="text-[11px] font-medium text-slate-600">{row._count.rooms} Rooms</span>
                            <span className="text-[9px] text-slate-400 uppercase">Configured</span>
                        </div>
                    </div>
                );
            }
        },
        {
            header: "Status",
            key: "isActive",
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {row.isActive ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            header: "Actions",
            render: (row) => (
                <div className="flex items-center gap-2">
                    {canEdit && (
                        <button
                            onClick={(e) => { e.stopPropagation(); navigate(`edit/${row.id}`); }}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                            title="Edit Ward"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(row); }}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                            title="Delete Ward"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )
        }
    ];

    const filteredColumns = columns.filter(col => {
        if (col.header === "Actions" && !canEdit && !canDelete) return false;
        return true;
    });

    return (
        <div className="animate-in fade-in duration-500 pb-10">
            <ListComponent
                title="Ward Management"
                description="Configure inpatient facility units, wards, and departments."
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                onAdd={canCreate ? () => navigate('create') : null}
                addButtonText="Add Ward"
            />

            <DataTable
                columns={filteredColumns}
                data={filteredWards}
                isLoading={isLoading}
                emptyMessage="No wards found."
                onRowClick={canEdit ? (row) => navigate(`edit/${row.id}`) : null}
            />

            <CascadeInpatientDeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, ward: null })}
                type="WARD"
                item={deleteModal.ward}
                onConfirm={confirmDelete}
            />
        </div>
    );
};

export default WardList;

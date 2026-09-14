import React, { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { getAllRoomsAPI, deleteRoomAPI } from '../../../api/admin/inpatient';
import CascadeInpatientDeleteModal from '../../../components/dashboard/CascadeInpatientDeleteModal';
import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import ListComponent from '../../../components/dashboard/ListComponent';
import DataTable from '../../../components/dashboard/DataTable';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getFromLocalStorage } from '../../../helpers/localStorageFile';

const RoomList = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, room: null });

    // Permission checks
    const role = getFromLocalStorage('role')?.toUpperCase();
    const isAdmin = role === 'ADMIN';
    const permissions = JSON.parse(getFromLocalStorage('permissions') || '[]');
    
    const canCreate = isAdmin || permissions.includes('create-room');
    const canEdit = isAdmin || permissions.includes('edit-room');
    const canDelete = isAdmin || permissions.includes('delete-room');

    useEffect(() => {
        fetchRooms(true);
        // Auto-refresh disabled
        // const interval = setInterval(() => fetchRooms(false), 30000);
        // return () => clearInterval(interval);
    }, []);

    const fetchRooms = async (showLoader = false) => {
        if (showLoader || rooms.length === 0) setIsLoading(true);
        try {
            const response = await getAllRoomsAPI();
            if (response.success) setRooms(response.rooms);
        } catch (error) {
            console.error("Failed to fetch rooms:", error);
            toast.error("Failed to load rooms");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (room) => {
        setDeleteModal({ isOpen: true, room });
    };

    const confirmDelete = async (id) => {
        try {
            const response = await deleteRoomAPI(id);
            if (response.success) {
                toast.success("Room deleted successfully");
                fetchRooms();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete room");
            throw error;
        }
    };

    const filteredRooms = rooms.filter(r => 
        r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.ward?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            header: "Room #",
            key: "roomNumber",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="min-w-[40px] px-2 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center font-bold text-teal-600 text-xs whitespace-nowrap">
                        {row.roomNumber}
                    </div>
                    <div>
                        <span className="font-semibold text-slate-900 block">Room {row.roomNumber}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Ward",
            key: "ward",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-sm text-slate-700">{row.ward?.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase">{row.ward?.code}</span>
                </div>
            )
        },
        {
            header: "Category / Daily Rate",
            key: "category",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">{row.category?.name || "Unassigned"}</span>
                    {row.category && (
                        <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Rs. {row.category.pricePerDay} / day</span>
                    )}
                </div>
            )
        },
        {
            header: "Occupancy",
            key: "occupancy",
            render: (row) => {
                const occupiedCount = row.beds?.length || 0;
                const totalBeds = row._count?.beds || 0;
                const percentage = totalBeds > 0 ? Math.min((occupiedCount / totalBeds) * 100, 100) : 0;
                
                let barColor = "bg-teal-500";
                if (percentage > 90) barColor = "bg-rose-500";
                else if (percentage > 70) barColor = "bg-amber-500";

                return (
                    <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                            <div 
                                className={`${totalBeds > 0 ? barColor : 'bg-slate-200'} h-full transition-all duration-500 ease-out`} 
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-1">
                                <span className="text-[11px] font-bold text-slate-700 leading-none">{occupiedCount}</span>
                                <span className="text-[10px] text-slate-400">/ {totalBeds}</span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">Beds Occupied</span>
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
                            title="Edit Room"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(row); }}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                            title="Delete Room"
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
                title="Room Management"
                description="Manage individual patient rooms, categories, and ward assignments."
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                onAdd={canCreate ? () => navigate('create') : null}
                addButtonText="Add Room"
            />

            <DataTable
                columns={filteredColumns}
                data={filteredRooms}
                isLoading={isLoading}
                emptyMessage="No rooms found."
                onRowClick={canEdit ? (row) => navigate(`edit/${row.id}`) : null}
            />

            <CascadeInpatientDeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, room: null })}
                type="ROOM"
                item={deleteModal.room}
                onConfirm={confirmDelete}
            />
        </div>
    );
};

export default RoomList;

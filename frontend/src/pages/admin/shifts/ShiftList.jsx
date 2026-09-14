import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListComponent from '../../../components/dashboard/ListComponent';
import DataTable from '../../../components/dashboard/DataTable';
import { getAllShiftsAPI, deleteShiftAPI } from '../../../api/admin/shifts';
import { Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { getFromLocalStorage } from '../../../helpers/localStorageFile';

const ShiftList = () => {
    const navigate = useNavigate();
    const [shifts, setShifts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const role = (getFromLocalStorage('role') || localStorage.getItem('role'))?.toUpperCase();
    const userType = getFromLocalStorage('userType') || localStorage.getItem('userType');
    const isAdmin = role === 'ADMIN' || userType === 'SYSTEM_ADMIN';
    const permissions = JSON.parse(getFromLocalStorage('permissions') || localStorage.getItem('permissions') || '[]');

    const canCreate = isAdmin || permissions.includes('create-shift');
    const canEdit = isAdmin || permissions.includes('edit-shift');
    const canDelete = isAdmin || permissions.includes('delete-shift');

    useEffect(() => {
        fetchShifts();
    }, []);

    const fetchShifts = async () => {
        setIsLoading(true);
        try {
            const response = await getAllShiftsAPI();
            if (response.success) {
                setShifts(response.shifts);
            }
        } catch (error) {
            console.error("Failed to fetch shifts:", error);
            toast.error(error.message || "Failed to load shifts");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete the shift "${name}"?`)) {
            try {
                const response = await deleteShiftAPI(id);
                if (response.success) {
                    toast.success("Shift deleted successfully");
                    fetchShifts();
                }
            } catch (error) {
                console.error("Failed to delete shift:", error);
                toast.error(error.message || "Failed to delete shift");
            }
        }
    };

    const filteredShifts = shifts.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const columns = [
        {
            header: "Shift Name",
            key: "name",
            render: (row) => (
                <span className="font-medium text-slate-900">{row.name}</span>
            )
        },
        {
            header: "Department",
            key: "department",
            render: (row) => (
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
                    {row.department ? row.department.name : "General"}
                </span>
            )
        },
        {
            header: "Days",
            key: "days",
            render: (row) => (
                <div className="flex flex-wrap gap-1">
                    {row.slots && row.slots.length > 0 ? (
                        row.slots.map((slot, i) => {
                            const start = slot.startDayOfWeek.substring(0, 3);
                            const end = slot.endDayOfWeek.substring(0, 3);
                            const dayText = start === end ? start : `${start}-${end}`;
                            return (
                                <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                                    {dayText}
                                </span>
                            );
                        })
                    ) : (
                        <span className="text-slate-400">N/A</span>
                    )}
                </div>
            )
        },
        {
            header: "Actions",
            render: (row) => (
                <div className="flex items-center gap-2">
                    {canEdit && (
                        <button
                            onClick={() => {
                                const basePath = userType === 'SYSTEM_ADMIN' ? '/admin/dashboard' : '/staff';
                                navigate(`${basePath}/shifts/edit/${row.id}`);
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                            title="Edit Shift"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => handleDelete(row.id, row.name)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                            title="Delete Shift"
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
                title="Shift Management"
                description="Manage working shifts for hospital staff."
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                onAdd={canCreate ? () => {
                    const basePath = userType === 'SYSTEM_ADMIN' ? '/admin/dashboard' : '/staff';
                    navigate(`${basePath}/shifts/create`);
                } : null}
                addButtonText="Create Shift"
            />

            <DataTable
                columns={filteredColumns}
                data={filteredShifts}
                isLoading={isLoading}
                emptyMessage="No shifts found."
                onRowClick={canEdit ? (row) => {
                    const basePath = userType === 'SYSTEM_ADMIN' ? '/admin/dashboard' : '/staff';
                    navigate(`${basePath}/shifts/edit/${row.id}`);
                } : null}
            />
        </div>
    );
};

export default ShiftList;

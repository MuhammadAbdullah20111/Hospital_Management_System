import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListComponent from '../../../components/dashboard/ListComponent';
import DataTable from '../../../components/dashboard/DataTable';
import { getAllStaffAPI, deleteStaffAPI } from '../../../api/admin/staff';
import { Mail, Phone, ShieldCheck, Clock, Building2, MoreVertical, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { getFromLocalStorage } from '../../../helpers/localStorageFile';

const StaffList = () => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const role = (getFromLocalStorage('role') || localStorage.getItem('role'))?.toUpperCase();
    const userType = getFromLocalStorage('userType') || localStorage.getItem('userType');
    const isAdmin = role === 'ADMIN' || userType === 'SYSTEM_ADMIN';
    const permissions = JSON.parse(getFromLocalStorage('permissions') || localStorage.getItem('permissions') || '[]');

    const canCreate = isAdmin || permissions.includes('create-staff');
    const canEdit = isAdmin || permissions.includes('edit-staff');
    const canDelete = isAdmin || permissions.includes('delete-staff');
    const canView = isAdmin || permissions.includes('view-staff');

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setIsLoading(true);
        try {
            const response = await getAllStaffAPI();
            if (response.success) {
                setStaff(response.staff);
            }
        } catch (error) {
            console.error("Failed to fetch staff:", error);
            toast.error(error.message || "Failed to load staff members");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                const response = await deleteStaffAPI(id);
                if (response.success) {
                    toast.success("Staff member deleted successfully");
                    fetchStaff();
                }
            } catch (error) {
                console.error("Failed to delete staff:", error);
                toast.error(error.message || "Failed to delete staff member");
            }
        }
    };

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.role && s.role.toLowerCase().includes(searchTerm.toLowerCase()))
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
                    <span className="font-medium text-slate-900">{row.name}</span>
                </div>
            )
        },
        {
            header: "Role",
            key: "role",
            render: (row) => <span className="text-slate-600">{row.role || 'N/A'}</span>
        },
        {
            header: "Department",
            key: "department",
            render: (row) => <span className="text-slate-600">{row.department || '-'}</span>
        },
        {
            header: "Shift",
            key: "shift",
            render: (row) => <span className="text-slate-600">{row.shift || '-'}</span>
        },
        {
            header: "Status",
            key: "isActive",
            render: (row) => (
                <span className={`text-xs font-semibold ${row.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {row.isActive ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            header: "Actions",
            key: "actions",
            render: (row) => (
                <div className="flex items-center gap-2">
                    {canEdit && (
                        <button
                            onClick={() => {
                                const basePath = userType === 'SYSTEM_ADMIN' ? '/admin/dashboard' : '/staff';
                                navigate(`${basePath}/staff/edit/${row.id}`);
                            }}
                            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Edit Staff"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => handleDelete(row.id, row.name)}
                            className="p-1.5 text-red-600 rounded-lg transition-colors"
                            title="Delete Staff"
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
                title="Staff Management"
                description="View and manage hospital staff members, their roles, and assignments."
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                onAdd={canCreate ? () => {
                    const basePath = userType === 'SYSTEM_ADMIN' ? '/admin/dashboard' : '/staff';
                    navigate(`${basePath}/staff/create`);
                } : null}
                addButtonText="Add Staff"
            />

            <DataTable
                columns={filteredColumns}
                data={filteredStaff}
                isLoading={isLoading}
                emptyMessage="No staff members found matching your search."
                onRowClick={canView ? (row) => {
                    const basePath = userType === 'SYSTEM_ADMIN' ? '/admin/dashboard' : '/staff';
                    navigate(`${basePath}/staff/view/${row.id}`);
                } : null}
            />
        </div>
    );
};

export default StaffList;

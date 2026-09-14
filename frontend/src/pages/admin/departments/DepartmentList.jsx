import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListComponent from '../../../components/dashboard/ListComponent';
import DataTable from '../../../components/dashboard/DataTable';
import { getAllDepartmentsAPI, deleteDepartmentAPI } from '../../../api/admin/departments';
import { Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { getFromLocalStorage } from '../../../helpers/localStorageFile';

const DepartmentList = () => {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const role = (getFromLocalStorage('role') || localStorage.getItem('role'))?.toUpperCase();
    const userType = getFromLocalStorage('userType') || localStorage.getItem('userType');
    const isAdmin = role === 'ADMIN' || userType === 'SYSTEM_ADMIN';
    const permissions = JSON.parse(getFromLocalStorage('permissions') || localStorage.getItem('permissions') || '[]');

    const canCreate = isAdmin || permissions.includes('create-department');
    const canEdit = isAdmin || permissions.includes('edit-department');
    const canDelete = isAdmin || permissions.includes('delete-department');

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setIsLoading(true);
        try {
            const response = await getAllDepartmentsAPI();
            if (response.success) {
                setDepartments(response.departments);
            }
        } catch (error) {
            console.error("Failed to fetch departments:", error);
            toast.error(error.message || "Failed to load departments");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete the department "${name}"?`)) {
            try {
                const response = await deleteDepartmentAPI(id);
                if (response.success) {
                    toast.success("Department deleted successfully");
                    fetchDepartments();
                }
            } catch (error) {
                console.error("Failed to delete department:", error);
                toast.error(error.message || "Failed to delete department");
            }
        }
    };

    const filteredDepartments = departments.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                        {row.description && <span className="text-xs text-slate-500">{row.description}</span>}
                    </div>
                </div>
            )
        },
        {
            header: "Status",
            key: "isActive",
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
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
                            onClick={() => {
                                const basePath = userType === 'SYSTEM_ADMIN' ? '/admin/dashboard' : '/staff';
                                navigate(`${basePath}/departments/edit/${row.id}`);
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                            title="Edit Department"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => handleDelete(row.id, row.name)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                            title="Delete Department"
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
                title="Department Management"
                description="Manage hospital departments and units."
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                onAdd={canCreate ? () => {
                    const basePath = userType === 'SYSTEM_ADMIN' ? '/admin/dashboard' : '/staff';
                    navigate(`${basePath}/departments/create`);
                } : null}
                addButtonText="Create Department"
            />

            <DataTable
                columns={filteredColumns}
                data={filteredDepartments}
                isLoading={isLoading}
                emptyMessage="No departments found."
                onRowClick={canEdit ? (row) => {
                    const basePath = userType === 'SYSTEM_ADMIN' ? '/admin/dashboard' : '/staff';
                    navigate(`${basePath}/departments/edit/${row.id}`);
                } : null}
            />
        </div>
    );
};

export default DepartmentList;

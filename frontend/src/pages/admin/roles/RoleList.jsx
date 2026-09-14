import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListComponent from '../../../components/dashboard/ListComponent';
import DataTable from '../../../components/dashboard/DataTable';
import { getAllRolesAPI, deleteRoleAPI, getRoleDependenciesAPI } from '../../../api/admin/roles';
import CascadeRoleDeleteModal from '../../../components/dashboard/CascadeRoleDeleteModal';
import { ShieldCheck, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { getFromLocalStorage } from '../../../helpers/localStorageFile';

const RoleList = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);

    const role = (getFromLocalStorage('role') || localStorage.getItem('role'))?.toUpperCase();
    const userType = getFromLocalStorage('userType') || localStorage.getItem('userType');
    const isAdmin = role === 'ADMIN' || userType === 'SYSTEM_ADMIN';
    const permissions = JSON.parse(getFromLocalStorage('permissions') || localStorage.getItem('permissions') || '[]');

    const canCreate = isAdmin || permissions.includes('create-role');
    const canEdit = isAdmin || permissions.includes('edit-role');
    const canDelete = isAdmin || permissions.includes('delete-role');

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setIsLoading(true);
        try {
            const response = await getAllRolesAPI();
            if (response.success) {
                setRoles(response.roles);
            }
        } catch (error) {
            console.error("Failed to fetch roles:", error);
            toast.error(error.message || "Failed to load roles");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFetchDependencies = async (id) => {
        const res = await getRoleDependenciesAPI(id);
        if (res.success) {
            return res.dependencies;
        }
        throw new Error(res.message);
    };

    const handleDeleteClick = (role) => {
        setRoleToDelete(role);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async (id, replacementRoleId) => {
        try {
            const response = await deleteRoleAPI(id, replacementRoleId);
            if (response.success) {
                toast.success("Role deleted successfully");
                fetchRoles();
            }
        } catch (error) {
            console.error("Failed to delete role:", error);
            toast.error(error.message || "Failed to delete role");
        }
    };

    const filteredRoles = roles.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            header: "Role Name",
            key: "name",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs">
                        {row.name[0]}
                    </div>
                    <span className="font-medium text-slate-900">{row.name}</span>
                </div>
            )
        },
        {
            header: "Permissions",
            key: "permissions",
            render: (row) => (
                <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
                    {row.permissions ? row.permissions.length : 0} Permissions
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
                                navigate(`${basePath}/roles/edit/${row.id}`);
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                            title="Edit Role"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => handleDeleteClick(row)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                            title="Delete Role"
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
                title="Role Management"
                description="Manage user roles and their associated system permissions."
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                onAdd={canCreate ? () => {
                    const basePath = userType === 'SYSTEM_ADMIN' ? '/admin/dashboard' : '/staff';
                    navigate(`${basePath}/roles/create`);
                } : null}
                addButtonText="Create Role"
            />

            <DataTable
                columns={filteredColumns}
                data={filteredRoles}
                isLoading={isLoading}
                emptyMessage="No roles found."
                onRowClick={canEdit ? (row) => {
                    const basePath = userType === 'SYSTEM_ADMIN' ? '/admin/dashboard' : '/staff';
                    navigate(`${basePath}/roles/edit/${row.id}`);
                } : null}
            />

            <CascadeRoleDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                role={roleToDelete}
                allRoles={roles}
                fetchDependencies={handleFetchDependencies}
                onDelete={handleConfirmDelete}
            />
        </div>
    );
};

export default RoleList;

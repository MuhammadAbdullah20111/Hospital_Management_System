import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListComponent from '../../../components/dashboard/ListComponent';
import DataTable from '../../../components/dashboard/DataTable';
import { getAllServicesAPI, deleteServiceAPI } from '../../../api/admin/services';
import { Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { getFromLocalStorage } from '../../../helpers/localStorageFile';

const ServiceList = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const role = (getFromLocalStorage('role') || localStorage.getItem('role'))?.toUpperCase();
    const userType = getFromLocalStorage('userType') || localStorage.getItem('userType');
    const isAdmin = role === 'ADMIN' || userType === 'SYSTEM_ADMIN';
    const permissions = JSON.parse(getFromLocalStorage('permissions') || localStorage.getItem('permissions') || '[]');

    const canCreate = isAdmin || permissions.includes('create-service');
    const canEdit = isAdmin || permissions.includes('edit-service');
    const canDelete = isAdmin || permissions.includes('delete-service');

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const response = await getAllServicesAPI();
            if (response.success) {
                setServices(response.services);
            }
        } catch (error) {
            console.error("Failed to fetch services:", error);
            toast.error(error.message || "Failed to load services");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete the service "${name}"?`)) {
            try {
                const response = await deleteServiceAPI(id);
                if (response.success) {
                    toast.success("Service deleted successfully");
                    fetchServices();
                }
            } catch (error) {
                console.error("Failed to delete service:", error);
                toast.error(error.message || "Failed to delete service");
            }
        }
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.category && s.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const columns = [
        {
            header: "Service Name",
            key: "name",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center font-bold text-teal-700 text-xs">
                        {row.name[0]}
                    </div>
                    <div>
                        <span className="font-medium text-slate-900 block">{row.name}</span>
                        {row.category && <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{row.category}</span>}
                    </div>
                </div>
            )
        },
        {
            header: "Price",
            key: "baseCost",
            render: (row) => <span className="font-semibold text-slate-700">Rs.{row.baseCost}</span>
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
                                navigate(`${basePath}/services/edit/${row.id}`);
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                            title="Edit Service"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => handleDelete(row.id, row.name)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                            title="Delete Service"
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
                title="Service Management"
                description="Manage medical services, costs, and details."
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                onAdd={canCreate ? () => {
                    const basePath = userType === 'SYSTEM_ADMIN' ? '/admin/dashboard' : '/staff';
                    navigate(`${basePath}/services/create`);
                } : null}
                addButtonText="Create Service"
            />

            <DataTable
                columns={filteredColumns}
                data={filteredServices}
                isLoading={isLoading}
                emptyMessage="No services found."
                onRowClick={canEdit ? (row) => {
                    const basePath = userType === 'SYSTEM_ADMIN' ? '/admin/dashboard' : '/staff';
                    navigate(`${basePath}/services/edit/${row.id}`);
                } : null}
            />
        </div>
    );
};

export default ServiceList;

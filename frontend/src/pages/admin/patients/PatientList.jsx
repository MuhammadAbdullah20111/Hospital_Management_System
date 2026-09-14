import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ListComponent from '../../../components/dashboard/ListComponent';
import DataTable from '../../../components/dashboard/DataTable';
import { getAllPatientsAPI, deletePatientAPI } from '../../../api/admin/patients';
import { Eye, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { getFromLocalStorage } from '../../../helpers/localStorageFile';

const PatientList = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const role = (getFromLocalStorage('role') || localStorage.getItem('role'))?.toUpperCase();
    const userType = getFromLocalStorage('userType') || localStorage.getItem('userType');
    const isAdmin = role === 'ADMIN' || userType === 'SYSTEM_ADMIN';
    const permissions = JSON.parse(getFromLocalStorage('permissions') || localStorage.getItem('permissions') || '[]');

    const canCreate = isAdmin || permissions.includes('create-patient');
    const canEdit = isAdmin || permissions.includes('edit-patient');
    const canDelete = isAdmin || permissions.includes('delete-patient');
    const canView = isAdmin || permissions.includes('view-patient');

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        setIsLoading(true);
        try {
            const response = await getAllPatientsAPI();
            if (response.success) {
                setPatients(response.patients);
            }
        } catch (error) {
            console.error("Failed to fetch patients:", error);
            toast.error(error.message || "Failed to load patients");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete the patient "${name}"?`)) {
            try {
                const response = await deletePatientAPI(id);
                if (response.success) {
                    toast.success("Patient deleted successfully");
                    fetchPatients();
                }
            } catch (error) {
                console.error("Failed to delete patient:", error);
                toast.error(error.message || "Failed to delete patient");
            }
        }
    };

    const filteredPatients = useMemo(() => patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phoneNumber?.includes(searchTerm) ||
        p.mrNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [patients, searchTerm]);

    const columns = [
        {
            header: "MR Number",
            key: "mrNumber",
            render: (row) => <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded">{row.mrNumber}</span>
        },
        {
            header: "Patient Name",
            key: "name",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700 text-xs">
                        {row.name[0]}
                    </div>
                    <div>
                        <span className="font-medium text-slate-900 block">{row.name}</span>
                        <span className="text-xs text-slate-500">{row.email}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Contact",
            key: "phoneNumber",
        },
        {
            header: "Age",
            render: (row) => <span className="text-sm">{row.age}</span>
        },
        {
                header: "Gender",
            render: (row) => <span className="text-sm">{row.gender}</span>
        },
        {
            header: "Actions",
            render: (row) => (
                <div className="flex items-center gap-2">
                    {canView && (
                        <button
                            onClick={() => {
                                const basePath = userType === 'SYSTEM_ADMIN' ? '/admin/dashboard' : '/staff';
                                navigate(`${basePath}/patients/view/${row.id}`);
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                            title="View Details"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    )}
                    {canEdit && (
                        <button
                            onClick={() => {
                                const basePath = userType === 'SYSTEM_ADMIN' ? '/admin/dashboard' : '/staff';
                                navigate(`${basePath}/patients/edit/${row.id}`);
                            }}
                            className="p-2 hover:bg-teal-50 rounded-lg text-teal-600 transition-colors"
                            title="Edit Patient"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => handleDelete(row.id, row.name)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                            title="Delete Patient"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )
        }
    ];

    const filteredColumns = useMemo(() => columns.filter(col => {
        if (col.header === "Actions" && !canEdit && !canDelete && !canView) return false;
        return true;
    }), [canEdit, canDelete, canView, columns]);

    return (
        <div className="animate-in fade-in duration-500 pb-10">
            <ListComponent
                title="Patient Directory"
                description="Manage patient records and information."
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                onAdd={canCreate ? () => {
                    const userType = localStorage.getItem('userType');
                    if (userType === 'SYSTEM_ADMIN') {
                        navigate('/admin/dashboard/patients/create');
                    } else {
                        navigate('/staff/patients/create');
                    }
                } : null}
                addButtonText="Register Patient"
            />

            <DataTable
                columns={filteredColumns}
                data={filteredPatients}
                isLoading={isLoading}
                emptyMessage="No patients found."
                onRowClick={canView ? (row) => {
                    const basePath = userType === 'SYSTEM_ADMIN' ? '/admin/dashboard' : '/staff';
                    navigate(`${basePath}/patients/view/${row.id}`);
                } : null}
            />
        </div>
    );
};

export default PatientList;

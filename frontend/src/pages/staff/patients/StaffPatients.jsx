import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListComponent from '../../../components/dashboard/ListComponent';
import DataTable from '../../../components/dashboard/DataTable';
import { getAllPatientsAPI } from '../../../api/staff/patients';
import { Eye, Users, Search, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const StaffPatients = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const role = (localStorage.getItem('role'))?.toUpperCase();
    const isAdmin = role === 'ADMIN';
    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');

    const canCreate = isAdmin || permissions.includes('create-patient');
    const canEdit = isAdmin || permissions.includes('edit-patient');
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

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phoneNumber?.includes(searchTerm) ||
        p.mrNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center font-bold text-teal-700 text-xs">
                        {row.name?.[0] || 'P'}
                    </div>
                    <div>
                        <span className="font-medium text-slate-900 block text-sm">{row.name}</span>
                        <span className="text-xs text-slate-500">{row.email}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Contact",
            key: "phoneNumber",
            render: (row) => <span className="text-sm text-slate-600">{row.phoneNumber}</span>
        },
        {
            header: "Age/Gender",
            render: (row) => <span className="text-sm text-slate-600">{row.age} / {row.gender}</span>
        },
        {
            header: "Actions",
            render: (row) => (
                <div className="flex items-center gap-2">
                    {canView && (
                        <button
                            onClick={() => navigate(`/staff/patients/view/${row.id}`)}
                            className="p-2 hover:bg-teal-50 rounded-lg text-slate-500 transition-colors"
                            title="View Details"
                        >
                            <Eye className="w-4 h-4 text-teal-600" />
                        </button>
                    )}
                    {canEdit && (
                        <button
                            onClick={() => navigate(`/staff/patients/edit/${row.id}`)}
                            className="p-2 hover:bg-teal-50 rounded-lg text-slate-500 transition-colors"
                            title="Edit Patient"
                        >
                            <Edit className="w-4 h-4 text-teal-600" />
                        </button>
                    )}
                </div>
            )
        }
    ];

    const filteredColumns = columns.filter(col => {
        if (col.header === "Actions" && !canEdit && !canView) return false;
        return true;
    });

    return (
        <div className="animate-in fade-in duration-500 pb-10">
            <ListComponent
                title="Patient Directory"
                description="Search and view patient records."
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                onAdd={canCreate ? () => navigate('/staff/patients/create') : null}
                addButtonText="Register Patient"
            />

            <DataTable
                columns={filteredColumns}
                data={filteredPatients}
                isLoading={isLoading}
                emptyMessage={
                    <div className="text-center py-12">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">No patients found</h3>
                        <p className="text-slate-500 max-w-xs mx-auto mt-2">
                            We couldn't find any patients matching your search query.
                        </p>
                    </div>
                }
                onRowClick={canView ? (row) => navigate(`/staff/patients/view/${row.id}`) : null}
            />
        </div>
    );
};

export default StaffPatients;

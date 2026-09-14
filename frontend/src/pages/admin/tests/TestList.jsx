import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListComponent from '../../../components/dashboard/ListComponent';
import DataTable from '../../../components/dashboard/DataTable';
import { getAllTestsAPI, deleteTestAPI } from '../../../api/admin/tests';
import { Edit, Trash2, Beaker } from 'lucide-react';
import toast from 'react-hot-toast';

import { getFromLocalStorage } from '../../../helpers/localStorageFile';

const TestList = () => {
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const role = (getFromLocalStorage('role') || localStorage.getItem('role'))?.toUpperCase();
    const userType = getFromLocalStorage('userType') || localStorage.getItem('userType');
    const isAdmin = role === 'ADMIN' || userType === 'SYSTEM_ADMIN';
    const permissions = JSON.parse(getFromLocalStorage('permissions') || localStorage.getItem('permissions') || '[]');

    const canCreate = isAdmin || permissions.includes('create-test');
    const canEdit = isAdmin || permissions.includes('edit-test');
    const canDelete = isAdmin || permissions.includes('delete-test');

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        setIsLoading(true);
        try {
            const response = await getAllTestsAPI();
            if (response.success) {
                setTests(response.tests);
            }
        } catch (error) {
            console.error("Failed to fetch tests:", error);
            toast.error(error.message || "Failed to load tests");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete the test "${name}"?`)) {
            try {
                const response = await deleteTestAPI(id);
                if (response.success) {
                    toast.success("Test deleted successfully");
                    fetchTests();
                }
            } catch (error) {
                console.error("Failed to delete test:", error);
                toast.error(error.message || "Failed to delete test");
            }
        }
    };

    const filteredTests = tests.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const columns = [
        {
            header: "Test Name",
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
            key: "price",
            render: (row) => <span className="font-semibold text-slate-700">Rs.{row.price}</span>
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
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/dashboard/tests/edit/${row.id}`);
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                            title="Edit Test"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(row.id, row.name);
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                            title="Delete Test"
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
                title="Test"
                description="Manage the list of available laboratory tests and their standard pricing."
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                onAdd={canCreate ? () => navigate('/admin/dashboard/tests/create') : null}
                addButtonText="Create Test"
            />

            <DataTable
                columns={filteredColumns}
                data={filteredTests}
                isLoading={isLoading}
                emptyMessage="No tests found."
                onRowClick={canEdit ? (row) => navigate(`/admin/dashboard/tests/edit/${row.id}`) : null}
            />
        </div>
    );
};

export default TestList;

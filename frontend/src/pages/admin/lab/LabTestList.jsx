import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListComponent from '../../../components/dashboard/ListComponent';
import DataTable from '../../../components/dashboard/DataTable';
import { getAllLabTestsAPI, deleteLabTestAPI } from '../../../api/admin/labTests';
import { getAllPaymentsAPI } from '../../../api/staff/payments';
import { Trash2, AlertCircle, FileEdit, Printer } from 'lucide-react';
import ThermalReceiptPrintView from '../finance/ThermalReceiptPrintView';
import toast from 'react-hot-toast';

import { getFromLocalStorage } from '../../../helpers/localStorageFile';

const LabTestList = () => {
    const navigate = useNavigate();
    const [labTests, setLabTests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const role = (getFromLocalStorage('role') || localStorage.getItem('role'))?.toUpperCase();
    const userType = getFromLocalStorage('userType') || localStorage.getItem('userType');
    const isAdmin = role === 'ADMIN' || userType === 'SYSTEM_ADMIN';
    const permissions = JSON.parse(getFromLocalStorage('permissions') || localStorage.getItem('permissions') || '[]');

    const canCreate = isAdmin || permissions.includes('create-labtest');
    const canEdit = isAdmin || permissions.includes('edit-labtest');
    const canDelete = isAdmin || permissions.includes('delete-labtest');

    useEffect(() => {
        fetchLabTests();
    }, []);

    const fetchLabTests = async () => {
        setIsLoading(true);
        try {
            const response = await getAllLabTestsAPI();
            if (response.success) {
                setLabTests(response.labTests);
            }
        } catch (error) {
            console.error("Failed to fetch lab tests:", error);
            toast.error(error.message || "Failed to load lab tests");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this test record?')) {
            try {
                const response = await deleteLabTestAPI(id);
                if (response.success) {
                    toast.success("Lab test deleted successfully");
                    fetchLabTests();
                }
            } catch (error) {
                console.error("Failed to delete lab test:", error);
                toast.error(error.message || "Failed to delete lab test");
            }
        }
    };

    const handlePrintReceipt = async (labTestId) => {
        let transactionFetched = false;
        try {
            const res = await getAllPaymentsAPI({ labTestId });
            if (res.success && res.payments && res.payments.length > 0) {
                setSelectedTransaction(res.payments[0]);
                setIsPrintModalOpen(true);
                transactionFetched = true;
            }
        } catch (error) {
            console.warn("API transaction fetch failed, falling back to local data:", error);
        }

        if (!transactionFetched) {
            // Fallback to building a print object from the lab test data directly
            const labTest = labTests.find(t => t.id === labTestId);
            if (labTest) {
                const tempTx = {
                    id: labTest.id,
                    createdAt: labTest.createdAt || new Date(),
                    amount: labTest.test?.price || 0,
                    method: 'CASH',
                    status: 'PENDING',
                    notes: `Lab Test: ${labTest.testName}`,
                    patient: labTest.patient || { name: 'Unknown Patient' },
                    category: { name: 'Lab Test' },
                    labTest: {
                        id: labTest.id,
                        testName: labTest.testName,
                        queueToken: labTest.queueToken
                    }
                };
                setSelectedTransaction(tempTx);
                setIsPrintModalOpen(true);
            } else {
                toast.error("No transaction or lab test details found.");
            }
        }
    };

    const filteredLabTests = labTests.filter(t =>
        t.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            header: "Test Name",
            key: "testName",
            render: (row) => <span className="font-medium text-slate-900">{row.testName}</span>
        },
        {
            header: "Patient",
            key: "patient",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-900">{row.patient?.name || 'Unknown Patient'}</span>
                    <span className="text-xs font-mono text-slate-500">#{row.patientId}</span>
                </div>
            )
        },
        {
            header: "Result",
            key: "result",
            render: (row) => row.result ? (
                <span className="text-sm text-slate-700">{row.result}</span>
            ) : (
                <span className="text-xs text-slate-400 italic">No result yet</span>
            )
        },
        {
            header: "Status",
            key: "status",
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    row.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: "Actions",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePrintReceipt(row.id); }}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                        title="Print Receipt"
                    >
                        <Printer className="w-4 h-4" />
                    </button>
                    {canEdit && (
                        <button
                            onClick={() => {
                                if (userType === 'SYSTEM_ADMIN') {
                                    navigate(`/admin/dashboard/lab-tests/edit/${row.id}`);
                                } else {
                                    navigate(`/staff/lab-tests/edit/${row.id}`);
                                }
                            }}
                            className="p-2 hover:bg-teal-50 rounded-lg text-teal-600 transition-colors"
                            title="Enter Results"
                        >
                            <FileEdit className="w-4 h-4" />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => handleDelete(row.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                            title="Delete Record"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="animate-in fade-in duration-500 pb-10">
            <ListComponent
                title="Lab Tests"
                description="View and manage laboratory test records."
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                onAdd={canCreate ? () => {
                    if (userType === 'SYSTEM_ADMIN') {
                        navigate('/admin/dashboard/lab-tests/create');
                    } else {
                        navigate('/staff/lab-tests/create');
                    }
                } : null}
                addButtonText="Order Lab Test"
            />

            <DataTable
                columns={columns}
                data={filteredLabTests}
                isLoading={isLoading}
                emptyMessage="No lab tests found."
                onRowClick={canEdit ? (row) => {
                    if (userType === 'SYSTEM_ADMIN') {
                        navigate(`/admin/dashboard/lab-tests/edit/${row.id}`);
                    } else {
                        navigate(`/staff/lab-tests/edit/${row.id}`);
                    }
                } : null}
            />

            <ThermalReceiptPrintView 
                isOpen={isPrintModalOpen} 
                onClose={() => { setIsPrintModalOpen(false); setSelectedTransaction(null); }} 
                transaction={selectedTransaction} 
            />
        </div>
    );
};

export default LabTestList;

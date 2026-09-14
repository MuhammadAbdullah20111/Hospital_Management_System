import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListComponent from '../../../components/dashboard/ListComponent';
import DataTable from '../../../components/dashboard/DataTable';
import { getAllPaymentsAPI } from '../../../api/admin/payments';
import { DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentList = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const userType = localStorage.getItem('userType');
    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const canCreate = userType === 'SYSTEM_ADMIN' || permissions.includes('create-payment');

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setIsLoading(true);
        try {
            const response = await getAllPaymentsAPI();
            if (response.success) {
                setPayments(response.payments);
            }
        } catch (error) {
            console.error("Failed to fetch payments:", error);
            toast.error(error.message || "Failed to load payments");
        } finally {
            setIsLoading(false);
        }
    };



    const filteredPayments = payments.filter(p =>
        p.method?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            header: "Amount",
            key: "amount",
            render: (row) => <span className="font-bold text-slate-900">Rs.{row.amount}</span>
        },
        {
            header: "Method",
            key: "method",
            render: (row) => <span className="text-sm text-slate-600 uppercase">{row.method || 'N/A'}</span>
        },
        {
            header: "Patient ID",
            key: "patientId",
            render: (row) => <span className="text-sm font-mono text-slate-500">#{row.patientId}</span>
        },

        {
            header: "Date",
            render: (row) => <span className="text-xs text-slate-500">{new Date(row.createdAt).toLocaleDateString()}</span>
        }
    ];

    return (
        <div className="animate-in fade-in duration-500 pb-10">
            <ListComponent
                title="Payments"
                description="Track patient payments and invoices."
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                onAdd={canCreate ? () => {
                    if (userType === 'SYSTEM_ADMIN') {
                        navigate('/admin/dashboard/payments/create');
                    } else {
                        navigate('/staff/payments/create');
                    }
                } : null}
                addButtonText="Add Payment"
            />

            <DataTable
                columns={columns}
                data={filteredPayments}
                isLoading={isLoading}
                emptyMessage="No payments found."
            />
        </div>
    );
};

export default PaymentList;

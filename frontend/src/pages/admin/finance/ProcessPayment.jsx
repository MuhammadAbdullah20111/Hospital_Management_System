import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, DollarSign, CreditCard, FileText } from 'lucide-react';
import { updateTransactionAPI, getAllTransactionsAPI } from '../../../api/admin/finance';
import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import toast from 'react-hot-toast';
import SearchableSelect from '../../../components/ui/SearchableSelect';

const ProcessPayment = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [transaction, setTransaction] = useState(null);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        method: 'CASH',
        referenceNumber: '',
        notes: ''
    });

    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                const response = await getAllTransactionsAPI({ id });
                // getAllTransactions returns all; find the one we need
                if (response.success) {
                    const found = response.data.find(t => t.id === parseInt(id));
                    if (found) {
                        setTransaction(found);
                        setFormData({
                            method: found.method || 'CASH',
                            referenceNumber: found.referenceNumber || '',
                            notes: found.notes || ''
                        });
                    } else {
                        toast.error('Transaction not found');
                        navigate(-1);
                    }
                }
            } catch {
                toast.error('Failed to load transaction');
                navigate(-1);
            } finally {
                setIsPageLoading(false);
            }
        };
        fetchTransaction();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!transaction) return;

        setIsSubmitting(true);
        try {
            const response = await updateTransactionAPI(transaction.id, {
                status: 'PAID',
                method: formData.method,
                referenceNumber: formData.referenceNumber || undefined,
                notes: formData.notes
            });
            if (response.success) {
                toast.success('Payment processed successfully!');
                navigate(-1);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to process payment');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isPageLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <LoadingPlaceholder className="h-12 w-12" />
            </div>
        );
    }

    if (!transaction) return null;

    const entityName = transaction.patient?.name || transaction.staff?.name || 'External Entity';
    const entitySubtitle = transaction.patient
        ? `MR#: ${transaction.patient.mrNumber}`
        : transaction.staff
        ? `Staff ID: ${transaction.staffId}`
        : 'No association';

    return (
        <div className="max-w-xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Page Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/admin/dashboard/finance')}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Process Payment</h1>
                    <p className="text-slate-500">Settle the outstanding transaction #{id}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Summary Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="bg-emerald-600 px-6 py-4 flex items-center gap-3 text-white">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <h2 className="text-base font-bold">Transaction Summary</h2>
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Transaction ID</p>
                            <p className="font-bold text-slate-800">#{transaction.id}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Amount Due</p>
                            <p className="text-xl font-extrabold text-emerald-600">Rs. {transaction.amount.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Category</p>
                            <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                                {transaction.category?.name}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Entity</p>
                            <p className="text-sm font-bold text-slate-800">{entityName}</p>
                            <p className="text-xs text-slate-400">{entitySubtitle}</p>
                        </div>
                    </div>
                </div>

                {/* Payment Details */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
                    <h2 className="text-base font-bold text-slate-800">Payment Details</h2>

                    {/* Method */}
                    <div>
                        <SearchableSelect
                            label="Payment Method"
                            value={formData.method}
                            onChange={(val) => setFormData({ ...formData, method: val })}
                            options={[
                                { value: 'CASH', label: 'Cash' },
                                { value: 'CARD', label: 'Card' },
                                { value: 'ONLINE', label: 'Online Transfer' },
                                { value: 'BANK_TRANSFER', label: 'Bank Transfer' }
                            ]}
                            placeholder="Select Payment Method"
                            searchable={false}
                            icon={DollarSign}
                        />
                    </div>

                    {/* Reference Number */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Reference Number <span className="text-slate-400 text-xs">(Receipt / TXN ID)</span>
                        </label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Enter receipt or transaction reference..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                value={formData.referenceNumber}
                                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Payment Notes</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <textarea
                                placeholder="e.g. Cleared full patient balance..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                                rows={3}
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-colors disabled:opacity-70"
                    >
                        {isSubmitting ? (
                            <><LoadingPlaceholder className="h-4" colorClass="text-white" /> Settling...</>
                        ) : (
                            <><CheckCircle2 className="w-4 h-4" /> Complete Payment</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProcessPayment;

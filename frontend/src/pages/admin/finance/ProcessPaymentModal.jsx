import React, { useState, useEffect } from 'react';
import { X, DollarSign, CreditCard, User, Layers, FileText, CheckCircle2 } from 'lucide-react';
import { updateTransactionAPI } from '../../../api/admin/finance';
import toast from 'react-hot-toast';
import SearchableSelect from '../../../components/ui/SearchableSelect';

const ProcessPaymentModal = ({ isOpen, onClose, transaction, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    method: 'CASH',
    referenceNumber: '',
    notes: ''
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        method: transaction.method || 'CASH',
        referenceNumber: transaction.referenceNumber || '',
        notes: transaction.notes || ''
      });
    }
  }, [transaction, isOpen]);

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
        toast.success("Payment processed successfully!");
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(error.message || "Failed to process payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !transaction) return null;

  const entityName = transaction.patient?.name || transaction.staff?.name || 'External Entity';
  const entitySubtitle = transaction.patient ? `MR#: ${transaction.patient.mrNumber}` : transaction.staff ? `Staff ID: ${transaction.staffId}` : 'No association';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">Process Settlement</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Transaction ID</p>
            <p className="text-sm font-bold text-slate-700">#{transaction.id}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Amount Due</p>
            <p className="text-lg font-extrabold text-emerald-600">Rs. {transaction.amount.toLocaleString()}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Details Box */}
          <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Category:</span>
              <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-100">{transaction.category?.name}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">For:</span>
              <span className="font-bold text-slate-700">{entityName}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Details:</span>
              <span className="text-slate-500 italic max-w-[200px] truncate">{entitySubtitle}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <SearchableSelect
              label="Payment Method"
              value={formData.method}
              onChange={(val) => setFormData({...formData, method: val})}
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
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
              Reference Number (Receipt # / TXN ID)
            </label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Enter transaction ref..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
              Payment Notes
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
              <textarea 
                placeholder="e.g. Cleared full patient balance"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 transition-all h-20 resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-2 py-3 px-8 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Settling...' : 'Complete Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProcessPaymentModal;

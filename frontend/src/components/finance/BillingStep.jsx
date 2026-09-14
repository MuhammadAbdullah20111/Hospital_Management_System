
import React, { useState, useEffect } from 'react';
import { Banknote, CheckCircle2, Clock } from 'lucide-react';
import LoadingPlaceholder from '../ui/LoadingPlaceholder';
import SearchableSelect from '../ui/SearchableSelect';

/**
 * Reusable Billing Step Component for creating Records (Appointments, Lab Tests, Patients).
 * Props:
 * - baseAmount: number (The starting fee amount)
 * - isAmountEditable: boolean (Whether the base amount can be edited - useful for custom fees)
 * - entityLabel: string (e.g., "Doctor", "Patient", "Order")
 * - entityName: string (e.g., "Dr. Smith", "John Doe")
 * - categories: array (List of transaction categories)
 * - defaultCategorySearch: stri ng (Optional string to auto-select a category by name, e.g., 'consult')
 * - isLoading: boolean (Submit loading state)
 * - onSubmit: function({ categoryId, discount, paymentMethod, paymentStatus, baseAmount })
 * - submitLabel: string (Optional custom text for Pay Now button)
 * - hideCategory: boolean (Hides the income category dropdown if it should be strictly auto-selected)
 */
const BillingStep = ({
    baseAmount = 0,
    isAmountEditable = false,
    entityLabel = "Entity",
    entityName = "Unknown",
    categories = [],
    defaultCategorySearch = '',
    isLoading = false,
    onSubmit,
    submitLabel = "Confirm & Pay",
    hideCategory = false
}) => {
    const [editableBaseAmount, setEditableBaseAmount] = useState(baseAmount);
    const [categoryId, setCategoryId] = useState('');
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('CASH');

    useEffect(() => {
        setEditableBaseAmount(baseAmount);
    }, [baseAmount]);

    // Auto-select category if defaultCategorySearch is provided
    useEffect(() => {
        if (categories.length > 0 && defaultCategorySearch && !categoryId) {
            const foundCat = categories.find(c =>
                c.name.toLowerCase().includes(defaultCategorySearch.toLowerCase())
            );
            if (foundCat) {
                setCategoryId(foundCat.id);
            }
        }
    }, [categories, defaultCategorySearch, categoryId]);

    const netAmount = Math.max(0, editableBaseAmount - (parseFloat(discount) || 0));

    const handleSubmit = (status) => {
        // If they skip (status = PENDING), we don't care about payment method as much, but we send it
        onSubmit({
            categoryId,
            discount: parseFloat(discount) || 0,
            paymentMethod,
            paymentStatus: status,
            baseAmount: editableBaseAmount
        });
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-teal-600" />
                    Billing Summary
                </h2>
                <button
                    type="button"
                    onClick={() => handleSubmit('PENDING')}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                >
                    <Clock className="w-4 h-4" />
                    Skip / Pay Later
                </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-6">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
                    <span className="text-slate-600 font-medium">{entityLabel}</span>
                    <span className="font-bold text-slate-800">{entityName}</span>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-600 font-medium">Base Amount (Rs)</span>
                    {isAmountEditable ? (
                        <input
                            type="number"
                            min="0"
                            value={editableBaseAmount}
                            onChange={(e) => setEditableBaseAmount(parseFloat(e.target.value) || 0)}
                            className="w-32 px-3 py-1 bg-white border border-slate-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-bold"
                        />
                    ) : (
                        <span className="font-bold text-slate-800">Rs {editableBaseAmount.toLocaleString()}</span>
                    )}
                </div>

                <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-600 font-medium">Discount (Rs)</span>
                    <input
                        type="number"
                        min="0"
                        max={editableBaseAmount}
                        value={discount}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') {
                                setDiscount('');
                                return;
                            }
                            const num = parseFloat(val);
                            if (num > editableBaseAmount) {
                                setDiscount(editableBaseAmount);
                            } else {
                                setDiscount(val);
                            }
                        }}
                        className="w-32 px-3 py-1 bg-white border border-slate-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <span className="text-lg font-bold text-slate-800">Net Amount to Pay</span>
                    <span className="text-2xl font-black text-teal-600">Rs {netAmount.toLocaleString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {!hideCategory && (
                    <div>
                        <SearchableSelect
                            label="Income Category"
                            options={categories.map(c => ({ value: c.id, label: c.name }))}
                            value={categoryId}
                            onChange={setCategoryId}
                            searchable={false}
                            placeholder="Select Category (Optional)"
                        />
                    </div>
                )}
                <div className={hideCategory ? "md:col-span-2" : ""}>
                    <SearchableSelect
                        label="Payment Method"
                        options={[
                            { value: 'CASH', label: 'Cash' },
                            { value: 'CARD', label: 'Card' },
                            { value: 'ONLINE', label: 'Online Transfer' }
                        ]}
                        value={paymentMethod}
                        onChange={setPaymentMethod}
                        searchable={false}
                        placeholder="Select Payment Method"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-8">
                <button
                    type="button"
                    onClick={() => handleSubmit('PAID')}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-xl hover:bg-teal-700 transition-colors font-bold disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20"
                >
                    {isLoading ? (
                        <LoadingPlaceholder className="h-5" colorClass="text-white" />
                    ) : (
                        <CheckCircle2 className="w-5 h-5" />
                    )}
                    {submitLabel}
                </button>
            </div>
        </div>
    );
};

export default BillingStep;

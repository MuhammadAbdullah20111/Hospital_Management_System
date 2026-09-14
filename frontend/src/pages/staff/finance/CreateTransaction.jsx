import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Search, ArrowUpCircle, ArrowDownCircle, FileText, CreditCard, Link } from 'lucide-react';
import { createTransactionAPI, getTransactionCategoriesAPI } from '../../../api/admin/finance';
import { getAllPatientsAPI, getPatientByIdAPI } from '../../../api/admin/patients';
import { getAllStaffAPI } from '../../../api/admin/staff';
import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import toast from 'react-hot-toast';

const CreateTransaction = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [allCategories, setAllCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [patientList, setPatientList] = useState([]);
    const [selectedPatientData, setSelectedPatientData] = useState(null);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        amount: '',
        type: location.state?.defaultType || 'INCOME',
        method: 'CASH',
        status: 'PAID',
        categoryId: '',
        patientId: '',
        staffId: '',
        appointmentId: '',
        labTestId: '',
        bedAssignmentId: '',
        notes: ''
    });

    const [staffList, setStaffList] = useState([]);

    const fetchStaffList = async () => {
        try {
            const response = await getAllStaffAPI();
            if (response.success) {
                setStaffList(response.staff || []);
            }
        } catch (error) {
            console.error("Failed to fetch staff list:", error);
        }
    };

    const fetchPatientList = async () => {
        try {
            const response = await getAllPatientsAPI();
            if (response.success) {
                setPatientList(response.patients || []);
            }
        } catch (error) {
            console.error("Failed to fetch patients:", error);
        }
    };

    useEffect(() => {
        if (formData.type === 'EXPENSE' && staffList.length === 0) {
            fetchStaffList();
        }
        if (formData.type === 'INCOME' && patientList.length === 0) {
            fetchPatientList();
        }
    }, [formData.type]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getTransactionCategoriesAPI();
                if (response.success) setAllCategories(response.data);
            } catch {
                toast.error('Failed to load categories');
            }
        };
        fetchCategories();
    }, []);

    // Filter categories by selected type
    const filteredCategories = allCategories.filter(c => c.type === formData.type);

    // Auto-select first matching category when type or categories change
    useEffect(() => {
        if (filteredCategories.length > 0) {
            setFormData(prev => ({ ...prev, categoryId: filteredCategories[0].id.toString() }));
        } else {
            setFormData(prev => ({ ...prev, categoryId: '' }));
        }
    }, [formData.type, allCategories]);

    const fetchPatientDetails = async (patientId) => {
        try {
            const res = await getPatientByIdAPI(patientId);
            if (res.success) {
                setSelectedPatientData(res.patient);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load patient appointments & billing items");
        }
    };

    const handleLinkChange = (linkType, val) => {
        if (!val) {
            setFormData(prev => ({
                ...prev,
                [`${linkType}Id`]: '',
                amount: prev[`${linkType}Id`] ? '' : prev.amount,
                notes: prev[`${linkType}Id`] ? '' : prev.notes
            }));
            return;
        }

        const numVal = parseInt(val);

        if (linkType === 'appointment') {
            const appt = selectedPatientData?.appointments?.find(a => a.id === numVal);
            const apptCat = allCategories.find(c => c.name.toLowerCase().includes('appointment') || c.name.toLowerCase().includes('consultation'));
            setFormData(prev => ({
                ...prev,
                appointmentId: val,
                labTestId: '',
                bedAssignmentId: '',
                categoryId: apptCat ? apptCat.id.toString() : prev.categoryId,
                amount: appt?.doctor?.consultationFee ? appt.doctor.consultationFee.toString() : prev.amount,
                notes: appt ? `Consultation fee for Appointment #${appt.id} with Dr. ${appt.doctor?.name || 'Doctor'}` : prev.notes
            }));
        } else if (linkType === 'labTest') {
            const lt = selectedPatientData?.labTests?.find(l => l.id === numVal);
            const labCat = allCategories.find(c => c.name.toLowerCase().includes('lab'));
            setFormData(prev => ({
                ...prev,
                labTestId: val,
                appointmentId: '',
                bedAssignmentId: '',
                categoryId: labCat ? labCat.id.toString() : prev.categoryId,
                amount: lt?.test?.price ? lt.test.price.toString() : prev.amount,
                notes: lt ? `Lab Test fee for ${lt.testName} (Lab Test #${lt.id})` : prev.notes
            }));
        } else if (linkType === 'bedAssignment') {
            const ba = selectedPatientData?.bedAssignments?.find(b => b.id === numVal);
            const bedCat = allCategories.find(c => c.name.toLowerCase().includes('bed') || c.name.toLowerCase().includes('rent'));
            setFormData(prev => ({
                ...prev,
                bedAssignmentId: val,
                appointmentId: '',
                labTestId: '',
                categoryId: bedCat ? bedCat.id.toString() : prev.categoryId,
                amount: ba ? (ba.totalBill || ba.bed?.room?.category?.pricePerDay || 1000).toString() : prev.amount,
                notes: ba ? `Bed Rent for Bed ${ba.bed?.bedNumber || ba.bedId} (Assignment #${ba.id})` : prev.notes
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.amount) newErrors.amount = "Amount is required";
        if (!formData.categoryId) newErrors.categoryId = "Category is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Please fill all required fields');
            return;
        }
        setErrors({});
        setIsLoading(true);
        try {
            const response = await createTransactionAPI({
                ...formData,
                amount: parseFloat(formData.amount),
                categoryId: parseInt(formData.categoryId),
                patientId: formData.patientId ? parseInt(formData.patientId) : undefined,
                staffId: formData.staffId ? parseInt(formData.staffId) : undefined,
                appointmentId: formData.appointmentId ? parseInt(formData.appointmentId) : undefined,
                labTestId: formData.labTestId ? parseInt(formData.labTestId) : undefined,
                bedAssignmentId: formData.bedAssignmentId ? parseInt(formData.bedAssignmentId) : undefined,
            });
            if (response.success) {
                toast.success('Transaction recorded successfully');
                navigate(-1);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to record transaction');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Page Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Record Transaction</h1>
                    <p className="text-slate-500">Add a new income or expense entry to the ledger</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Transaction Type */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-base font-bold text-slate-800 mb-4">Transaction Type</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'INCOME' })}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold border-2 transition-all ${
                                formData.type === 'INCOME'
                                    ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm'
                                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                            }`}
                        >
                            <ArrowUpCircle className="w-5 h-5" /> Income
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold border-2 transition-all ${
                                formData.type === 'EXPENSE'
                                    ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                            }`}
                        >
                            <ArrowDownCircle className="w-5 h-5" /> Expense
                        </button>
                    </div>
                </div>

                {/* Transaction Details */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
                    <h2 className="text-base font-bold text-slate-800">Transaction Details</h2>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Amount (PKR) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rs.</span>
                            <input
                                type="number"
                                placeholder="0.00"
                                className={`w-full pl-12 pr-4 py-2.5 bg-slate-50 border ${errors.amount ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-lg font-bold`}
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                        {errors.amount && <p className="text-xs text-red-500 font-medium mt-1">{errors.amount}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Category */}
                        <div>
                            <SearchableSelect
                                label="Category"
                                options={filteredCategories.map(cat => ({ value: cat.id, label: cat.name }))}
                                value={formData.categoryId}
                                onChange={(val) => setFormData({ ...formData, categoryId: val })}
                                searchable={false}
                                placeholder="Select category"
                            />
                            {errors.categoryId && <p className="text-xs text-red-500 font-medium mt-1">{errors.categoryId}</p>}
                        </div>

                        {/* Method */}
                        <div>
                            <SearchableSelect
                                label="Payment Method"
                                options={[
                                    { value: 'CASH', label: 'Cash' },
                                    { value: 'CARD', label: 'Card' },
                                    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                                    { value: 'ONLINE', label: 'Online' }
                                ]}
                                value={formData.method}
                                onChange={(val) => setFormData({ ...formData, method: val })}
                                searchable={false}
                                placeholder="Select method"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <SearchableSelect
                                label="Status"
                                options={[
                                    { value: 'PAID', label: 'Paid / Cleared' },
                                    { value: 'PENDING', label: 'Pending / Unpaid' }
                                ]}
                                value={formData.status}
                                onChange={(val) => setFormData({ ...formData, status: val })}
                                searchable={false}
                                placeholder="Select status"
                            />
                        </div>
                    </div>

                    {/* Patient Search (Income only) */}
                    {formData.type === 'INCOME' && (
                        <div>
                            <SearchableSelect
                                label="Patient (Optional)"
                                icon={Search}
                                options={patientList.map(p => ({
                                    value: String(p.id),
                                    label: p.name,
                                    subLabel: p.mrNumber
                                }))}
                                value={formData.patientId}
                                onChange={(val) => {
                                    setFormData({
                                        ...formData,
                                        patientId: val,
                                        appointmentId: '',
                                        labTestId: '',
                                        bedAssignmentId: ''
                                    });
                                    if (val) {
                                        fetchPatientDetails(val);
                                    } else {
                                        setSelectedPatientData(null);
                                    }
                                }}
                                placeholder="Search by name or MR number..."
                            />
                            {selectedPatientData && formData.patientId && (
                                <div className="mt-4 flex flex-col gap-3">
                                    <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl space-y-3">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                            <Link className="w-3.5 h-3.5 text-teal-600" />
                                            <span>Link with Medical Records</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Link to Appointment */}
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-500 mb-1">Associate Appointment</label>
                                                <SearchableSelect
                                                    value={formData.appointmentId}
                                                    onChange={(val) => handleLinkChange('appointment', val)}
                                                    options={selectedPatientData.appointments?.map(appt => ({
                                                        value: String(appt.id),
                                                        label: `Appt #${appt.id} - Dr. ${appt.doctor?.name} (${new Date(appt.date).toLocaleDateString()})`
                                                    })) || []}
                                                    placeholder="None / External"
                                                    searchable={true}
                                                />
                                            </div>

                                            {/* Link to Lab Test */}
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-500 mb-1">Associate Lab Test</label>
                                                <SearchableSelect
                                                    value={formData.labTestId}
                                                    onChange={(val) => handleLinkChange('labTest', val)}
                                                    options={selectedPatientData.labTests?.map(lt => ({
                                                        value: String(lt.id),
                                                        label: `Test #${lt.id} - ${lt.testName} (${lt.status})`
                                                    })) || []}
                                                    placeholder="None / External"
                                                    searchable={true}
                                                />
                                            </div>

                                            {/* Link to Bed Assignment */}
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-500 mb-1">Associate Bed Assignment</label>
                                                <SearchableSelect
                                                    value={formData.bedAssignmentId}
                                                    onChange={(val) => handleLinkChange('bedAssignment', val)}
                                                    options={selectedPatientData.bedAssignments?.map(ba => ({
                                                        value: String(ba.id),
                                                        label: `Assignment #${ba.id} - Bed ${ba.bed?.bedNumber} (${ba.actualDischargeAt ? 'Discharged' : 'Active'})`
                                                    })) || []}
                                                    placeholder="None / External"
                                                    searchable={true}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Staff Search (Expense only) */}
                    {formData.type === 'EXPENSE' && (
                        <div>
                            <SearchableSelect
                                label="Staff Member (Optional)"
                                icon={Search}
                                options={staffList.map(s => ({
                                    value: String(s.id),
                                    label: s.name,
                                    subLabel: s.role?.name || s.role || 'Staff'
                                }))}
                                value={formData.staffId}
                                onChange={(val) => {
                                    if (val) {
                                        const s = staffList.find(staff => String(staff.id) === String(val));
                                        const salaryCat = allCategories.find(c => c.name.toLowerCase().includes('salary') && c.type === 'EXPENSE');
                                        setFormData({
                                            ...formData,
                                            staffId: val,
                                            patientId: '',
                                            appointmentId: '',
                                            labTestId: '',
                                            bedAssignmentId: '',
                                            categoryId: salaryCat ? salaryCat.id.toString() : formData.categoryId,
                                            notes: s ? `Salary disbursement for ${s.name}` : formData.notes
                                        });
                                    } else {
                                        setFormData({
                                            ...formData,
                                            staffId: '',
                                            notes: ''
                                        });
                                    }
                                }}
                                placeholder="Search staff by name or email..."
                            />
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Description</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <textarea
                                placeholder="Enter any additional details..."
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
                        onClick={() => navigate('/staff/finance/transactions')}
                        className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`flex items-center gap-2 px-6 py-2.5 text-white font-medium rounded-xl transition-colors disabled:opacity-70 shadow-sm ${
                            formData.type === 'INCOME'
                                ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
                                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                        }`}
                    >
                        {isLoading ? (
                            <><LoadingPlaceholder className="h-4" colorClass="text-white" /> Recording...</>
                        ) : (
                            <><Save className="w-4 h-4" /> Record Transaction</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTransaction;

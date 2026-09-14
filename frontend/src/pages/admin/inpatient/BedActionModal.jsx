import React, { useState, useEffect } from 'react';
import DatePicker from '../../../components/ui/DatePicker';
import { getAllPatientsAPI } from '../../../api/admin/patients';
import { getAllBedsAPI, assignBedAPI, dischargePatientAPI, transferPatientAPI } from '../../../api/admin/inpatient';
import { getTransactionCategoriesAPI, createTransactionAPI } from '../../../api/admin/finance';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import { User, Bed as BedIcon, Calendar, FileText, Layout, Banknote, ChevronRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';

const BedActionModal = ({ isOpen, onClose, action, bed, assignment, onRefresh }) => {
    const [step, setStep] = useState(1);
    const [patients, setPatients] = useState([]);
    const [availableBeds, setAvailableBeds] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        patientId: '',
        bedId: '',
        newBedId: '',
        dischargeReason: 'RECOVERED',
        expectedDischargeAt: '',
        notes: ''
    });

    // Billing states
    const [categoryId, setCategoryId] = useState('');
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [paymentStatus, setPaymentStatus] = useState('PENDING');

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setFormData({
                patientId: '',
                bedId: bed?.id || '',
                newBedId: '',
                dischargeReason: 'RECOVERED',
                expectedDischargeAt: '',
                notes: ''
            });
            setDiscount(0);

            if (action === 'ASSIGN') {
                fetchPatients();
                fetchCategories();
            }
            if (action === 'TRANSFER') fetchAvailableBeds();
        }
    }, [isOpen, action, bed]);

    const fetchPatients = async () => {
        try {
            const response = await getAllPatientsAPI({ unadmittedOnly: true });
            if (response.success) setPatients(response.patients);
        } catch (error) {
            console.error("Failed to fetch patients:", error);
        }
    };

    const fetchAvailableBeds = async () => {
        try {
            const response = await getAllBedsAPI({ status: 'AVAILABLE' });
            if (response.success) setAvailableBeds(response.beds);
        } catch (error) {
            console.error("Failed to fetch available beds:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await getTransactionCategoriesAPI('INCOME');
            if (response.success) {
                setCategories(response.data || []);
                const bedCat = (response.data || []).find(c => c.name.toLowerCase().includes('bed') || c.name.toLowerCase().includes('room'));
                if (bedCat) setCategoryId(bedCat.id);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const calculateDays = () => {
        if (!formData.expectedDischargeAt) return 0;
        const today = new Date().setHours(0,0,0,0);
        const expected = new Date(formData.expectedDischargeAt).setHours(0,0,0,0);
        const diffTime = Math.abs(expected - today);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 1; // Minimum 1 day
    };

    const getBaseAmount = () => {
        const days = calculateDays();
        const pricePerDay = bed?.room?.category?.pricePerDay || 0;
        return days * pricePerDay;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (action === 'ASSIGN' && step === 1) {
            if (!formData.patientId) return toast.error("Please select a patient");
            if (!formData.expectedDischargeAt) return toast.error("Please select an expected discharge date");
            if (new Date(formData.expectedDischargeAt) < new Date().setHours(0,0,0,0)) {
                return toast.error("Expected discharge date cannot be in the past");
            }
            setStep(2);
            return;
        }

        setIsLoading(true);
        try {
            let response;
            if (action === 'ASSIGN') {
                response = await assignBedAPI({
                    patientId: parseInt(formData.patientId),
                    bedId: bed.id,
                    expectedDischargeAt: formData.expectedDischargeAt,
                    notes: formData.notes
                });

                if (response.success && categoryId) {
                    const newAssignmentId = response.assignment?.id;
                    const baseAmount = getBaseAmount();
                    const discountAmt = parseFloat(discount) || 0;
                    const netAmount = Math.max(0, baseAmount - discountAmt);

                    const txPayload = {
                        type: 'INCOME',
                        categoryId: parseInt(categoryId),
                        patientId: parseInt(formData.patientId),
                        bedAssignmentId: newAssignmentId,
                        baseAmount: baseAmount,
                        discount: discountAmt,
                        amount: netAmount,
                        method: paymentMethod,
                        status: paymentStatus,
                        notes: `Bed Assignment - Bed ${bed.bedNumber} (Expected Days: ${calculateDays()})`
                    };

                    await createTransactionAPI(txPayload);
                }

            } else if (action === 'DISCHARGE') {
                response = await dischargePatientAPI(assignment.id, {
                    dischargeReason: formData.dischargeReason,
                    notes: formData.notes
                });
            } else if (action === 'TRANSFER') {
                if (!formData.newBedId) {
                    toast.error("Please select a target bed");
                    setIsLoading(false);
                    return;
                }
                response = await transferPatientAPI({
                    assignmentId: assignment.id,
                    newBedId: parseInt(formData.newBedId),
                    notes: formData.notes
                });
            }

            if (response.success) {
                toast.success(
                    action === 'ASSIGN' ? 'Patient admitted & billing recorded successfully' : 
                    action === 'DISCHARGE' ? 'Patient discharged successfully' : 
                    'Patient transferred successfully'
                );
                onRefresh();
                onClose();
            } else {
                toast.error(response.message || "Action failed");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const baseAmount = getBaseAmount();
    const netAmount = Math.max(0, baseAmount - (parseFloat(discount) || 0));
    const selectedPatient = patients.find(p => p.id === parseInt(formData.patientId));

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-2xl shadow-xl w-full overflow-visible animate-in zoom-in duration-200 ${action === 'ASSIGN' && step === 2 ? 'max-w-2xl' : 'max-w-md'}`}>
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                    <h2 className="font-bold text-lg text-slate-800">
                        {action === 'ASSIGN' && step === 1 ? `Assign Bed ${bed?.bedNumber}` : 
                         action === 'ASSIGN' && step === 2 ? 'Admission Billing' :
                         action === 'DISCHARGE' ? 'Discharge Patient' : 
                         'Transfer Patient'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full shadow-sm">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* ASSIGN - STEP 1 */}
                    {action === 'ASSIGN' && step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4">
                            <div className="mb-4">
                                <SearchableSelect
                                    label="Select Patient"
                                    icon={User}
                                    options={patients.map(p => ({
                                        value: p.id,
                                        label: p.name,
                                        subLabel: `MR: ${p.mrNumber}`
                                    }))}
                                    value={formData.patientId}
                                    onChange={(val) => setFormData({...formData, patientId: val})}
                                    placeholder="Search by name or MR number..."
                                />
                            </div>
                            <div className="mb-4">
                                <DatePicker
                                    label="Expected Discharge Date"
                                    value={formData.expectedDischargeAt}
                                    onChange={(val) => setFormData({...formData, expectedDischargeAt: val})}
                                    min={new Date().toISOString().split('T')[0]}
                                    icon={Calendar}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-teal-600" />
                                    Clinical Notes
                                </label>
                                <textarea 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-all font-medium text-sm"
                                    rows="3"
                                    placeholder="Add any specific clinical or administrative notes..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                ></textarea>
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                                <button 
                                    type="submit" 
                                    className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
                                >
                                    Continue to Billing
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ASSIGN - STEP 2 (BILLING) */}
                    {action === 'ASSIGN' && step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4">
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6">
                                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-200">
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Patient</span>
                                        <span className="font-bold text-slate-800">{selectedPatient?.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Expected Days</span>
                                        <span className="font-bold text-slate-800">{calculateDays()} Days</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Bed/Room Category</span>
                                        <span className="font-bold text-slate-800">{bed?.room?.category?.name || 'General'}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Rate (Per Day)</span>
                                        <span className="font-bold text-slate-800">Rs {bed?.room?.category?.pricePerDay || 0}</span>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-slate-600 font-medium">Base Amount</span>
                                    <span className="font-bold text-slate-800">Rs {baseAmount.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-slate-600 font-medium">Discount (Rs)</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max={baseAmount}
                                        value={discount}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '') {
                                                setDiscount('');
                                                return;
                                            }
                                            const num = parseFloat(val);
                                            if (num > baseAmount) {
                                                setDiscount(baseAmount);
                                            } else {
                                                setDiscount(val);
                                            }
                                        }}
                                        className="w-32 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                                    />
                                </div>
                                
                                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                                    <span className="text-lg font-bold text-slate-800">Net Advance Amount</span>
                                    <span className="text-2xl font-black text-teal-600">Rs {netAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                                    <SearchableSelect
                                        value={categoryId}
                                        onChange={(val) => setCategoryId(val)}
                                        options={categories.map(c => ({ value: String(c.id), label: c.name }))}
                                        placeholder="Select (Optional)"
                                        searchable={false}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Method</label>
                                    <SearchableSelect
                                        value={paymentMethod}
                                        onChange={(val) => setPaymentMethod(val)}
                                        options={[
                                            { value: 'CASH', label: 'Cash' },
                                            { value: 'CARD', label: 'Card' },
                                            { value: 'ONLINE', label: 'Online Transfer' }
                                        ]}
                                        placeholder="Method"
                                        searchable={false}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                                    <SearchableSelect
                                        value={paymentStatus}
                                        onChange={(val) => setPaymentStatus(val)}
                                        options={[
                                            { value: 'PAID', label: 'Paid' },
                                            { value: 'PENDING', label: 'Pending' }
                                        ]}
                                        placeholder="Status"
                                        searchable={false}
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button type="button" onClick={() => setStep(1)} className="flex-1 px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Back</button>
                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="flex-[2] px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <LoadingPlaceholder className="h-5" colorClass="text-white" /> : <CheckCircle2 className="w-5 h-5" />}
                                    Confirm Admission & Bill
                                </button>
                            </div>
                        </div>
                    )}

                    {/* DISCHARGE / TRANSFER */}
                    {action !== 'ASSIGN' && (
                        <div className="animate-in fade-in slide-in-from-right-4">
                            {action === 'DISCHARGE' && (
                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Discharge Reason</label>
                                    <SearchableSelect
                                        value={formData.dischargeReason}
                                        onChange={(val) => setFormData({...formData, dischargeReason: val})}
                                        options={[
                                            { value: 'RECOVERED', label: 'Recovered' },
                                            { value: 'TRANSFERRED', label: 'Transferred to other Facility' },
                                            { value: 'DECEASED', label: 'Deceased' },
                                            { value: 'AMA', label: 'Against Medical Advice (AMA)' }
                                        ]}
                                        placeholder="Select Discharge Reason"
                                        searchable={false}
                                    />
                                </div>
                            )}

                            {action === 'TRANSFER' && (
                                <div className="mb-4">
                                    <SearchableSelect
                                        label="Target Bed"
                                        icon={BedIcon}
                                        options={availableBeds.map(b => ({
                                            value: b.id,
                                            label: `Bed ${b.bedNumber}`,
                                            subLabel: `${b.ward?.name} - ${b.room?.roomNumber ? `Room ${b.room.roomNumber}` : 'General'}`
                                        }))}
                                        value={formData.newBedId}
                                        onChange={(val) => setFormData({...formData, newBedId: val})}
                                        placeholder="Search available beds..."
                                    />
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-teal-600" />
                                    Clinical Notes
                                </label>
                                <textarea 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-all font-medium text-sm"
                                    rows="3"
                                    placeholder="Add any specific clinical or administrative notes..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                ></textarea>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className={`flex-[2] px-4 py-2.5 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center ${
                                        action === 'DISCHARGE' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
                                    }`}
                                >
                                    {isLoading ? <LoadingPlaceholder className="h-5" colorClass="text-white" /> : action === 'DISCHARGE' ? 'Confirm Discharge' : 'Transfer Patient'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default BedActionModal;

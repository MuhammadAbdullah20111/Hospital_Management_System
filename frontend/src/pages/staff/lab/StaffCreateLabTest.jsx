import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLabTestAPI } from '../../../api/admin/labTests';
import { getAllPatientsAPI } from '../../../api/admin/patients';
import { getAllTestsAPI } from '../../../api/admin/tests';
import { getTransactionCategoriesAPI, createTransactionAPI } from '../../../api/admin/finance';
import toast from 'react-hot-toast';
import { User, Save, ArrowLeft, X, Plus, Banknote, Beaker, ChevronDown, Activity, ChevronRight, CheckCircle2 } from 'lucide-react';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import BillingStep from '../../../components/finance/BillingStep';

const StaffCreateLabTest = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [patients, setPatients] = useState([]);
    const [tests, setTests] = useState([]);
    const [categories, setCategories] = useState([]);

    // Selection states
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [selectedTests, setSelectedTests] = useState([]);
    const [status, setStatus] = useState('PENDING');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientsRes, testsRes, catRes] = await Promise.all([
                    getAllPatientsAPI(),
                    getAllTestsAPI(),
                    getTransactionCategoriesAPI('INCOME')
                ]);

                if (patientsRes.success) setPatients(patientsRes.patients);
                if (testsRes.success) setTests(testsRes.tests.filter(t => t.isActive));
                if (catRes.success) setCategories(catRes.data || []);
            } catch (error) {
                console.error("Failed to load form data:", error);
                toast.error("Failed to load patients or tests list");
            }
        };
        fetchData();
    }, []);

    const handleAddTest = (testId) => {
        if (!testId) return;
        const test = tests.find(t => t.id === Number(testId));
        if (test && !selectedTests.find(st => st.testId === test.id)) {
            setSelectedTests([...selectedTests, {
                testId: test.id,
                testName: test.name,
                amount: test.price.toString()
            }]);
        } else if (test) {
            toast.error("Test already added to this order");
        }
    };

    const handleRemoveTest = (testId) => {
        setSelectedTests(selectedTests.filter(t => t.testId !== testId));
    };

    const handleAmountChange = (testId, newAmount) => {
        setSelectedTests(prev => prev.map(t => 
            t.testId === testId ? { ...t, amount: newAmount } : t
        ));
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (step === 1) {
            if (!selectedPatientId) {
                toast.error("Please select a patient");
                return;
            }
            if (selectedTests.length === 0) {
                toast.error("Please add at least one test to the order");
                return;
            }
            setStep(2);
            return;
        }
    };

    const handleBillingSubmit = async (billingData) => {
        setIsLoading(true);
        try {
            const payload = {
                patientId: parseInt(selectedPatientId),
                status: status,
                tests: selectedTests.map(t => ({
                    testId: t.testId,
                    testName: t.testName,
                    amount: parseFloat(t.amount)
                }))
            };

            const response = await createLabTestAPI(payload);
            
            if (!response.success) {
                throw new Error("Failed to create lab test");
            }

            // Create Transaction if category is selected
            if (billingData.categoryId) {
                const testNames = selectedTests.map(t => t.testName).join(', ');
                const labTestIds = response.labTests?.map(lt => lt.id).join(', ') || '';

                const txPayload = {
                    type: 'INCOME',
                    categoryId: parseInt(billingData.categoryId),
                    patientId: parseInt(selectedPatientId),
                    labTestId: response.labTests && response.labTests.length > 0 ? response.labTests[0].id : null,
                    baseAmount: billingData.baseAmount,
                    discount: billingData.discount,
                    amount: Math.max(0, billingData.baseAmount - billingData.discount),
                    method: billingData.paymentMethod,
                    status: billingData.paymentStatus,
                    notes: `Lab Order containing: ${testNames}. Test IDs: ${labTestIds}`
                };

                await createTransactionAPI(txPayload);
            }

            toast.success("Lab order and billing processed successfully");
            navigate('/staff/lab-tests');
            
        } catch (error) {
            console.error("Failed to order lab tests:", error);
            toast.error(error.message || "Failed to order lab tests");
        } finally {
            setIsLoading(false);
        }
    };

    const patientOptions = patients.map(p => ({
        value: p.id,
        label: p.name,
        subLabel: `ID: #${p.id} | ${p.phoneNumber || 'No Phone'}`
    }));

    const testOptions = tests.map(t => ({
        value: t.id,
        label: t.name,
        subLabel: `Rs.${t.price} | ${t.category || 'General'}`
    }));

    const totalBill = selectedTests.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const selectedPatient = patients.find(p => p.id === parseInt(selectedPatientId));

    return (
        <div className="max-w-4xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => step === 2 ? setStep(1) : navigate('/staff/lab-tests')}
                    className="p-2.5 hover:bg-white hover:shadow-md rounded-xl text-slate-500 transition-all border border-transparent hover:border-slate-100"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        {step === 1 ? 'New Lab Order' : 'Lab Order Billing'}
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">
                        {step === 1 ? 'Create multiple tests for a patient.' : 'Confirm pricing and record payment.'}
                    </p>
                </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-center mb-8">
                <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step >= 1 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
                    <span className={`font-medium ${step >= 1 ? 'text-teal-800' : 'text-slate-500'}`}>Order Details</span>
                    <div className={`w-12 h-1 rounded-full mx-2 ${step >= 2 ? 'bg-teal-600' : 'bg-slate-200'}`}></div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step >= 2 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
                    <span className={`font-medium ${step >= 2 ? 'text-teal-800' : 'text-slate-500'}`}>Billing</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                        {/* Patient Selection Card */}
                        <div className="bg-white rounded-2xl p-8 border border-teal-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-teal-50 rounded-lg">
                                    <User className="w-5 h-5 text-teal-600" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-800">Patient Selection</h2>
                            </div>
                            
                            <SearchableSelect
                                placeholder="Search patient by name, ID, or phone..."
                                options={patientOptions}
                                value={selectedPatientId}
                                onChange={setSelectedPatientId}
                                noOptionsMessage="No patient found"
                            />
                        </div>

                        {/* Tests Selection & Billing Card */}
                        <div className="bg-white rounded-2xl p-8 border border-teal-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-teal-50 rounded-lg">
                                    <Banknote className="w-5 h-5 text-teal-600" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-800">Tests</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-end gap-4">
                                    <div className="flex-1">
                                        <SearchableSelect
                                            placeholder="Add tests to this order..."
                                            options={testOptions}
                                            value={""}
                                            onChange={handleAddTest}
                                        />
                                    </div>
                                </div>

                                {/* Selected Tests Table */}
                                {selectedTests.length > 0 ? (
                                    <div className="border border-slate-100 rounded-2xl overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Test Name</th>
                                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-40 text-right">Cost (Rs)</th>
                                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-20">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {selectedTests.map((test) => (
                                                    <tr key={test.testId} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-slate-700">
                                                            <div className="flex items-center gap-2">
                                                                <Beaker className="w-4 h-4 text-slate-400" />
                                                                {test.testName}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className="font-mono font-bold text-slate-700">
                                                                {test.amount}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveTest(test.testId)}
                                                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
                                            <span className="font-bold text-slate-700">Total Order Amount</span>
                                            <span className="font-bold text-teal-600 text-lg">Rs. {totalBill.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                                        <Plus className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                        <p className="text-slate-400 font-medium">Add tests from the catalog above to process this order.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Status Section */}
                        <div className="bg-white rounded-2xl p-8 border border-teal-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-teal-50 rounded-lg">
                                    <Activity className="w-5 h-5 text-teal-600" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-800">Order Status</h2>
                            </div>

                            <div className="max-w-xs">
                                <SearchableSelect
                                    label="Initial Status"
                                    options={[
                                        { value: 'PENDING', label: 'Pending' },
                                        { value: 'ACCEPTED', label: 'Accepted' },
                                        { value: 'COMPLETED', label: 'Completed' },
                                        { value: 'CANCELLED', label: 'Cancelled' }
                                    ]}
                                    value={status}
                                    onChange={setStatus}
                                    searchable={false}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={selectedTests.length === 0 || !selectedPatientId}
                                className="flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-xl hover:bg-teal-700 transition-colors font-bold disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20"
                            >
                                {isLoading ? <LoadingPlaceholder className="h-5" colorClass="text-white" /> : "Continue to Billing"}
                                {!isLoading && <ChevronRight className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <BillingStep
                        baseAmount={totalBill}
                        entityLabel="Patient"
                        entityName={selectedPatient?.name || 'Unknown'}
                        categories={categories}
                        defaultCategorySearch="Lab Test"
                        hideCategory={true}
                        isLoading={isLoading}
                        onSubmit={handleBillingSubmit}
                        submitLabel="Confirm & Submit Order"
                    />
                )}
            </form>
        </div>
    );
};

export default StaffCreateLabTest;

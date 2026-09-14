import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import DatePicker from '../../../components/ui/DatePicker';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ArrowLeft, 
    Save, 
    TestTube2, 
    User, 
    FileEdit, 
    CheckCircle2, 
    Upload, 
    Calendar, 
    FileText,
    Beaker,
    Activity,
    Clock,
    AlertCircle,
    ChevronDown
} from 'lucide-react';
import { getLabTestByIdAPI, updateLabTestAPI, uploadLabTestReportAPI } from '../../../api/admin/labTests';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import toast from 'react-hot-toast';

const EditLabTest = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [testData, setTestData] = useState(null);
    
    // Form states
    const [testName, setTestName] = useState('');
    const [result, setResult] = useState('');
    const [status, setStatus] = useState('PENDING');
    const [expectedDate, setExpectedDate] = useState('');
    const [file, setFile] = useState(null);

    useEffect(() => {
        const fetchTest = async () => {
            if (!id) return;
            try {
                const response = await getLabTestByIdAPI(id);
                if (response.success && response.labTest) {
                    const t = response.labTest;
                    setTestData(t);
                    setTestName(t.testName || '');
                    setResult(t.result || '');
                    setStatus(t.status || 'PENDING');
                    
                    if (t.expectedDate) {
                        const dateObj = new Date(t.expectedDate);
                        if (!isNaN(dateObj.getTime())) {
                            setExpectedDate(dateObj.toISOString().split('T')[0]);
                        }
                    }
                } else {
                    toast.error(response.message || "Lab test not found");
                    navigate('/admin/dashboard/lab-tests');
                }
            } catch (error) {
                console.error("Failed to fetch lab test:", error);
                toast.error("Failed to load test data");
                navigate('/admin/dashboard/lab-tests');
            } finally {
                setIsFetching(false);
            }
        };
        fetchTest();
    }, [id, navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Update metadata
            const payload = {
                testName,
                result,
                status,
                expectedDate: expectedDate ? new Date(expectedDate).toISOString() : null
            };
            
            const response = await updateLabTestAPI(id, payload);
            
            // Upload file if selected
            if (file && response.success) {
                const formData = new FormData();
                formData.append('report', file);
                await uploadLabTestReportAPI(id, formData);
            }

            toast.success("Lab test record updated successfully");
            navigate('/admin/dashboard/lab-tests');
        } catch (error) {
            console.error("Failed to update lab test:", error);
            toast.error(error.message || "Failed to save changes");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <LoadingPlaceholder className="h-16 w-16" />
                <p className="text-slate-400 font-medium animate-pulse">Loading test data...</p>
            </div>
        );
    }

    if (!testData) return null;

    return (
        <div className="max-w-4xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/admin/dashboard/lab-tests')}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Edit Lab Record</h1>
                    <p className="text-slate-500">Update findings, status, and reports for this test request.</p>
                </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
                {/* Information Snapshot */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-teal-600" />
                        Patient & Test Context
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Patient Name</p>
                            <p className="font-bold text-slate-800 text-lg leading-tight">{testData?.patient?.name}</p>
                            <p className="text-sm text-slate-500 mt-1">{testData?.patient?.age}y / {testData?.patient?.gender}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">MR Number</p>
                            <p className="font-mono text-sm text-teal-700 font-bold bg-teal-50 px-2 py-1 rounded inline-block">#{testData?.patient?.mrNumber}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Test Details</p>
                            <p className="font-bold text-slate-800">{testData?.testName}</p>
                            <p className="text-xs text-slate-500 mt-1">Requested: {testData?.createdAt ? new Date(testData.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Edit Form Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <FileEdit className="w-5 h-5 text-teal-600" />
                        Results & Findings
                    </h2>

                    <div className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Test Name (Editable in Admin) */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Beaker className="w-4 h-4 text-teal-600" />
                                    Test Label
                                </label>
                                <input
                                    type="text"
                                    value={testName}
                                    onChange={(e) => setTestName(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                                />
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <SearchableSelect
                                    label="Process Status"
                                    options={[
                                        { value: 'PENDING', label: 'Pending (Initial Request)' },
                                        { value: 'ACCEPTED', label: 'Accepted (In Progress)' },
                                        { value: 'COMPLETED', label: 'Completed (Result Ready)' },
                                        { value: 'CANCELLED', label: 'Cancelled' }
                                    ]}
                                    value={status}
                                    onChange={setStatus}
                                    searchable={false}
                                    icon={Activity}
                                />
                            </div>

                            {/* Expected Date */}
                            <div className="space-y-2">
                                <DatePicker
                                    label="Expected Date"
                                    value={expectedDate}
                                    onChange={(val) => setExpectedDate(val)}
                                    icon={Clock}
                                />
                            </div>
                        </div>

                        {/* Result Content */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-teal-600" />
                                Findings / Observations
                            </label>
                            <textarea
                                value={result}
                                onChange={(e) => setResult(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all min-h-[140px] font-medium text-slate-700 leading-relaxed"
                                placeholder="Enter detailed diagnostic results, reference ranges, or clinical observations..."
                            />
                        </div>

                        {/* File Upload Section */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 transition-all hover:bg-teal-50/30 hover:border-teal-200">
                            <div className="flex flex-col items-center text-center">
                                <div className="p-2.5 bg-white rounded-full shadow-sm mb-3">
                                    <Upload className="w-5 h-5 text-teal-600" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-800 mb-1">Official Report Document</h3>
                                <p className="text-[11px] text-slate-500 mb-4 max-w-xs">Upload scanned PDF or Image reports (Max 10MB).</p>
                                
                                <input
                                    type="file"
                                    id="report-upload"
                                    className="hidden"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => setFile(e.target.files[0])}
                                />
                                <label
                                    htmlFor="report-upload"
                                    className="cursor-pointer bg-white border border-slate-200 text-slate-700 px-5 py-2 rounded-lg text-xs font-bold hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all shadow-sm"
                                >
                                    {file ? file.name : (testData?.reportFile ? "Update Report File" : "Select Report File")}
                                </label>
                                
                                {testData?.reportFile && !file && (
                                    <div className="mt-3 flex items-center gap-2 text-teal-700 font-bold text-[10px] uppercase tracking-wider">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Existing Report Attached
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Note */}
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                <strong>Note:</strong> Updating the test result and uploading a report will make this information available to doctors in the clinical module.
                            </p>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/dashboard/lab-tests')}
                                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all h-11 min-w-[120px]"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-teal-600/20 active:scale-[0.98] h-11 min-w-[200px] justify-center"
                            >
                                {isLoading ? (
                                    <LoadingPlaceholder className="h-5 w-5" colorClass="text-white" />
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save All Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditLabTest;

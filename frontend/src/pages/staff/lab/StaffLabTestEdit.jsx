import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import DatePicker from '../../../components/ui/DatePicker';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, TestTube2, User, FileEdit, CheckCircle2, Upload, Calendar, FileText } from 'lucide-react';
import { getLabTestByIdAPI, updateLabTestAPI, uploadLabTestReportAPI } from '../../../api/admin/labTests';
import toast from 'react-hot-toast';

const StaffLabTestEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [testData, setTestData] = useState(null);
    const [result, setResult] = useState('');
    const [status, setStatus] = useState('PENDING');
    const [expectedDate, setExpectedDate] = useState('');
    const [file, setFile] = useState(null);

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const response = await getLabTestByIdAPI(id);
                if (response.success) {
                    const t = response.labTest;
                    setTestData(t);
                    setResult(t.result || '');
                    setStatus(t.status || 'PENDING');
                    if (t.expectedDate) setExpectedDate(new Date(t.expectedDate).toISOString().split('T')[0]);
                }
            } catch (error) {
                console.error("Failed to fetch lab test:", error);
                toast.error("Failed to load test data");
                navigate('/staff/lab-tests');
            } finally {
                setIsFetching(false);
            }
        };
        fetchTest();
    }, [id, navigate]);

    const handleAcceptRequest = async () => {
        if (!expectedDate) {
            toast.error("Please enter an expected completion date.");
            return;
        }
        setIsLoading(true);
        try {
            const payload = {
                status: 'ACCEPTED',
                expectedDate: new Date(expectedDate).toISOString()
            };
            const response = await updateLabTestAPI(id, payload);
            if (response.success) {
                toast.success("Lab test requested accepted");
                setTestData(response.labTest);
                setStatus('ACCEPTED');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to accept request");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitResult = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Update text result and status first
            const payload = {
                result,
                status: 'COMPLETED',
                conductedById: parseInt(localStorage.getItem('staffId')) || null
            };
            await updateLabTestAPI(id, payload);

            // Upload file if selected
            if (file) {
                const formData = new FormData();
                formData.append('report', file);
                await uploadLabTestReportAPI(id, formData);
            }

            toast.success("Test results saved successfully");
            navigate('/staff/lab-tests');
        } catch (error) {
            console.error("Failed to upload result:", error);
            toast.error(error.message || "Failed to submit result");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingPlaceholder className="h-12 w-12" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/staff/lab-tests')}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Record Test Result</h1>
                    <p className="text-slate-500">Enter findings for {testData?.testName}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Patient & Test Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h2 className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Patient Details
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-slate-500">Name</p>
                                <p className="font-bold text-slate-900">{testData?.patient?.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">MR Number</p>
                                <p className="font-mono text-sm bg-slate-50 p-1 rounded inline-block">{testData?.patient?.mrNumber}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Age / Gender</p>
                                <p className="text-sm text-slate-700">{testData?.patient?.age} yrs / {testData?.patient?.gender}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h2 className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <TestTube2 className="w-4 h-4" />
                            Test Information
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-slate-500">Test Required</p>
                                <p className="font-bold text-slate-900">{testData?.testName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Ordered On</p>
                                <p className="text-sm text-slate-700">{new Date(testData?.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Current Status</p>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${
                                    testData?.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {testData?.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Dynamic Form Based on Status */}
                <div className="lg:col-span-2">
                    {testData?.status === 'PENDING' ? (
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-in fade-in">
                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-teal-600" />
                                Accept Request
                            </h2>
                            <p className="text-sm text-slate-500 mb-6">
                                Review the request and set an expected date for when the report will be ready for the patient to collect.
                            </p>
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <DatePicker
                                        label={<span>Expected Completion Date <span className="text-red-500">*</span></span>}
                                        value={expectedDate}
                                        onChange={(val) => setExpectedDate(val)}
                                        min={new Date().toISOString().split('T')[0]}
                                        icon={Calendar}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={handleAcceptRequest}
                                    disabled={isLoading || !expectedDate}
                                    className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-xl hover:bg-teal-700 transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20"
                                >
                                    {isLoading ? (
                                        <LoadingPlaceholder className="h-4" colorClass="text-white" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4" />
                                    )}
                                    Accept Request
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmitResult} className="space-y-6 animate-in fade-in">
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <FileEdit className="w-5 h-5 text-teal-600" />
                                    Result Entry Details
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Findings / Result Summary
                                        </label>
                                        <textarea
                                            value={result}
                                            onChange={(e) => setResult(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all min-h-[150px]"
                                            placeholder="Enter test observations, numerical values, or diagnostic findings..."
                                            required
                                        />
                                    </div>
                                    
                                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-slate-500" />
                                            Upload Official Report (PDF/Image)
                                        </label>
                                        <p className="text-xs text-slate-500 mb-3">
                                            Upload the scanned or generated lab report. This will be visible to doctors in the patient profile.
                                        </p>
                                        <input
                                            type="file"
                                            onChange={(e) => setFile(e.target.files[0])}
                                            accept="image/*,application/pdf"
                                            className="block w-full text-sm text-slate-500
                                            file:mr-4 file:py-2.5 file:px-4
                                            file:rounded-xl file:border-0
                                            file:text-sm file:font-bold
                                            file:bg-teal-50 file:text-teal-700
                                            hover:file:bg-teal-100 transition-colors"
                                        />
                                        {testData?.reportFile && !file && (
                                            <p className="mt-2 text-sm text-teal-600 font-medium">A report is already attached.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate('/staff/lab-tests')}
                                    className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center gap-2 bg-teal-600 text-white px-8 py-2.5 rounded-xl hover:bg-teal-700 transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20"
                                >
                                    {isLoading ? (
                                        <>
                                            <LoadingPlaceholder className="h-4" colorClass="text-white" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            Upload & Mark Completed
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffLabTestEdit;

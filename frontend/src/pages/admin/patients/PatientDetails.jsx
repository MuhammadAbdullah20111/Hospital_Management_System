import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Calendar, MapPin, Phone, Mail, Activity, Edit, FileText, Download, CheckCircle2, CreditCard } from 'lucide-react';
import { getPatientByIdAPI } from '../../../api/admin/patients';
import toast from 'react-hot-toast';

const PatientDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const userType = localStorage.getItem('userType');
    const isAdmin = window.location.pathname.startsWith('/admin');
    const backPath = isAdmin ? '/admin/dashboard/patients' : '/staff/patients';

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const response = await getPatientByIdAPI(id);
                if (response.success) {
                    setPatient(response.patient);
                }
            } catch (error) {
                console.error("Failed to load patient:", error);
                toast.error("Failed to load patient details");
                navigate(backPath);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPatient();
    }, [id, navigate, backPath]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingPlaceholder className="h-12 w-12" />
            </div>
        );
    }

    if (!patient) return null;

    return (
        <div className="max-w-4xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(backPath)}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Patient Profile</h1>
                    <p className="text-slate-500">View detailed patient information</p>
                </div>
            </div>

            <div className="flex justify-end mb-4">
                <button
                    onClick={() => {
                        if (userType === 'SYSTEM_ADMIN') {
                            navigate(`/admin/dashboard/patients/edit/${id}`);
                        } else {
                            navigate(`/staff/patients/edit/${id}`);
                        }
                    }}
                    className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700 transition-colors font-medium shadow-sm"
                >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center text-3xl font-bold text-teal-700 mb-4">
                            {patient.name[0]}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{patient.name}</h2>
                        <span className="text-sm font-mono font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full mt-2 mb-4">
                            {patient.mrNumber}
                        </span>
                        <span className="text-sm text-slate-500 mb-6 font-medium">Patient DB ID: #{patient.id}</span>

                        <div className="w-full space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Email Address</label>
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        {patient.email || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Phone Number</label>
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        {patient.phoneNumber || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">CNIC (Identity Card)</label>
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <Activity className="w-4 h-4 text-slate-400" />
                                        {patient.cnic || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Address</label>
                                <div className="flex items-start gap-2 text-slate-700">
                                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                                    {patient.address || 'N/A'}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Joined Date</label>
                                <div className="flex items-start gap-2 text-slate-700">
                                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                                    {new Date(patient.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                    {/* Lab History & Reports Section */}
                    {patient.labTests && patient.labTests.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-teal-600" />
                                Lab Tests & Reports
                            </h3>
                            <div className="space-y-4">
                                {patient.labTests.map((test) => (
                                    <div key={test.id} className="border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-teal-100 transition-colors bg-slate-50">
                                        <div>
                                            <h4 className="font-bold text-slate-800">{test.testName}</h4>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(test.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                                    test.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                    test.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {test.status}
                                                </span>
                                            </div>
                                            {test.status === 'COMPLETED' && test.result && (
                                                <p className="text-sm text-slate-600 mt-2 line-clamp-2 italic">"{test.result}"</p>
                                            )}
                                        </div>
                                        
                                        <div>
                                            {test.reportFile ? (
                                                <a 
                                                    href={`${import.meta.env.VITE_BASE_URL?.replace('/api', '')}${test.reportFile}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-sm font-medium text-teal-600 bg-teal-50 px-4 py-2 rounded-lg hover:bg-teal-100 transition-colors"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    View Report
                                                </a>
                                            ) : (
                                                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                                    {test.status === 'COMPLETED' ? <CheckCircle2 className="w-3 h-3" /> : 'Pending'}
                                                    {test.status === 'COMPLETED' ? 'No File Attached' : 'Awaiting Report'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Billing & Transactions Section */}
                    {patient.transactions && patient.transactions.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-teal-600" />
                                Billing & Transaction History
                            </h3>
                            <div className="space-y-4">
                                {patient.transactions.map((tx) => (
                                    <div key={tx.id} className="border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-teal-100 transition-colors bg-slate-50">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-800">
                                                    {tx.notes || `${tx.category?.name || 'Medical'} Fee`}
                                                </h4>
                                                <span className="text-xs font-mono text-slate-400 font-bold">#{tx.id}</span>
                                            </div>
                                            
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(tx.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="font-medium text-slate-600">Method: {tx.method}</span>
                                                {tx.appointmentId && (
                                                    <span className="px-1.5 py-0.5 bg-sky-50 text-sky-700 border border-sky-100 rounded text-[10px] font-bold">
                                                        Appt #{tx.appointmentId}
                                                    </span>
                                                )}
                                                {tx.labTestId && (
                                                    <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded text-[10px] font-bold">
                                                        Lab Test #{tx.labTestId}
                                                    </span>
                                                )}
                                                {tx.bedAssignmentId && (
                                                    <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[10px] font-bold">
                                                        Bed Assignment #{tx.bedAssignmentId}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="text-right">
                                            <p className="font-extrabold text-slate-900 text-base">Rs. {tx.amount.toLocaleString()}</p>
                                            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                                tx.status === 'PAID'
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                                {tx.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientDetails;

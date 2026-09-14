import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStaffByIdAPI } from '../../../api/admin/staff';
import {
    Mail, Phone, ShieldCheck, Clock, Building2,
    ArrowLeft, Calendar, FileText, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

const StaffDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [staff, setStaff] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStaffDetails();
    }, [id]);

    const fetchStaffDetails = async () => {
        try {
            const response = await getStaffByIdAPI(id);
            if (response.success) {
                setStaff(response.staff);
            }
        } catch (error) {
            console.error("Failed to fetch staff details:", error);
            toast.error("Failed to load staff details");
            navigate('/admin/dashboard/staff');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingPlaceholder className="h-12 w-12" />
            </div>
        );
    }

    if (!staff) return null;

    const isDoctor = staff.roleName?.toUpperCase() === 'DOCTOR';
    const isLabTech = staff.roleName?.toUpperCase() === 'LAB TECHNICIAN'; // Adjust based on actual role name in DB

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Minimal Header with Back Button */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => navigate('/admin/dashboard/staff')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors px-3 py-2 rounded-lg hover:bg-white"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back to Staff List</span>
                </button>
            </div>

            {/* Main Profile Card - Less "Boxy", more "ID Card" feel */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 pointer-events-none"></div>

                <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8">
                    {/* Avatar / Initial with cleaner look */}
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-teal-200">
                        {staff.name[0]}
                    </div>

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{staff.name}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${staff.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                }`}>
                                {staff.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-teal-500" />
                                {staff.roleName || 'N/A'}
                            </div>
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-blue-400" />
                                {staff.departmentName || 'General Dept.'}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-500" />
                                {staff.shiftName || 'Flexible Shift'}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions or Contact - merged into header for flow */}
                    <div className="flex flex-col gap-3 min-w-[200px] border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8 mt-4 md:mt-0">
                        <div className="flex items-center gap-3 text-slate-600">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                <Mail className="w-4 h-4" />
                            </div>
                            <span className="text-sm">{staff.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                <Phone className="w-4 h-4" />
                            </div>
                            <span className="text-sm">{staff.phoneNumber || 'No phone'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Activity Feed (Dynamic) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Doctor's Appointments */}
                    {isDoctor && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-indigo-500" />
                                    Upcoming & Recent Appointments
                                </h3>
                            </div>

                            {staff.appointments && staff.appointments.length > 0 ? (
                                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                                    {staff.appointments.map((apt, idx) => (
                                        <div key={apt.id} className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${idx !== staff.appointments.length - 1 ? 'border-b border-slate-50' : ''}`}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-2 h-10 rounded-full bg-indigo-500"></div>
                                                <div>
                                                    <p className="font-semibold text-slate-800 text-sm">{apt.patient.name}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        {new Date(apt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {apt.time}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${apt.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                                                apt.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-slate-100 text-slate-500'
                                                }`}>
                                                {apt.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-xl p-8 text-center border border-dashed border-slate-200">
                                    <p className="text-slate-400 text-sm">No appointment history available.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Lab Tech's Tests */}
                    {isLabTech && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-rose-500" />
                                Laboratory Activity
                            </h3>

                            {staff.labTests && staff.labTests.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {staff.labTests.map((test) => (
                                        <div key={test.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
                                                    <Activity className="w-4 h-4" />
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-500`}>
                                                    {test.status}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-slate-700 text-sm">{test.testName}</h4>
                                            <p className="text-xs text-slate-400 mt-1">Patient: {test.patient.name}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-xl p-8 text-center border border-dashed border-slate-200">
                                    <p className="text-slate-400 text-sm">No lab records found.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {!isDoctor && !isLabTech && (
                        <div className="bg-white rounded-xl p-8 text-center border border-slate-100 shadow-sm">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-slate-900 font-medium">Standard Staff Account</h3>
                            <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
                                This staff member has standard access privileges. No specific activity logs are configured for display for this role type yet.
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column: Additional Details */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                            Contact Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-semibold">Email Address</p>
                                <p className="text-sm text-slate-700 font-medium">{staff.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-semibold">Phone Number</p>
                                <p className="text-sm text-slate-700 font-medium">{staff.phoneNumber || 'Not Provided'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                            System Info
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Staff ID</span>
                                <span className="font-mono text-slate-700 bg-slate-50 px-2 py-0.5 rounded text-xs">#{staff.id}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Member Since</span>
                                <span className="text-slate-700">{new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StaffDetails;

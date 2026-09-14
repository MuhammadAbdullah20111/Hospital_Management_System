import LoadingPlaceholder from '../../components/ui/LoadingPlaceholder';
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { getStaffHomeAPI } from '../../api/staff/home';
import { getFromLocalStorage } from "../../helpers/localStorageFile";
import {
    Users,
    Calendar,
    Stethoscope,
    Activity,
    Clock,
    CheckCircle2,
    Zap,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    UserCheck,
    Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const userName = getFromLocalStorage("name") || "Doctor";
    const userRole = getFromLocalStorage("role") || "DOCTOR";

    const fetchDashboardData = async () => {
        try {
            const response = await getStaffHomeAPI();
            if (response.success) {
                setStats(response.stats);
            }
        } catch (error) {
            console.error("Failed to fetch doctor dashboard data:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const colors = {
        primary: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100/80', hover: 'hover:border-teal-400' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-500', border: 'border-blue-100/80', hover: 'hover:border-blue-400' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-500', border: 'border-emerald-100/80', hover: 'hover:border-emerald-400' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-500', border: 'border-purple-100/80', hover: 'hover:border-purple-400' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-500', border: 'border-rose-100/80', hover: 'hover:border-rose-400' }
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <LoadingPlaceholder className="h-24 w-24" />
            </div>
        );
    }

    const StatCard = ({ title, value, icon: Icon, colorTheme }) => (
        <div className={`bg-white p-6 rounded-2xl shadow-sm border ${colorTheme.border} transition-all hover:shadow-md hover:scale-[1.02] duration-300`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorTheme.bg}`}>
                    <Icon className={`w-6 h-6 ${colorTheme.text}`} />
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Today</span>
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium">{title}</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">{value}</h3>
            </div>
        </div>
    );

    const QuickActionCard = ({ title, description, icon: Icon, link, colorTheme }) => (
        <button
            onClick={() => navigate(link)}
            className={`flex flex-col items-start p-6 bg-white rounded-2xl border ${colorTheme.border} shadow-sm transition-all hover:shadow-md ${colorTheme.hover} hover:-translate-y-1 group text-left w-full h-full duration-300`}
        >
            <div className={`p-4 rounded-xl ${colorTheme.bg} mb-4 transition-transform group-hover:scale-110 duration-300`}>
                <Icon className={`w-6 h-6 ${colorTheme.text}`} />
            </div>
            <h4 className="font-bold text-slate-900 mb-2 group-hover:text-teal-600 transition-colors uppercase text-xs tracking-widest">{title}</h4>
            <p className="text-sm text-slate-500 line-clamp-2">{description}</p>
        </button>
    );

    const doctorActions = [
        {
            title: "My Appointments",
            description: "View and start consultations for your patients",
            icon: Calendar,
            link: "/staff/appointments",
            colorTheme: colors.primary
        },
        {
            title: "Patient Directory",
            description: "Browse medical history and profiles",
            icon: Users,
            link: "/staff/patients",
            colorTheme: colors.blue
        },
        {
            title: "My Profile",
            description: "Manage your professional details and schedule",
            icon: UserCheck,
            link: "/staff/profile",
            colorTheme: colors.purple
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-[15px] font-bold text-teal-600 uppercase tracking-[0.2em] mb-1">
                        {userRole?.replace(/_/g, ' ')}
                    </p>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome back, Dr. {userName}!</h1>
                    <p className="text-slate-500">Here's your clinical schedule and summary. Click on any appointment below to launch the patient consultation.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white rounded-lg border border-teal-100 shadow-sm text-sm font-medium text-slate-600">
                        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Appointments Today"
                    value={stats?.appointmentsToday || 0}
                    icon={Calendar}
                    colorTheme={colors.primary}
                />
                <StatCard
                    title="Pending Consultations"
                    value={stats?.pendingTasks || 0}
                    icon={Clock}
                    colorTheme={colors.blue}
                />
                <StatCard
                    title="Completed Consultations"
                    value={stats?.completedTasks || 0}
                    icon={CheckCircle2}
                    colorTheme={colors.emerald}
                />
                <StatCard
                    title="Total Patients Seen"
                    value={stats?.activePatients || 0}
                    icon={Users}
                    colorTheme={colors.purple}
                />
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-teal-600 rounded-lg shadow-sm">
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {doctorActions.map((action, index) => (
                        <QuickActionCard
                            key={index}
                            {...action}
                        />
                    ))}
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Consultations list */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-50 transition-all hover:shadow-md">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-teal-600" />
                            Upcoming Consultations
                        </h2>
                        <button 
                            onClick={() => navigate('/staff/appointments')}
                            className="text-teal-600 hover:text-teal-700 text-xs font-bold transition-colors"
                        >
                            View All
                        </button>
                    </div>
                    <div className="space-y-4">
                        {stats?.upcomingAppointments?.length > 0 ? (
                            stats.upcomingAppointments.map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => navigate(`/staff/appointments/consult/${item.id}`)}
                                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 hover:bg-teal-50/30 transition-all border border-slate-100 hover:border-teal-100 cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-teal-100/60 flex items-center justify-center font-black text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                                            {item.patientName?.[0] || 'P'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">{item.patientName}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{item.time} • {item.reason}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                            item.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                                        }`}>
                                            {item.status}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
                                <Activity className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-400 text-sm">No upcoming appointments scheduled</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent updates list */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-50 transition-all hover:shadow-md">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-teal-600" />
                        Recent Patient Activity
                    </h2>
                    <div className="space-y-4">
                        {stats?.recentUpdates?.length > 0 ? (
                            stats.recentUpdates.map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => navigate(`/staff/appointments/consult/${item.id}`)}
                                    className="flex items-center gap-3 p-4 rounded-xl bg-slate-50/50 hover:bg-teal-50/30 border border-slate-100 hover:border-teal-100 transition-all cursor-pointer group"
                                >
                                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${i % 2 === 0 ? 'bg-teal-500 shadow-sm shadow-teal-500/20' : 'bg-blue-500 shadow-sm shadow-blue-500/20'}`}></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                                            <span className="font-extrabold">{item.patientName}</span> {item.action}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
                                <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-400 text-sm">No recent activity updates</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;

import LoadingPlaceholder from '../../components/ui/LoadingPlaceholder';
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { getStaffHomeAPI } from '../../api/staff/home';
import { getInpatientSummaryAPI, getBedOccupancyAPI, updateBedStatusAPI } from '../../api/admin/inpatient';
import { getFromLocalStorage } from "../../helpers/localStorageFile";
import {
    Users,
    Calendar,
    Stethoscope,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    UserPlus,
    PlusCircle,
    CreditCard,
    Zap,
    TestTube2,
    ClipboardList,
    FileSearch,
    Beaker,
    Hospital,
    LogOut,
    Printer
} from 'lucide-react';
import toast from 'react-hot-toast';
import BedActionModal from '../admin/inpatient/BedActionModal';
import CreateTransactionModal from '../admin/finance/CreateTransactionModal';
import ProcessPaymentModal from '../admin/finance/ProcessPaymentModal';
import ReceiptPrintView from '../admin/finance/ReceiptPrintView';

const StaffDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [inpatientSummary, setInpatientSummary] = useState(null);
    const [occupancyData, setOccupancyData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Quick New Transaction Modal
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);

    // Process Outstanding Payments States
    const [selectedTxForPayment, setSelectedTxForPayment] = useState(null);
    const [isProcessPayModalOpen, setIsProcessPayModalOpen] = useState(false);

    // Print Receipt States
    const [selectedTxForPrint, setSelectedTxForPrint] = useState(null);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

    const [modalState, setModalState] = useState({
        isOpen: false,
        action: '',
        bed: null,
        assignment: null
    });

    const userName = getFromLocalStorage("name") || "Staff Member";
    const userRole = getFromLocalStorage("role")?.toUpperCase();
    const isAdmin = userRole === "ADMIN";
    const isReceptionist = userRole === "RECEPTIONIST";
    const isLabTechnician = userRole === "LAB_TECHNICIAN" || userRole === "LAB TECHNICIAN" || userRole?.includes("Lab");
    
    // Permission checks
    const permissions = JSON.parse(getFromLocalStorage('permissions') || '[]');
    const canViewInpatient = isAdmin || permissions.includes('view-inpatient');
    const canAssign = isAdmin || isReceptionist || permissions.includes('assign-bed');
    const canTransfer = isAdmin || isReceptionist || permissions.includes('transfer-patient');
    const canDischarge = isAdmin || isReceptionist || permissions.includes('discharge-patient');

    const openModal = (action, bed = null, assignment = null) => {
        if (action === 'ASSIGN' && !canAssign) return;
        if (action === 'TRANSFER' && !canTransfer) return;
        if (action === 'DISCHARGE' && !canDischarge) return;
        setModalState({ isOpen: true, action, bed, assignment });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, action: '', bed: null, assignment: null });
    };

    const handleQuickStatusUpdate = async (id, status) => {
        try {
            const response = await updateBedStatusAPI(id, status);
            if (response.success) {
                toast.success(`Bed status updated to ${status}`);
                fetchDashboardData();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const fetchDashboardData = async () => {
        try {
            const [homeRes, summaryRes, occupancyRes] = await Promise.all([
                getStaffHomeAPI(),
                canViewInpatient ? getInpatientSummaryAPI() : Promise.resolve({ success: false }),
                canViewInpatient ? getBedOccupancyAPI() : Promise.resolve({ success: false })
            ]);

            if (homeRes.success) setStats(homeRes.stats);
            if (summaryRes.success) setInpatientSummary(summaryRes.summary);
            if (occupancyRes.success) setOccupancyData(occupancyRes.wards);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        // Auto-refresh disabled
        // const interval = setInterval(fetchDashboardData, 30000);
        // return () => clearInterval(interval);
    }, []);

    const colors = {
        primary: { bg: 'bg-teal-50', text: 'text-teal-600' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-500' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-500' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-500' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-600' },
        pink: { bg: 'bg-pink-50', text: 'text-pink-600' },
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <LoadingPlaceholder className="h-24 w-24" />
            </div>
        );
    }

    const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorTheme }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-100 transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorTheme.bg}`}>
                    <Icon className={`w-6 h-6 ${colorTheme.text}`} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {trendValue}
                    </div>
                )}
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
            </div>
        </div>
    );

    const QuickActionCard = ({ title, description, icon: Icon, link, onClick, colorTheme }) => (
        <button
            onClick={onClick || (() => navigate(link))}
            className="flex flex-col items-start p-5 bg-white rounded-2xl border border-teal-100 shadow-sm transition-all hover:shadow-md hover:border-teal-300 group text-left w-full h-full"
        >
            <div className={`p-3 rounded-xl ${colorTheme.bg} mb-4 transition-transform group-hover:scale-110`}>
                <Icon className={`w-6 h-6 ${colorTheme.text}`} />
            </div>
            <h4 className="font-bold text-slate-900 mb-1 group-hover:text-teal-600 transition-colors uppercase text-xs tracking-wider">{title}</h4>
            <p className="text-sm text-slate-500 line-clamp-2">{description}</p>
        </button>
    );

    const allQuickActions = [
        {
            title: "Register Patient",
            description: "Add a new patient to the system",
            icon: UserPlus,
            link: "/staff/patients/create",
            colorTheme: colors.primary,
            permission: "create-patient"
        },
        {
            title: "Book Appointment",
            description: "Schedule a new visit",
            icon: PlusCircle,
            link: "/staff/appointments/create",
            colorTheme: colors.blue,
            permission: "create-appointment"
        },
        {
            title: "Manage Lab Tests",
            description: "View and update laboratory test requests",
            icon: ClipboardList,
            link: "/staff/lab-tests",
            colorTheme: colors.primary,
            permission: "view-labtest"
        },
        {
            title: "Manage Finances",
            description: "View and record transactions",
            icon: CreditCard,
            link: "/staff/finance",
            colorTheme: colors.emerald,
            permission: "view-payment"
        },
        {
            title: "Bed Management",
            description: "Assign, transfer, or discharge patients",
            icon: Hospital,
            link: "/staff/inpatient/beds",
            colorTheme: colors.emerald,
            permission: "view-bed"
        },
        {
            title: "Patient Directory",
            description: "Search and view patient records",
            icon: Users,
            link: "/staff/patients",
            colorTheme: colors.purple,
            permission: "view-patient"
        },
        {
            title: "Manage Wards",
            description: "View occupancy and ward status",
            icon: Activity,
            link: "/staff/inpatient/wards",
            colorTheme: colors.amber,
            permission: "view-ward"
        }
    ];

    const currentActions = allQuickActions.filter(action => isAdmin || permissions.includes(action.permission));

    const renderBed = (bed) => {
        const isOccupied = bed.status === 'OCCUPIED';
        const isAvailable = bed.status === 'AVAILABLE';
        const isCleaning = bed.status === 'CLEANING';
        const activeAssignment = bed.assignments?.[0];
        
        const hasPermission = (isAvailable && canAssign) || (isOccupied && (canTransfer || canDischarge)) || (isCleaning && (isAdmin || permissions.includes('assign-bed')));

        const displayNum = bed.bedNumber.includes('-') 
            ? bed.bedNumber.split('-').pop() 
            : bed.bedNumber;

        return (
            <div key={bed.id} className="relative group">
                <div 
                    onClick={() => {
                        if (!hasPermission) return;
                        if (isAvailable) openModal('ASSIGN', bed);
                        else if (isOccupied) openModal('TRANSFER', bed, activeAssignment);
                        else if (isCleaning) handleQuickStatusUpdate(bed.id, 'AVAILABLE');
                    }}
                    role="button"
                    tabIndex={hasPermission ? 0 : -1}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (!hasPermission) return;
                            if (isAvailable) openModal('ASSIGN', bed);
                            else if (isOccupied) openModal('TRANSFER', bed, activeAssignment);
                            else if (isCleaning) handleQuickStatusUpdate(bed.id, 'AVAILABLE');
                        }
                    }}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all border-2 shadow-sm ${
                        isAvailable ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-500 hover:shadow-emerald-100 cursor-pointer' :
                        isOccupied ? 'bg-rose-50 text-rose-600 border-rose-100 hover:border-rose-500 hover:shadow-rose-100 cursor-pointer' :
                        isCleaning ? 'bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-500 hover:shadow-amber-100 cursor-pointer' :
                        'bg-slate-50 text-slate-400 border-slate-100 grayscale cursor-default'
                    }`}
                >
                    <div className={`p-1.5 rounded-lg mb-1 ${
                        isAvailable ? 'bg-emerald-100/50' : 
                        isOccupied ? 'bg-rose-100/50' : 
                        isCleaning ? 'bg-amber-100/50' : 
                        'bg-slate-200/50'
                    }`}>
                        <Hospital className={`w-5 h-5 ${isOccupied ? 'animate-pulse' : ''}`} />
                    </div>
                    <span className="text-[11px] font-extrabold tracking-tight">{displayNum}</span>
                </div>

                {isOccupied && (canTransfer || canDischarge) && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-white/80 rounded-2xl transition-all duration-200 scale-90 group-hover:scale-100 gap-2 shadow-inner">
                        {canTransfer && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); openModal('TRANSFER', bed, activeAssignment); }}
                                className="p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-transform active:scale-95"
                                title="Transfer Patient"
                            >
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                        )}
                        {canDischarge && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); openModal('DISCHARGE', bed, activeAssignment); }}
                                className="p-2 bg-rose-600 text-white rounded-lg shadow-lg hover:bg-rose-700 transition-transform active:scale-95"
                                title="Discharge Patient"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                )}

                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-slate-900 text-white p-3 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-20 shadow-2xl scale-95 group-hover:scale-100 origin-bottom border border-slate-700">
                    <div className="flex justify-between items-start mb-2 border-b border-slate-700 pb-2">
                        <div>
                            <p className="font-bold text-xs">Bed {bed.bedNumber}</p>
                            <p className="text-[10px] text-slate-400 font-medium">
                                {bed.room ? `Room ${bed.room.roomNumber}` : 'General Ward'}
                            </p>
                        </div>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            isAvailable ? 'bg-emerald-500/20 text-emerald-400' :
                            isOccupied ? 'bg-rose-500/20 text-rose-400' :
                            isCleaning ? 'bg-amber-500/20 text-amber-400' :
                            'bg-slate-500/20 text-slate-400'
                        }`}>
                            {bed.status}
                        </span>
                    </div>
                    {isOccupied && activeAssignment && (
                        <div className="space-y-1">
                            <p className="font-bold text-xs text-rose-300 truncate">{activeAssignment.patient?.name}</p>
                            <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                                <span>MR: {activeAssignment.patient?.mrNumber}</span>
                                <span>{activeAssignment.patient?.age}y • {activeAssignment.patient?.gender}</span>
                            </div>
                        </div>
                    )}
                    {isCleaning && (
                        <p className="text-[10px] text-amber-400 italic">Mark as available when done</p>
                    )}
                    {!isOccupied && !isCleaning && (
                        <p className="text-[10px] text-slate-400 italic">Available for assignment</p>
                    )}
                    {!hasPermission && (
                        <p className="text-[8px] text-amber-400 mt-1 font-bold">View Only Mode</p>
                    )}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-[15px] font-bold text-teal-600 uppercase tracking-[0.2em] mb-1">
                        {userRole?.replace(/_/g, ' ')}
                    </p>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome back, {userName}!</h1>
                    <p className="text-slate-500">Here's a summary of your workspace and tasks for today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white rounded-lg border border-teal-100 shadow-sm text-sm font-medium text-slate-600">
                        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            {currentActions.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-teal-600 rounded-lg shadow-sm">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {currentActions.map((action, index) => (
                            <QuickActionCard
                                key={index}
                                {...action}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Stat Cards Grid */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${canViewInpatient ? '3 xl:grid-cols-6' : '4'} gap-6`}>
                <StatCard
                    title={stats?.isLabRole ? "Pending Tests" : "Appointments Today"}
                    value={stats?.appointmentsToday || 0}
                    icon={stats?.isLabRole ? TestTube2 : Calendar}
                    colorTheme={colors.primary}
                />
                <StatCard
                    title="Pending Tasks"
                    value={stats?.pendingTasks || 0}
                    icon={Clock}
                    colorTheme={colors.blue}
                />
                {canViewInpatient && (
                    <>
                        <StatCard
                            title="Available Beds"
                            value={inpatientSummary?.AVAILABLE || 0}
                            icon={Hospital}
                            colorTheme={colors.emerald}
                        />
                        <StatCard
                            title="Occupied Beds"
                            value={inpatientSummary?.OCCUPIED || 0}
                            icon={Activity}
                            colorTheme={colors.amber}
                        />
                    </>
                )}
                <StatCard
                    title={stats?.isLabRole ? "Tests Completed" : "Completed Today"}
                    value={stats?.completedTasks || 0}
                    icon={CheckCircle2}
                    colorTheme={colors.emerald}
                />
                <StatCard
                    title={stats?.isLabRole ? "Lab Patients" : "Active Patients"}
                    value={stats?.activePatients || 0}
                    icon={Users}
                    colorTheme={colors.purple}
                />
            </div>

            {/* Inpatient Occupancy Section */}
            {canViewInpatient && occupancyData.length > 0 && (
                <div className="bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-teal-100 flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Hospital className="w-5 h-5 text-teal-600" />
                                Ward Occupancy Map
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5 font-medium">Real-time bed distribution and assignment status</p>
                        </div>
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-teal-50 shadow-sm">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" /> AVAILABLE
                            </div>
                            <div className="w-px h-3 bg-slate-200" />
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600">
                                <div className="w-2 h-2 rounded-full bg-rose-500" /> OCCUPIED
                            </div>
                            <div className="w-px h-3 bg-slate-200" />
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600">
                                <div className="w-2 h-2 rounded-full bg-amber-500" /> CLEANING
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                            {occupancyData.map((ward) => (
                                <div key={ward.id} className="relative bg-white border border-slate-100 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-3">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-base">{ward.name}</h3>
                                            <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">{ward.code}</p>
                                        </div>
                                        <div className="bg-teal-50 text-teal-700 px-2 py-1 rounded-md text-[10px] font-bold">
                                            {([...(ward.rooms?.flatMap(r => r.beds) || []), ...(ward.beds || [])].length)} BEDS
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        {/* Group by Rooms */}
                                        {ward.rooms?.map((room) => (
                                            <div key={room.id} className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                                                <div className="flex items-center justify-between mb-3 px-1">
                                                    <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                                                        Room {room.roomNumber}
                                                    </h4>
                                                    <span className="text-[10px] font-medium text-slate-400">{room.beds?.length || 0} Beds</span>
                                                </div>
                                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                                                    {room.beds?.map(bed => renderBed(bed))}
                                                </div>
                                            </div>
                                        ))}

                                        {/* General Ward Beds (No Room) */}
                                        {ward.beds?.length > 0 && (
                                            <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                                                <div className="flex items-center justify-between mb-3 px-1">
                                                    <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                        General Area
                                                    </h4>
                                                    <span className="text-[10px] font-medium text-slate-400">{ward.beds.length} Beds</span>
                                                </div>
                                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                                                    {ward.beds.map(bed => renderBed(bed))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Activity / Upcoming Appointments */}
            {/* Permission specific - Financial Transactions */}
            {(isAdmin || permissions.includes('view-payment')) && stats?.recentPayments && (
                <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-sm mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-teal-600" />
                            Recent Financial Transactions
                        </h2>
                        <button 
                            onClick={() => navigate('/staff/payments')}
                            className="text-teal-600 text-xs font-bold hover:underline"
                        >
                            View Ledger
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {stats.recentPayments.length > 0 ? (
                            stats.recentPayments.map((pay, i) => (
                                <div key={i} className="flex flex-col justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-teal-300 transition-all relative group/tx">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="px-2 py-1 bg-white rounded-md text-[9px] font-bold text-slate-500 shadow-sm uppercase tracking-tight truncate max-w-[70%]">
                                                {pay.category?.name}
                                            </div>
                                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-black border ${
                                                pay.status === 'PAID' 
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                    : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                                            }`}>
                                                {pay.status}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 truncate">{pay.patient?.name || 'Walk-in'}</p>
                                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                            {new Date(pay.createdAt).toLocaleDateString()} at {new Date(pay.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-black text-teal-600">Rs {pay.amount.toLocaleString()}</p>
                                            <span className="text-[8px] font-extrabold text-slate-400 uppercase">{pay.method || 'N/A'}</span>
                                        </div>
                                        <div className="flex gap-1.5 opacity-90 group-hover/tx:opacity-100 transition-opacity">
                                            {pay.status === 'PENDING' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedTxForPayment(pay);
                                                        setIsProcessPayModalOpen(true);
                                                    }}
                                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold shadow-sm transition-all"
                                                    title="Settle Invoice"
                                                >
                                                    Pay
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setSelectedTxForPrint(pay);
                                                    setIsPrintModalOpen(true);
                                                }}
                                                className="p-1 bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 rounded transition-colors"
                                                title="Print Receipt"
                                            >
                                                <Printer className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-6 text-center text-slate-400 text-sm italic">
                                No transactions recorded yet.
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-100">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        {stats?.isLabRole ? <TestTube2 className="w-5 h-5 text-teal-600" /> : <Calendar className="w-5 h-5 text-teal-600" />}
                        {stats?.isLabRole ? "Pending Lab Tests" : "Upcoming Appointments"}
                    </h2>
                    <div className="space-y-4">
                        {stats?.upcomingAppointments?.length > 0 ? (
                            stats.upcomingAppointments.map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => {
                                        if (stats?.isLabRole) {
                                            navigate(`/staff/lab-tests/edit/${item.id}`);
                                        } else {
                                            navigate(`/staff/appointments/edit/${item.id}`);
                                        }
                                    }}
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-teal-100 cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center font-bold text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                            {item.patientName?.[0] || 'P'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{item.patientName}</p>
                                            <p className="text-xs text-slate-500">{item.time} • {item.reason}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-teal-100 text-teal-700'}`}>
                                        {item.status}
                                    </span>
                                </div>
                              ))
                        ) : (
                            <div className="text-center py-8">
                                <Activity className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-500 text-sm">No {stats?.isLabRole ? "pending tests" : "upcoming appointments"}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-teal-600" />
                        {stats?.isLabRole ? "Recent Lab Results" : "Recent Patient Updates"}
                    </h2>
                    <div className="space-y-4">
                        {stats?.recentUpdates?.length > 0 ? (
                            stats.recentUpdates.map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => {
                                        if (stats?.isLabRole) {
                                            navigate(`/staff/lab-tests/edit/${item.id}`);
                                        } else {
                                            navigate(`/staff/appointments/edit/${item.id}`);
                                        }
                                    }}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                                >
                                    <div className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-teal-500' : 'bg-blue-500'}`}></div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-900 group-hover:text-teal-600 transition-colors"><span className="font-bold">{item.patientName}</span> {item.action}</p>
                                        <p className="text-xs text-slate-500">{item.time}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-500 text-sm">No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick New Transaction Creation Modal */}
            <CreateTransactionModal 
                isOpen={isPayModalOpen}
                onClose={() => setIsPayModalOpen(false)}
                onSuccess={fetchDashboardData}
            />

            {/* Settle Outstanding Invoice Modal */}
            <ProcessPaymentModal 
                isOpen={isProcessPayModalOpen}
                onClose={() => {
                    setIsProcessPayModalOpen(false);
                    setSelectedTxForPayment(null);
                }}
                transaction={selectedTxForPayment}
                onSuccess={fetchDashboardData}
            />

            {/* Printable Receipt View Modal */}
            <ReceiptPrintView 
                isOpen={isPrintModalOpen}
                onClose={() => {
                    setIsPrintModalOpen(false);
                    setSelectedTxForPrint(null);
                }}
                transaction={selectedTxForPrint}
            />

            <BedActionModal 
                isOpen={modalState.isOpen}
                onClose={closeModal}
                action={modalState.action}
                bed={modalState.bed}
                assignment={modalState.assignment}
                onRefresh={fetchDashboardData}
            />
        </div>
    );
};

export default StaffDashboard;

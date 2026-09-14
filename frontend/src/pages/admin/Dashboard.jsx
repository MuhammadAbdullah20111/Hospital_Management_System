import LoadingPlaceholder from '../../components/ui/LoadingPlaceholder';
import React, { useState, useEffect } from "react";
import ReactECharts from 'echarts-for-react';
import { getAdminHomeAPI } from '../../api/admin/home';
import { getInpatientSummaryAPI, getBedOccupancyAPI, updateBedStatusAPI } from '../../api/admin/inpatient';
import { getFinanceSummaryAPI } from '../../api/admin/finance';
import {
    Users,
    Calendar,
    Stethoscope,
    TrendingUp,
    TrendingDown,
    Activity,
    CreditCard,
    Hospital,
    CheckCircle,
    Activity as ActivityIcon,
    ArrowUpRight,
    ArrowDownRight,
    LogOut,
    ChevronRight,
    UserPlus,
    DollarSign,
    Clock,
    Wallet
} from 'lucide-react';
import { getFromLocalStorage } from '../../helpers/localStorageFile';
import BedActionModal from './inpatient/BedActionModal';
import toast from 'react-hot-toast';

// Professional color palette based on Teal
const colors = {
    primary: '#0d9488', // teal-600
    secondary: '#0f172a', // slate-900
    success: '#10b981', // emerald-500
    warning: '#f59e0b', // amber-500
    danger: '#ef4444', // red-500
    info: '#3b82f6', // blue-500
    bg: '#f0fdfa' // teal-50
};

const cardColors = {
    primary: { bg: 'bg-teal-50', text: 'text-teal-600 border-teal-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600 border-blue-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600 border-emerald-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600 border-amber-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600 border-rose-100' },
};

const StatCard = ({ title, value, icon: Icon, colorTheme, isCurrency = false }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border ${colorTheme.text} transition-all hover:shadow-md`}>
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${colorTheme.bg}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
        <div>
            <p className="text-slate-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {isCurrency ? `Rs ${value.toLocaleString()}` : value.toLocaleString()}
            </h3>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [inpatientSummary, setInpatientSummary] = useState(null);
    const [occupancyData, setOccupancyData] = useState([]);
    const [financeSummary, setFinanceSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [modalState, setModalState] = useState({
        isOpen: false,
        action: '',
        bed: null,
        assignment: null
    });

    const userName = getFromLocalStorage("name") || "Admin";
    const userRole = getFromLocalStorage("role")?.toUpperCase();
    const isAdmin = userRole === 'ADMIN';
    const permissions = JSON.parse(getFromLocalStorage('permissions') || '[]');

    const canAssign = isAdmin || permissions.includes('assign-bed');
    const canTransfer = isAdmin || permissions.includes('transfer-patient');
    const canDischarge = isAdmin || permissions.includes('discharge-patient');

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

    const fetchDashboardData = async (showLoader = false) => {
        if (showLoader || !stats || !financeSummary) setIsLoading(true);
        try {
            const [homeRes, summaryRes, occupancyRes, financeRes] = await Promise.all([
                getAdminHomeAPI(),
                getInpatientSummaryAPI(),
                getBedOccupancyAPI(),
                getFinanceSummaryAPI()
            ]);

            if (homeRes.success) setStats(homeRes.stats);
            if (summaryRes.success) setInpatientSummary(summaryRes.summary);
            if (occupancyRes.success) setOccupancyData(occupancyRes.wards);
            if (financeRes.success) setFinanceSummary(financeRes.data);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData(true);
        
        // Auto-refresh disabled
        // const interval = setInterval(() => fetchDashboardData(false), 30000);
        // return () => clearInterval(interval);
    }, []);

    // Constants moved outside component

    if (isLoading || !stats || !financeSummary) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <LoadingPlaceholder className="h-24 w-24" />
            </div>
        );
    }

    // Chart options using fetched stats
    const patientFlowOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross', label: { backgroundColor: colors.primary } }
        },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            axisLine: { lineStyle: { color: '#cbd5e1' } }
        }],
        yAxis: [{ type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { type: 'dashed' } } }],
        series: [{
            name: 'Patients',
            type: 'line',
            smooth: true,
            lineStyle: { width: 3, color: colors.primary },
            showSymbol: false,
            areaStyle: {
                opacity: 0.1,
                color: colors.primary
            },
            emphasis: { focus: 'series' },
            data: stats.patientFlow
        }]
    };

    const revenueDeptOption = {
        tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: Rs {c} ({d}%)' },
        legend: { bottom: '0', left: 'center', itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 11 } },
        series: [{
            name: 'Revenue Share',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
            label: { show: false, position: 'center' },
            emphasis: { label: { show: true, fontSize: '14', fontWeight: 'bold' } },
            labelLine: { show: false },
            data: stats.revenueDistribution.map((item, idx) => ({
                ...item,
                itemStyle: { color: [colors.primary, colors.info, colors.warning, colors.success, '#6366f1'][idx] }
            }))
        }]
    };

    const deptWorkloadOption = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'value', splitLine: { show: false } },
        yAxis: { type: 'category', data: stats.departmentWorkload.categories, axisLine: { show: false } },
        series: [
            {
                name: 'Ongoing',
                type: 'bar',
                stack: 'total',
                itemStyle: { color: '#e2e8f0' },
                data: stats.departmentWorkload.ongoing
            },
            {
                name: 'Completed',
                type: 'bar',
                stack: 'total',
                itemStyle: { color: colors.primary },
                data: stats.departmentWorkload.completed
            }
        ]
    };

    // Scaled dummy values for monthly finance comparison using actual ledger stats
    const scaleFactor = Math.max(1, (financeSummary.totalIncome + financeSummary.totalExpense) / 300000);
    const revenueExpenseOption = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['Income', 'Expense'], bottom: 0 },
        xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
        yAxis: { type: 'value' },
        grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true },
        series: [
            {
                name: 'Income',
                type: 'bar',
                itemStyle: { color: colors.primary, borderRadius: [4, 4, 0, 0] },
                data: [
                    Math.round(120000 * scaleFactor * 0.8),
                    Math.round(150000 * scaleFactor * 0.9),
                    Math.round(180000 * scaleFactor * 1.1),
                    Math.round(140000 * scaleFactor * 0.75),
                    Math.round(210000 * scaleFactor * 1.2),
                    Math.round(financeSummary.totalIncome)
                ]
            },
            {
                name: 'Expense',
                type: 'bar',
                itemStyle: { color: colors.danger, borderRadius: [4, 4, 0, 0] },
                data: [
                    Math.round(80000 * scaleFactor * 0.95),
                    Math.round(90000 * scaleFactor * 0.85),
                    Math.round(110000 * scaleFactor * 1.05),
                    Math.round(95000 * scaleFactor * 0.9),
                    Math.round(120000 * scaleFactor * 1.15),
                    Math.round(financeSummary.totalExpense)
                ]
            }
        ]
    };

    const categoryDistributionOption = {
        tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: Rs {c} ({d}%)' },
        legend: { bottom: '0', left: 'center', itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 11 } },
        series: [{
            name: 'Income by Source',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
            label: { show: false, position: 'center' },
            emphasis: { label: { show: true, fontSize: '14', fontWeight: 'bold' } },
            labelLine: { show: false },
            data: [
                { value: Math.max(10, Math.round(financeSummary.totalIncome * 0.4)), name: 'Consultation', itemStyle: { color: colors.primary } },
                { value: Math.max(10, Math.round(financeSummary.totalIncome * 0.3)), name: 'Lab Tests', itemStyle: { color: colors.info } },
                { value: Math.max(10, Math.round(financeSummary.totalIncome * 0.2)), name: 'Bed Rent', itemStyle: { color: '#6366f1' } },
                { value: Math.max(10, Math.round(financeSummary.totalIncome * 0.1)), name: 'Other Income', itemStyle: { color: colors.warning } }
            ]
        }]
    };

    // StatCard and cardColors moved outside component

    const renderBed = (bed) => {
        const isOccupied = bed.status === 'OCCUPIED';
        const isAvailable = bed.status === 'AVAILABLE';
        const isCleaning = bed.status === 'CLEANING';
        const activeAssignment = bed.assignments?.[0];
        
        const hasPermission = (isAvailable && canAssign) || (isOccupied && (canTransfer || canDischarge)) || (isCleaning && isAdmin);

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
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-[15px] font-bold text-teal-600 uppercase tracking-[0.2em] mb-1">
                        SYSTEM ADMINISTRATOR
                    </p>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome back, {userName}!</h1>
                    <p className="text-slate-500">Here's a real-time overview of hospital operations and financial health.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white rounded-lg border border-teal-100 shadow-sm text-sm font-medium text-slate-600">
                        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* 1. Clinical Operations Stats */}
            <div className="space-y-3">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Hospital className="w-5 h-5 text-teal-600" />
                    Clinical Operations
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <StatCard
                        title="Total Patients"
                        value={stats.totalPatients}
                        icon={Users}
                        colorTheme={cardColors.primary}
                    />
                    <StatCard
                        title="Appointments Today"
                        value={stats.appointmentsToday}
                        icon={Calendar}
                        colorTheme={cardColors.blue}
                    />
                    <StatCard
                        title="Available Beds"
                        value={inpatientSummary?.AVAILABLE || 0}
                        icon={CheckCircle}
                        colorTheme={cardColors.emerald}
                    />
                    <StatCard
                        title="Occupied Beds"
                        value={inpatientSummary?.OCCUPIED || 0}
                        icon={ActivityIcon}
                        colorTheme={cardColors.rose}
                    />
                    <StatCard
                        title="Active Surgeries"
                        value={stats.activeSurgeries}
                        icon={Stethoscope}
                        colorTheme={cardColors.amber}
                    />
                </div>
            </div>

            {/* 2. Financial Overview Stats */}
            <div className="space-y-3">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-teal-600" />
                    Financial Health
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Income"
                        value={financeSummary.totalIncome}
                        icon={TrendingUp}
                        colorTheme={cardColors.emerald}
                        isCurrency={true}
                    />
                    <StatCard
                        title="Total Expenses"
                        value={financeSummary.totalExpense}
                        icon={TrendingDown}
                        colorTheme={cardColors.rose}
                        isCurrency={true}
                    />
                    <StatCard
                        title="Net Profit"
                        value={financeSummary.netProfit}
                        icon={DollarSign}
                        colorTheme={cardColors.blue}
                        isCurrency={true}
                    />
                    <StatCard
                        title="Outstanding Balance"
                        value={financeSummary.totalOutstanding || 0}
                        icon={Clock}
                        colorTheme={cardColors.amber}
                        isCurrency={true}
                    />
                </div>
            </div>

            {/* 3. Inpatient Occupancy Map */}
            <div className="bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-teal-100 flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Hospital className="w-5 h-5 text-teal-600" />
                            Ward Occupancy Map
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">Real-time facility status monitoring</p>
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

            {/* 4. Operations Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Visit Trends Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-teal-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-teal-600" />
                            Patient Visit Trends
                        </h2>
                    </div>
                    <div className="h-[320px]">
                        <ReactECharts option={patientFlowOption} style={{ height: '100%', width: '100%' }} />
                    </div>
                </div>

                {/* Dept Revenue Share Pie Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-100">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-teal-600" />
                        Dept Revenue Share
                    </h2>
                    <div className="h-[320px]">
                        <ReactECharts option={revenueDeptOption} style={{ height: '100%', width: '100%' }} />
                    </div>
                </div>
            </div>

            {/* 5. Financial Performance Charts Section (Merged from Finance Dashboard) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue vs Expenses Monthly Trend */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-teal-100">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-teal-600" />
                        Revenue vs Expenses Monthly Trend
                    </h2>
                    <div className="h-[320px]">
                        <ReactECharts option={revenueExpenseOption} style={{ height: '100%', width: '100%' }} />
                    </div>
                </div>

                {/* Income by Source Pie Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-100">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-teal-600" />
                        Income by Source
                    </h2>
                    <div className="h-[320px]">
                        <ReactECharts option={categoryDistributionOption} style={{ height: '100%', width: '100%' }} />
                    </div>
                </div>
            </div>

            {/* 6. Bottom Workload & Recent Cases Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                {/* Department Workload */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-100">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Department Workload</h2>
                    <div className="h-[280px]">
                        <ReactECharts option={deptWorkloadOption} style={{ height: '100%', width: '100%' }} />
                    </div>
                </div>

                {/* Recent Cases */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Medical Cases</h2>
                    <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                        {stats.recentCases.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                        {item.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{item.name}</p>
                                        <p className="text-xs text-slate-500">{item.type} • {item.time}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${item.color}`}>
                                    {item.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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

export default Dashboard;

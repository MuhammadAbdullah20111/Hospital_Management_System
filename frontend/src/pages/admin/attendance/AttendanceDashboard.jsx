import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Fingerprint, 
  Cpu, 
  FileSpreadsheet, 
  CalendarDays, 
  Users, 
  UserX, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  RefreshCw, 
  Check, 
  AlertCircle,
  Settings,
  HelpCircle
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import toast from 'react-hot-toast';
import { 
  getDailySummariesAPI, 
  syncAllDevicesAPI
} from '../../../api/admin/attendance';
import { getAllStaffAPI, getAllDepartmentsAPI } from '../../../api/admin/staff';
import ManualAttendanceModal from './ManualAttendanceModal';
import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';

const AttendanceDashboard = () => {
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Helper for local date string in YYYY-MM-DD format
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Filters
  const [filterDate, setFilterDate] = useState(getLocalDateString());
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');



  // Correction Modal state
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState(null);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [staffRes, deptsRes] = await Promise.all([
        getAllStaffAPI(),
        getAllDepartmentsAPI()
      ]);

      if (staffRes.success) setStaffList(staffRes.staff);
      if (deptsRes.success) setDepartments(deptsRes.departments);
      
      await loadSummaries();
    } catch (err) {
      console.error('Failed to load initial data:', err);
      toast.error('Failed to load staff list or department filters');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSummaries = async () => {
    try {
      const response = await getDailySummariesAPI({
        startDate: filterDate,
        endDate: filterDate,
        departmentId: selectedDept || undefined,
        status: selectedStatus || undefined
      });
      if (response.success) {
        setSummaries(response.summaries);
      }
    } catch (err) {
      console.error('Failed to load daily summaries:', err);
      toast.error('Failed to load daily attendance summaries');
    }
  };

  useEffect(() => {
    fetchInitialData();

    // Automatically refresh summaries every 10 seconds to display new check-ins live
    const interval = setInterval(() => {
      loadSummaries();
    }, 10000);

    return () => clearInterval(interval);
  }, [filterDate, selectedDept, selectedStatus]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const response = await syncAllDevicesAPI();
      if (response.success) {
        toast.success('All active devices synchronized!');
        await loadSummaries();
      }
    } catch (err) {
      console.error('Sync failed:', err);
      toast.error('Failed to synchronize biometric devices');
    } finally {
      setIsSyncing(false);
    }
  };



  // Filter list locally by search query
  const filteredSummaries = summaries.filter(sum => 
    sum.staff?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sum.staff?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(sum.staff?.biometricPin).includes(searchQuery)
  );

  // Analytics Metrics
  const presentCount = summaries.filter(s => ['PRESENT', 'LATE', 'EARLY_DEPARTURE', 'LATE_AND_EARLY_DEPART'].includes(s.status)).length;
  const lateCount = summaries.filter(s => ['LATE', 'LATE_AND_EARLY_DEPART'].includes(s.status)).length;
  const absentCount = summaries.filter(s => s.status === 'ABSENT').length;
  const offDayCount = summaries.filter(s => s.status === 'OFF_DAY').length;

  const totalWorkingStaff = staffList.length;
  const attendanceRate = totalWorkingStaff > 0 
    ? Math.round((presentCount / (totalWorkingStaff - offDayCount || totalWorkingStaff)) * 100) 
    : 0;

  // Chart configuration
  const getDeptChartOption = () => {
    // Group present count by department
    const deptStats = {};
    departments.forEach(d => {
      deptStats[d.name] = { present: 0, total: 0 };
    });

    staffList.forEach(s => {
      if (s.department?.name) {
        if (!deptStats[s.department.name]) {
          deptStats[s.department.name] = { present: 0, total: 0 };
        }
        deptStats[s.department.name].total++;
      }
    });

    summaries.forEach(sum => {
      if (sum.staff?.department?.name && ['PRESENT', 'LATE', 'EARLY_DEPARTURE', 'LATE_AND_EARLY_DEPART'].includes(sum.status)) {
        if (!deptStats[sum.staff.department.name]) {
          deptStats[sum.staff.department.name] = { present: 0, total: 0 };
        }
        deptStats[sum.staff.department.name].present++;
      }
    });

    const deptNames = Object.keys(deptStats);
    const presentData = deptNames.map(name => deptStats[name].present);
    const totalData = deptNames.map(name => deptStats[name].total);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['Present', 'Total Assigned'],
        textStyle: { color: '#64748b' },
        top: '0'
      },
      grid: {
        top: '15%',
        left: '3%',
        right: '4%',
        bottom: '5%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: deptNames,
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisLabel: { color: '#64748b' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisLabel: { color: '#64748b' },
        splitLine: { lineStyle: { color: '#f1f5f9' } }
      },
      series: [
        {
          name: 'Present',
          type: 'bar',
          data: presentData,
          itemStyle: { color: '#0d9488', borderRadius: [4, 4, 0, 0] }
        },
        {
          name: 'Total Assigned',
          type: 'bar',
          data: totalData,
          itemStyle: { color: '#cbd5e1', borderRadius: [4, 4, 0, 0] }
        }
      ]
    };
  };

  const getOverviewChartOption = () => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: '0',
        data: ['Present On-Time', 'Late Arrivals', 'Absent', 'Weekend/Off'],
        textStyle: { color: '#64748b' }
      },
      series: [
        {
          name: 'Attendance Status',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: { show: false },
          labelLine: { show: false },
          data: [
            { value: presentCount - lateCount, name: 'Present On-Time', itemStyle: { color: '#0d9488' } },
            { value: lateCount, name: 'Late Arrivals', itemStyle: { color: '#f59e0b' } },
            { value: absentCount, name: 'Absent', itemStyle: { color: '#f43f5e' } },
            { value: offDayCount, name: 'Weekend/Off', itemStyle: { color: '#94a3b8' } }
          ]
        }
      ]
    };
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Fingerprint className="w-7 h-7 text-teal-600 animate-pulse" />
            Biometric Attendance
          </h1>
          <p className="text-slate-500">Real-time ZKTeco biometric sync, dashboard logs, and correction overrides.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/admin/dashboard/attendance/devices')}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
          >
            <Settings className="w-4 h-4" />
            Biometric Devices
          </button>
          <button
            onClick={() => navigate('/admin/dashboard/attendance/reports')}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Monthly Report
          </button>
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Devices
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-teal-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Attendance Rate</p>
            <h3 className="text-xl font-bold text-slate-800">{attendanceRate}%</h3>
          </div>
        </div>

        <div className="bg-white border border-teal-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Present Today</p>
            <h3 className="text-xl font-bold text-slate-800">{presentCount} staff</h3>
          </div>
        </div>

        <div className="bg-white border border-teal-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Late Arrivals</p>
            <h3 className="text-xl font-bold text-slate-800">{lateCount} staff</h3>
          </div>
        </div>

        <div className="bg-white border border-teal-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Absent Today</p>
            <h3 className="text-xl font-bold text-slate-800">{absentCount} staff</h3>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-teal-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all col-span-2">
          <h3 className="font-bold text-slate-800 mb-4 text-base">Department Attendance Overview</h3>
          <div className="h-[280px]">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <LoadingPlaceholder className="h-12 w-12" />
              </div>
            ) : (
              <ReactECharts option={getDeptChartOption()} style={{ height: '100%', width: '100%' }} />
            )}
          </div>
        </div>

        <div className="bg-white border border-teal-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
          <h3 className="font-bold text-slate-800 mb-4 text-base">Daily Distribution</h3>
          <div className="h-[280px]">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <LoadingPlaceholder className="h-12 w-12" />
              </div>
            ) : (
              <ReactECharts option={getOverviewChartOption()} style={{ height: '100%', width: '100%' }} />
            )}
          </div>
        </div>
      </div>



      {/* Logs and Filters Grid */}
      <div className="bg-white border border-teal-100 rounded-2xl shadow-sm hover:shadow-md transition-all p-6 space-y-6">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-wrap gap-4 items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex flex-wrap gap-3 items-center flex-1">
            
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search staff, PIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
              />
            </div>

            {/* Date Picker */}
            <div className="relative w-[160px]">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <CalendarDays className="w-4 h-4 text-teal-600" />
              </span>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm font-semibold text-slate-700"
              />
            </div>

            {/* Department */}
            <div className="w-[180px]">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm font-semibold text-slate-700"
              >
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="w-[150px]">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm font-semibold text-slate-700"
              >
                <option value="">All Statuses</option>
                <option value="PRESENT">PRESENT</option>
                <option value="LATE">LATE</option>
                <option value="EARLY_DEPARTURE">EARLY DEPARTURE</option>
                <option value="ABSENT">ABSENT</option>
                <option value="OFF_DAY">OFF DAY</option>
                <option value="INCOMPLETE">INCOMPLETE</option>
              </select>
            </div>

          </div>
        </div>

        {/* Daily Logs Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <LoadingPlaceholder className="h-12 w-12 mx-auto" />
            <p className="text-slate-500 text-sm mt-3">Loading daily logs...</p>
          </div>
        ) : filteredSummaries.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">No Records Found</h3>
            <p className="text-slate-500 text-sm">No attendance matching the selected filters was recorded on this date.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-700 text-xs font-bold uppercase border-b border-teal-50">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-4 py-4 text-center">PIN</th>
                  <th className="px-4 py-4">Department</th>
                  <th className="px-4 py-4 text-center">First In</th>
                  <th className="px-4 py-4 text-center">Last Out</th>
                  <th className="px-4 py-4 text-center">Hours Worked</th>
                  <th className="px-4 py-4 text-center">Lateness</th>
                  <th className="px-4 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600 font-medium">
                {filteredSummaries.map(sum => (
                  <tr key={sum.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* Employee Profile */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{sum.staff?.name}</div>
                      <div className="text-xs text-slate-400 font-normal">{sum.staff?.role?.name}</div>
                    </td>

                    {/* PIN */}
                    <td className="px-4 py-4 text-center font-mono text-xs">{sum.staff?.biometricPin || 'N/A'}</td>

                    {/* Department */}
                    <td className="px-4 py-4 text-xs font-semibold">{sum.staff?.department?.name || 'N/A'}</td>

                    {/* In time */}
                    <td className="px-4 py-4 text-center font-semibold text-slate-800">
                      {sum.checkIn ? new Date(sum.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                    </td>

                    {/* Out time */}
                    <td className="px-4 py-4 text-center font-semibold text-slate-800">
                      {sum.checkOut ? new Date(sum.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                    </td>

                    {/* Hours */}
                    <td className="px-4 py-4 text-center font-bold">
                      {sum.totalHours > 0 ? `${sum.totalHours.toFixed(1)} hrs` : '--'}
                    </td>

                    {/* Lateness / Overtime */}
                    <td className="px-4 py-4 text-center text-xs text-slate-500">
                      {sum.lateMinutes > 0 && (
                        <div className="text-rose-600 font-bold">Late: {sum.lateMinutes}m</div>
                      )}
                      {sum.overtimeMinutes > 0 && (
                        <div className="text-emerald-600 font-bold">OT: {Math.round(sum.overtimeMinutes / 6) / 10}h</div>
                      )}
                      {!sum.lateMinutes && !sum.overtimeMinutes && <span>--</span>}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        sum.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        sum.status === 'LATE' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        sum.status === 'EARLY_DEPARTURE' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                        sum.status === 'ABSENT' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                        sum.status === 'OFF_DAY' ? 'bg-slate-50 text-slate-500' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {sum.status}
                      </span>
                      {sum.isManualOverride && (
                        <div className="text-[9px] text-teal-600 font-bold mt-1">Edited by Admin</div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedSummary(sum);
                          setIsCorrectionOpen(true);
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Correction
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Override modal */}
      <ManualAttendanceModal
        isOpen={isCorrectionOpen}
        onClose={() => {
          setIsCorrectionOpen(false);
          setSelectedSummary(null);
        }}
        summary={selectedSummary}
        onSuccess={loadSummaries}
      />

    </div>
  );
};

export default AttendanceDashboard;

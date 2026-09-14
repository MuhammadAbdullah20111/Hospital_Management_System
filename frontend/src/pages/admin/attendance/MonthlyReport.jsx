import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Building2, 
  FileSpreadsheet, 
  ArrowLeft, 
  Search, 
  TrendingUp, 
  AlertCircle, 
  Users 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMonthlyReportAPI } from '../../../api/admin/attendance';
import { getAllDepartmentsAPI } from '../../../api/admin/staff';
import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';

const MonthlyReport = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedDept, setSelectedDept] = useState('');

  // Filter list locally by search query
  const filteredReportData = reportData.filter(row => 
    row.staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(row.staff.biometricPin || '').includes(searchQuery)
  );

  const fetchFiltersAndReport = async () => {
    setIsLoading(true);
    try {
      // Fetch departments
      const deptsRes = await getAllDepartmentsAPI();
      if (deptsRes.success) {
        setDepartments(deptsRes.departments);
      }

      // Fetch report data
      await loadReport();
    } catch (err) {
      console.error('Failed to load filters or reports:', err);
      toast.error('Failed to fetch attendance reports');
    } finally {
      setIsLoading(false);
    }
  };

  const loadReport = async () => {
    try {
      const response = await getMonthlyReportAPI({
        year,
        month,
        departmentId: selectedDept || undefined
      });
      if (response.success) {
        setReportData(response.report);
      }
    } catch (err) {
      console.error('Failed to query monthly report:', err);
      toast.error('Failed to generate attendance report');
    }
  };

  useEffect(() => {
    fetchFiltersAndReport();
  }, []);

  const handleFilterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await loadReport();
    setIsLoading(false);
  };

  // Export to CSV helper
  const handleExportCSV = () => {
    const dataToExport = filteredReportData;
    if (dataToExport.length === 0) {
      toast.error('No data available to export');
      return;
    }
    setIsExporting(true);

    try {
      const headers = [
        'Employee ID', 'Name', 'Email', 'Role', 'Department', 
        'Device PIN', 'Days Present', 'Days Late', 'Days Absent', 
        'Early Departures', 'Incomplete Days', 'Off Days', 
        'Total Hours Worked', 'Overtime (Min)', 'Late (Min)'
      ];

      const csvRows = [
        headers.join(','), // header row
        ...dataToExport.map(row => [
          row.staff.id,
          `"${row.staff.name}"`,
          row.staff.email,
          row.staff.role,
          `"${row.staff.department || 'N/A'}"`,
          row.staff.biometricPin || 'N/A',
          row.presentCount,
          row.lateCount,
          row.absentCount,
          row.earlyDepartCount,
          row.incompleteCount,
          row.offDayCount,
          row.totalHours.toFixed(2),
          row.totalOvertimeMinutes,
          row.totalLateMinutes
        ].join(','))
      ];

      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `attendance_payroll_report_${year}_${month}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CSV report downloaded successfully!');
    } catch (err) {
      console.error('CSV Generation failed:', err);
      toast.error('Failed to export CSV file');
    } finally {
      setIsExporting(false);
    }
  };

  const yearsList = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 3; y <= currentYear; y++) {
    yearsList.push(y.toString());
  }

  const monthsList = [
    { value: '01', name: 'January' },
    { value: '02', name: 'February' },
    { value: '03', name: 'March' },
    { value: '04', name: 'April' },
    { value: '05', name: 'May' },
    { value: '06', name: 'June' },
    { value: '07', name: 'July' },
    { value: '08', name: 'August' },
    { value: '09', name: 'September' },
    { value: '10', name: 'October' },
    { value: '11', name: 'November' },
    { value: '12', name: 'December' }
  ];

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <button
            onClick={() => navigate('/admin/dashboard/attendance')}
            className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors mb-2 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Attendance Dashboard
          </button>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-teal-600" />
            Monthly Payroll Report
          </h1>
          <p className="text-slate-500">Export aggregated staff presence hours and overtime records for payroll processing.</p>
        </div>

        <div>
          <button
            onClick={handleExportCSV}
            disabled={filteredReportData.length === 0 || isExporting}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export to CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleFilterSubmit} className="bg-white rounded-2xl border border-teal-100 shadow-sm hover:shadow-md transition-all p-6 mb-8 flex flex-wrap gap-4 items-end">
        {/* Year */}
        <div className="flex-1 min-w-[150px] space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            Select Year
          </label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm font-semibold text-slate-700"
          >
            {yearsList.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Month */}
        <div className="flex-1 min-w-[150px] space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            Select Month
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm font-semibold text-slate-700"
          >
            {monthsList.map(m => (
              <option key={m.value} value={m.value}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div className="flex-1 min-w-[200px] space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            Department
          </label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm font-semibold text-slate-700"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        {/* Query Button */}
        <button
          type="submit"
          className="px-6 py-2 bg-teal-600 text-white rounded-xl font-bold text-sm h-10 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Search className="w-4 h-4" />
          Compile Report
        </button>
      </form>

      {/* Stats Summary */}
      {reportData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-teal-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Total Staff</p>
              <h3 className="text-xl font-bold text-slate-800">{reportData.length}</h3>
            </div>
          </div>

          <div className="bg-white border border-teal-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Accumulated Hours</p>
              <h3 className="text-xl font-bold text-slate-800">
                {reportData.reduce((acc, row) => acc + row.totalHours, 0).toFixed(0)} hrs
              </h3>
            </div>
          </div>

          <div className="bg-white border border-teal-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Total Absences</p>
              <h3 className="text-xl font-bold text-slate-800">
                {reportData.reduce((acc, row) => acc + row.absentCount, 0)} days
              </h3>
            </div>
          </div>

          <div className="bg-white border border-teal-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Total Overtime</p>
              <h3 className="text-xl font-bold text-slate-800">
                {(reportData.reduce((acc, row) => acc + row.totalOvertimeMinutes, 0) / 60).toFixed(0)} hrs
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-12 text-center">
          <LoadingPlaceholder className="h-12 w-12 mx-auto" />
          <p className="text-slate-500 text-sm mt-4">Compiling report data, please wait...</p>
        </div>
      ) : reportData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-12 text-center space-y-2">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-lg">No Attendance Records Found</h3>
          <p className="text-slate-500 text-sm">No summaries could be compiled for the selected year and month.</p>
        </div>
      ) : (
        <div className="bg-white border border-teal-100 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden">
          
          {/* Search Bar */}
          <div className="px-6 py-4 border-b border-slate-200/60 bg-slate-50/30 flex items-center justify-between gap-4 flex-wrap">
            <div className="relative min-w-[240px] max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search staff, PIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm font-medium"
              />
            </div>
            {searchQuery && (
              <div className="text-xs text-slate-500">
                Found <span className="font-bold text-teal-600">{filteredReportData.length}</span> staff member(s)
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-700 text-xs font-bold uppercase border-b border-teal-50">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-4 py-4 text-center">PIN</th>
                  <th className="px-4 py-4 text-center">Department</th>
                  <th className="px-4 py-4 text-center text-emerald-700 bg-emerald-50/50">Present</th>
                  <th className="px-4 py-4 text-center text-amber-700 bg-amber-50/30">Late</th>
                  <th className="px-4 py-4 text-center text-red-700 bg-red-50/30">Absent</th>
                  <th className="px-4 py-4 text-center text-indigo-700 bg-indigo-50/30">Early Dep</th>
                  <th className="px-4 py-4 text-center">Incomplete</th>
                  <th className="px-4 py-4 text-center text-slate-600 bg-slate-100/50">Off Days</th>
                  <th className="px-6 py-4 text-right">Hours Worked</th>
                  <th className="px-6 py-4 text-right">Overtime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600 font-medium">
                {filteredReportData.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="px-6 py-12 text-center text-slate-500">
                      <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      No staff members match the search query "{searchQuery}"
                    </td>
                  </tr>
                ) : (
                  filteredReportData.map(row => (
                    <tr key={row.staff.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{row.staff.name}</div>
                        <div className="text-xs text-slate-400 font-normal">{row.staff.role}</div>
                      </td>
                      <td className="px-4 py-4 text-center font-mono text-xs">{row.staff.biometricPin || 'N/A'}</td>
                      <td className="px-4 py-4 text-center text-xs">{row.staff.department || 'N/A'}</td>
                      <td className="px-4 py-4 text-center text-emerald-600 bg-emerald-50/10 font-bold">{row.presentCount}</td>
                      <td className="px-4 py-4 text-center text-amber-600 bg-amber-50/10 font-bold">{row.lateCount}</td>
                      <td className="px-4 py-4 text-center text-red-600 bg-red-50/10 font-bold">{row.absentCount}</td>
                      <td className="px-4 py-4 text-center text-indigo-600 bg-indigo-50/10">{row.earlyDepartCount}</td>
                      <td className="px-4 py-4 text-center text-slate-500">{row.incompleteCount}</td>
                      <td className="px-4 py-4 text-center text-slate-500 bg-slate-50/10">{row.offDayCount}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800">{row.totalHours.toFixed(2)} hrs</td>
                      <td className="px-6 py-4 text-right text-emerald-600 font-bold">
                        {row.totalOvertimeMinutes > 0 ? `${(row.totalOvertimeMinutes / 60).toFixed(1)} hrs` : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default MonthlyReport;

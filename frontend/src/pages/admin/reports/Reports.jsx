import React, { useState, useEffect } from 'react';
import DatePicker from '../../../components/ui/DatePicker';
import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import { getComprehensiveReportAPI } from '../../../api/admin/reports';
import {
    Banknote,
    CalendarCheck,
    Users,
    TestTubes,
    Download
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';

const Reports = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('monthly'); // 'daily', 'weekly', 'monthly', 'custom'
    const [customDates, setCustomDates] = useState({ start: '', end: '' });
    const [selectedRowDetails, setSelectedRowDetails] = useState(null);

    useEffect(() => {
        fetchData();
    }, [filter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let startDate = '';
            let endDate = '';
            const today = new Date();

            if (filter === 'daily') {
                startDate = today.toISOString().split('T')[0];
                endDate = startDate;
            } else if (filter === 'weekly') {
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                startDate = weekAgo.toISOString().split('T')[0];
                endDate = today.toISOString().split('T')[0];
            } else if (filter === 'monthly') {
                const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                startDate = monthAgo.toISOString().split('T')[0];
                endDate = today.toISOString().split('T')[0];
            } else if (filter === 'custom') {
                if (!customDates.start || !customDates.end) {
                    setLoading(false);
                    return;
                }
                startDate = customDates.start;
                endDate = customDates.end;
            }

            const res = await getComprehensiveReportAPI(startDate, endDate);
            setReportData(res);
        } catch (error) {
            console.error("Failed to fetch report data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCustomDateApply = () => {
        fetchData();
    };

    const handleExport = () => {
        if (!reportData) return;

        const escapeCSV = (val) => {
            if (val === null || val === undefined) return '""';
            return `"${String(val).replace(/"/g, '""')}"`;
        };

        // Standardize to 5 columns per row to keep Excel from shifting data
        const row = (cols) => {
            const padded = [...cols];
            while (padded.length < 5) padded.push("");
            return padded.map(escapeCSV).join(",") + "\n";
        };

        let csvContent = "\uFEFF"; // UTF-8 BOM

        // Summary
        csvContent += row(["REPORT SUMMARY"]);
        csvContent += row(["Metric", "Value"]);
        csvContent += row(["Total Revenue", `Rs ${reportData.summary.totalRevenue}`]);
        csvContent += row(["Total Appointments", reportData.summary.totalAppointments]);
        csvContent += row(["Total Patients Registered", reportData.summary.totalPatientsRegistered]);
        csvContent += row(["Total Lab Tests", reportData.summary.totalLabTests]);
        csvContent += row([]);

        // Doctors
        csvContent += row(["DOCTOR PERFORMANCE"]);
        csvContent += row(["Doctor Name", "Appointments Handled"]);
        reportData.doctorStats?.forEach(doc => {
            csvContent += row([doc.name, doc.appointmentsHandled]);
        });
        csvContent += row([]);

        // Receptionists
        csvContent += row(["RECEPTIONIST PERFORMANCE"]);
        csvContent += row(["Name", "Patients Registered", "Appointments Booked"]);
        reportData.receptionistStats?.forEach(rec => {
            csvContent += row([rec.name, rec.patientsRegistered, rec.appointmentsBooked]);
        });
        csvContent += row([]);

        // Lab Techs
        csvContent += row(["LAB TECHNICIAN PERFORMANCE"]);
        csvContent += row(["Name", "Tests Conducted"]);
        reportData.labStats?.forEach(lab => {
            csvContent += row([lab.name, lab.testsConducted]);
        });
        csvContent += row([]);

        // Detailed Appointments
        csvContent += row(["--- DETAILED APPOINTMENTS ---"]);
        csvContent += row(["Date", "Time", "Doctor", "Patient", "Status"]);

        const allAppts = [];
        reportData.doctorStats?.forEach(doc => {
            if (doc.details) allAppts.push(...doc.details);
        });

        // Deduplicate
        const uniqueAppts = Array.from(new Map(allAppts.map(a => [a.id, a])).values());

        uniqueAppts.forEach(appt => {
            csvContent += row([
                new Date(appt.date).toLocaleDateString(),
                appt.time,
                appt.doctor?.name || appt.doctorId,
                appt.patient?.name || appt.patientId,
                appt.status
            ]);
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `mkmc_report_${filter}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <LoadingPlaceholder className="h-16 w-16" />
                <p className="text-slate-400 font-medium animate-pulse">Loading reports...</p>
            </div>
        );
    }

    const { summary, doctorStats, receptionistStats, labStats, revenueTrend } = reportData || {};

    const trendOption = {
        title: { text: 'Revenue Trend', left: 'center', textStyle: { color: '#374151', fontSize: 16 } },
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: revenueTrend?.map(t => t.date) || []
        },
        yAxis: { type: 'value' },
        series: [
            {
                data: revenueTrend?.map(t => t.revenue) || [],
                type: 'line',
                smooth: true,
                areaStyle: { color: 'rgba(59, 130, 246, 0.2)' },
                lineStyle: { color: '#3b82f6', width: 3 },
                itemStyle: { color: '#3b82f6' }
            }
        ],
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
    };

    return (
        <div className="p-6 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Comprehensive Reports</h1>
                    <p className="text-slate-500">Track staff performance and revenue metrics.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-5 py-2 bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-700 font-bold transition-all shadow-sm cursor-pointer"
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Last 7 Days</option>
                        <option value="monthly">Last 30 Days</option>
                        <option value="custom">Custom Date Range</option>
                    </select>

                    {filter === 'custom' && (
                        <div className="flex flex-wrap items-center gap-2">
                            <DatePicker
                                value={customDates.start}
                                onChange={(val) => setCustomDates({ ...customDates, start: val })}
                                placeholder="Start Date"
                                className="w-[160px]"
                            />
                            <DatePicker
                                value={customDates.end}
                                onChange={(val) => setCustomDates({ ...customDates, end: val })}
                                placeholder="End Date"
                                className="w-[160px]"
                            />
                            <button
                                onClick={handleCustomDateApply}
                                className="bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
                            >
                                Apply
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleExport}
                        className="flex items-center space-x-2 bg-teal-600 text-white px-6 py-2 rounded-full font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                        <Download size={18} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-emerald-100 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">Rs {summary?.totalRevenue?.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                            <Banknote size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 border border-blue-100 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Appointments</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{summary?.totalAppointments}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <CalendarCheck size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 border border-teal-100 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">New Patients</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{summary?.totalPatientsRegistered}</p>
                        </div>
                        <div className="p-3 bg-teal-50 rounded-xl text-teal-600">
                            <Users size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 border border-amber-100 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Lab Tests</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{summary?.totalLabTests}</p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                            <TestTubes size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-100 mb-8">
                <ReactECharts option={trendOption} style={{ height: '350px' }} />
            </div>

            {/* Performance Tables */}
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                {/* Doctors */}
                <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
                    <div className="bg-slate-50 px-4 py-4 border-b border-teal-100">
                        <h3 className="text-slate-900 font-bold">Doctor Performance</h3>
                    </div>
                    <div className="p-0 max-h-80 overflow-y-auto overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[300px]">
                            <thead>
                                <tr className="bg-slate-100/50 text-slate-600 text-sm border-b border-slate-100">
                                    <th className="py-3 px-4 font-medium">Doctor</th>
                                    <th className="py-3 px-4 font-medium text-center">Appointments</th>
                                    <th className="py-3 px-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                                {doctorStats?.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-3 px-4 font-medium">{doc.name}</td>
                                        <td className="py-3 px-4 text-center font-bold text-teal-600">{doc.appointmentsHandled}</td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                onClick={() => setSelectedRowDetails({ type: 'doctor', data: doc })}
                                                className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-full hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all shadow-sm"
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(!doctorStats || doctorStats.length === 0) && (
                                    <tr>
                                        <td colSpan="3" className="py-6 text-center text-slate-500">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Receptionists */}
                <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
                    <div className="bg-slate-50 px-4 py-4 border-b border-teal-100">
                        <h3 className="text-slate-900 font-bold">Receptionist Performance</h3>
                    </div>
                    <div className="p-0 max-h-80 overflow-y-auto overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[350px]">
                            <thead>
                                <tr className="bg-slate-100/50 text-slate-600 text-sm border-b border-slate-100">
                                    <th className="py-3 px-4 font-medium">Name</th>
                                    <th className="py-3 px-4 font-medium text-center">Pts Reg.</th>
                                    <th className="py-3 px-4 font-medium text-center">Appts Bkd.</th>
                                    <th className="py-3 px-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                                {receptionistStats?.map((rec) => (
                                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-3 px-4 font-medium">{rec.name}</td>
                                        <td className="py-3 px-4 text-center font-bold text-teal-600">{rec.patientsRegistered}</td>
                                        <td className="py-3 px-4 text-center font-bold text-teal-600">{rec.appointmentsBooked}</td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                onClick={() => setSelectedRowDetails({ type: 'receptionist', data: rec })}
                                                className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-full hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all shadow-sm"
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(!receptionistStats || receptionistStats.length === 0) && (
                                    <tr>
                                        <td colSpan="4" className="py-6 text-center text-slate-500">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Lab Technicians */}
                <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
                    <div className="bg-slate-50 px-4 py-4 border-b border-teal-100">
                        <h3 className="text-slate-900 font-bold">Lab Technician Performance</h3>
                    </div>
                    <div className="p-0 max-h-80 overflow-y-auto overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[300px]">
                            <thead>
                                <tr className="bg-slate-100/50 text-slate-600 text-sm border-b border-slate-100">
                                    <th className="py-3 px-4 font-medium">Name</th>
                                    <th className="py-3 px-4 font-medium text-center">Tests Conducted</th>
                                    <th className="py-3 px-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                                {labStats?.map((lab) => (
                                    <tr key={lab.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-3 px-4 font-medium">{lab.name}</td>
                                        <td className="py-3 px-4 text-center font-bold text-teal-600">{lab.testsConducted}</td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                onClick={() => setSelectedRowDetails({ type: 'labTech', data: lab })}
                                                className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-full hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all shadow-sm"
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(!labStats || labStats.length === 0) && (
                                    <tr>
                                        <td colSpan="3" className="py-6 text-center text-slate-500">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Modal for Details */}
            {selectedRowDetails && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-xl border border-teal-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">
                                {selectedRowDetails.type === 'doctor' && `${selectedRowDetails.data.name} - Handled Appointments`}
                                {selectedRowDetails.type === 'receptionist' && `${selectedRowDetails.data.name} - Performance Details`}
                                {selectedRowDetails.type === 'labTech' && `${selectedRowDetails.data.name} - Conducted Lab Tests`}
                            </h2>
                            <button onClick={() => setSelectedRowDetails(null)} className="text-slate-400 hover:text-rose-500 transition-colors font-bold text-2xl leading-none">&times;</button>
                        </div>

                        {/* Doctor Details */}
                        {selectedRowDetails.type === 'doctor' && (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-100/50 text-slate-600 text-sm border-b border-slate-100">
                                        <th className="p-3 font-medium">Date</th>
                                        <th className="p-3 font-medium">Time</th>
                                        <th className="p-3 font-medium">Patient</th>
                                        <th className="p-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                                    {selectedRowDetails.data.details?.map(appt => (
                                        <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-3">{new Date(appt.date).toLocaleDateString()}</td>
                                            <td className="p-3">{appt.time}</td>
                                            <td className="p-3">{appt.patient?.name || appt.patientId}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${appt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {appt.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {!selectedRowDetails.data.details?.length && (
                                        <tr><td colSpan="4" className="p-6 text-center text-slate-500">No appointments found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}

                        {/* Receptionist Details */}
                        {selectedRowDetails.type === 'receptionist' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-slate-800 bg-slate-50 border border-slate-100 p-3 rounded-xl shadow-sm mb-3">Registered Patients</h3>
                                    <div className="border border-slate-100 rounded-xl overflow-hidden">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-100/50 text-slate-600 text-sm border-b border-slate-100">
                                                    <th className="p-3 font-medium">Registration Date</th>
                                                    <th className="p-3 font-medium">Patient Name</th>
                                                    <th className="p-3 font-medium">MR Number</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                                                {selectedRowDetails.data.registeredDetails?.map(pt => (
                                                    <tr key={pt.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="p-3">{new Date(pt.createdAt).toLocaleDateString()}</td>
                                                        <td className="p-3 font-medium">{pt.name}</td>
                                                        <td className="p-3 text-slate-500 font-mono text-xs">{pt.mrNumber}</td>
                                                    </tr>
                                                ))}
                                                {!selectedRowDetails.data.registeredDetails?.length && (
                                                    <tr><td colSpan="3" className="p-6 text-center text-slate-500">No patients registered in this period.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-800 bg-slate-50 border border-slate-100 p-3 rounded-xl shadow-sm mb-3">Booked Appointments</h3>
                                    <div className="border border-slate-100 rounded-xl overflow-hidden">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-100/50 text-slate-600 text-sm border-b border-slate-100">
                                                    <th className="p-3 font-medium">Date</th>
                                                    <th className="p-3 font-medium">Time</th>
                                                    <th className="p-3 font-medium">Doctor</th>
                                                    <th className="p-3 font-medium">Patient</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                                                {selectedRowDetails.data.bookedDetails?.map(appt => (
                                                    <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="p-3">{new Date(appt.date).toLocaleDateString()}</td>
                                                        <td className="p-3">{appt.time}</td>
                                                        <td className="p-3">{appt.doctor?.name || appt.doctorId}</td>
                                                        <td className="p-3">{appt.patient?.name || appt.patientId}</td>
                                                    </tr>
                                                ))}
                                                {!selectedRowDetails.data.bookedDetails?.length && (
                                                    <tr><td colSpan="4" className="p-6 text-center text-slate-500">No appointments booked in this period.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Lab Tech Details */}
                        {selectedRowDetails.type === 'labTech' && (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-100/50 text-slate-600 text-sm border-b border-slate-100">
                                        <th className="p-3 font-medium">Date</th>
                                        <th className="p-3 font-medium">Patient</th>
                                        <th className="p-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                                    {selectedRowDetails.data.details?.map(test => (
                                        <tr key={test.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-3">{new Date(test.createdAt).toLocaleDateString()}</td>
                                            <td className="p-3">{test.patient?.name || test.patientId}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${test.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {test.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {!selectedRowDetails.data.details?.length && (
                                        <tr><td colSpan="3" className="p-6 text-center text-slate-500">No lab tests conducted.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;

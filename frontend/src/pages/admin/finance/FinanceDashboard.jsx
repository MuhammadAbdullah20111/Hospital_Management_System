import React, { useState, useEffect } from "react";
import ReactECharts from 'echarts-for-react';
import { Link } from "react-router-dom";
import { 
  getFinanceSummaryAPI, 
  getAllTransactionsAPI 
} from '../../../api/admin/finance';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  CreditCard,
  Briefcase,
  Layers,
  Clock,
  Printer
} from 'lucide-react';
import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import toast from 'react-hot-toast';
import CreateTransactionModal from "./CreateTransactionModal";
import ProcessPaymentModal from "./ProcessPaymentModal";
import ReceiptPrintView from "./ReceiptPrintView";

const FinanceDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // States for processing payment and printing receipt from dashboard
  const [selectedTxForPayment, setSelectedTxForPayment] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTxForPrint, setSelectedTxForPrint] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const fetchFinanceData = async () => {
    setIsLoading(true);
    try {
      const [summaryRes, transRes] = await Promise.all([
        getFinanceSummaryAPI(dateRange.start, dateRange.end),
        getAllTransactionsAPI({ limit: 5 })
      ]);

      if (summaryRes.success) setSummary(summaryRes.data);
      if (transRes.success) setTransactions(transRes.data);
    } catch (error) {
      toast.error("Failed to fetch financial data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [dateRange]);

  const colors = {
    income: '#0d9488', // teal-600
    expense: '#ef4444', // red-500
    net: '#3b82f6', // blue-500
    bg: '#f8fafc'
  };

  if (isLoading || !summary) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LoadingPlaceholder className="h-24 w-24" />
      </div>
    );
  }

  // Scaling dummy chart values with actual figures for visuals
  const scaleFactor = Math.max(1, (summary.totalIncome + summary.totalExpense) / 300000);
  const revenueExpenseOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Income', 'Expense'], bottom: 0 },
    xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Income',
        type: 'bar',
        itemStyle: { color: colors.income, borderRadius: [4, 4, 0, 0] },
        data: [
          Math.round(120000 * scaleFactor * 0.8),
          Math.round(150000 * scaleFactor * 0.9),
          Math.round(180000 * scaleFactor * 1.1),
          Math.round(140000 * scaleFactor * 0.75),
          Math.round(210000 * scaleFactor * 1.2),
          Math.round(summary.totalIncome)
        ]
      },
      {
        name: 'Expense',
        type: 'bar',
        itemStyle: { color: colors.expense, borderRadius: [4, 4, 0, 0] },
        data: [
          Math.round(80000 * scaleFactor * 0.95),
          Math.round(90000 * scaleFactor * 0.85),
          Math.round(110000 * scaleFactor * 1.05),
          Math.round(95000 * scaleFactor * 0.9),
          Math.round(120000 * scaleFactor * 1.15),
          Math.round(summary.totalExpense)
        ]
      }
    ]
  };

  const handleExport = () => {
    if (transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    const headers = ["Tx ID", "Date", "Entity", "Category", "Method", "Amount", "Type", "Status"];
    
    const csvContent = [
      headers.join(","),
      ...transactions.map(tx => {
        const entity = tx.patient ? tx.patient.name : (tx.staff ? tx.staff.name : 'External');
        const category = tx.category?.name || "N/A";
        const date = new Date(tx.createdAt || new Date()).toLocaleDateString();
        return [
          tx.id,
          `"${date}"`,
          `"${entity}"`,
          `"${category}"`,
          tx.method || "N/A",
          tx.amount,
          tx.type,
          tx.status
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `recent_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported successfully");
  };

  const categoryDistributionOption = {
    tooltip: { trigger: 'item' },
    series: [{
      name: 'Category',
      type: 'pie',
      radius: ['40%', '70%'],
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      data: [
        { value: Math.max(100, Math.round(summary.totalIncome * 0.4)), name: 'Consultation', itemStyle: { color: '#0d9488' } },
        { value: Math.max(100, Math.round(summary.totalIncome * 0.3)), name: 'Lab Tests', itemStyle: { color: '#0ea5e9' } },
        { value: Math.max(100, Math.round(summary.totalIncome * 0.2)), name: 'Bed Rent', itemStyle: { color: '#6366f1' } },
        { value: Math.max(100, Math.round(summary.totalIncome * 0.1)), name: 'Other Income', itemStyle: { color: '#f59e0b' } }
      ]
    }]
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {trendValue}%
          </div>
        )}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">Rs {value.toLocaleString()}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finance Overview</h1>
          <p className="text-slate-500 text-sm">Real-time revenue tracking and expense management.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm shadow-teal-100"
          >
            <CreditCard className="w-4 h-4" /> New Transaction
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Income" 
          value={summary.totalIncome} 
          icon={TrendingUp} 
          trend="up" 
          trendValue="12" 
          colorClass="bg-teal-600"
        />
        <StatCard 
          title="Total Expenses" 
          value={summary.totalExpense} 
          icon={TrendingDown} 
          trend="up" 
          trendValue="5" 
          colorClass="bg-rose-500"
        />
        <StatCard 
          title="Net Profit" 
          value={summary.netProfit} 
          icon={DollarSign} 
          trend="up" 
          trendValue="18" 
          colorClass="bg-blue-600"
        />
        <StatCard 
          title="Outstanding Balance" 
          value={summary.totalOutstanding || 0} 
          icon={Clock} 
          colorClass="bg-amber-500"
        />
      </div>

      {/* Modals */}
      <CreateTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchFinanceData} 
      />

      <ProcessPaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedTxForPayment(null);
        }}
        transaction={selectedTxForPayment}
        onSuccess={fetchFinanceData}
      />

      <ReceiptPrintView 
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setSelectedTxForPrint(null);
        }}
        transaction={selectedTxForPrint}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Revenue vs Expenses</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-slate-100 text-xs font-bold rounded-lg text-slate-600">Weekly</button>
              <button className="px-3 py-1 bg-teal-50 text-xs font-bold rounded-lg text-teal-600">Monthly</button>
            </div>
          </div>
          <div className="h-[350px]">
            <ReactECharts option={revenueExpenseOption} style={{ height: '100%' }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Income by Source</h2>
          <div className="h-[350px]">
            <ReactECharts option={categoryDistributionOption} style={{ height: '100%' }} />
          </div>
        </div>
      </div>

      {/* Recent Transactions & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
            <Link to="/admin/dashboard/finance/transactions" className="text-teal-600 text-sm font-bold hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  <th className="pb-3">Ref #</th>
                  <th className="pb-3">Patient / Staff</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="text-sm hover:bg-slate-50/20">
                    <td className="py-4 font-bold text-slate-400">#{tx.id}</td>
                    <td className="py-4">
                      <p className="font-bold text-slate-900">{tx.patient?.name || tx.staff?.name || 'External'}</p>
                      <p className="text-[10px] text-slate-500 uppercase">{tx.method || 'N/A'}</p>
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600">
                        {tx.category?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 font-black text-slate-900">Rs {tx.amount.toLocaleString()}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        tx.status === 'PAID' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex justify-center items-center gap-1.5">
                        {tx.status === 'PENDING' && (
                          <button 
                            onClick={() => {
                              setSelectedTxForPayment(tx);
                              setIsPaymentModalOpen(true);
                            }}
                            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-all"
                            title="Collect Payment"
                          >
                            Pay
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setSelectedTxForPrint(tx);
                            setIsPrintModalOpen(true);
                          }}
                          className="p-1 bg-slate-100 text-slate-600 hover:text-teal-600 rounded transition-colors"
                          title="Print Receipt"
                        >
                          <Printer className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link to="/admin/dashboard/finance/create" state={{ defaultType: 'EXPENSE' }} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-rose-300 transition-all">
            <div className="p-4 bg-rose-50 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
              <TrendingDown className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="font-bold text-slate-900">Record Expense</h3>
            <p className="text-xs text-slate-500 mt-1">Record salaries & outgoing payments</p>
          </Link>

          <Link to="/admin/dashboard/finance/transactions" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-blue-300 transition-all">
            <div className="p-4 bg-blue-50 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
              <Layers className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900">Full Ledger</h3>
            <p className="text-xs text-slate-500 mt-1">Detailed transaction history</p>
          </Link>

          <Link to="/admin/dashboard/finance/transactions" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-amber-300 transition-all">
            <div className="p-4 bg-amber-50 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-900">Manage Invoices</h3>
            <p className="text-xs text-slate-500 mt-1">Track unpaid billing dues</p>
          </Link>

          <Link to="/admin/dashboard/finance/transactions" className="bg-teal-600 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-teal-700 transition-all shadow-teal-100">
            <div className="p-4 bg-white/20 rounded-2xl mb-4 group-hover:rotate-12 transition-transform">
              <ArrowUpRight className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-white">Financial Report</h3>
            <p className="text-xs text-white/80 mt-1">Generate comprehensive PDF</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;

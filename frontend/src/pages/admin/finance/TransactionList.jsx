import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllTransactionsAPI, getTransactionCategoriesAPI } from "../../../api/admin/finance";
import {
  ArrowUpRight,
  ArrowDownRight,
  Download,
  PlusCircle,
  Printer,
  CreditCard
} from "lucide-react";
import ListComponent from "../../../components/dashboard/ListComponent";
import DataTable from "../../../components/dashboard/DataTable";
import ThermalReceiptPrintView from "./ThermalReceiptPrintView";
import toast from "react-hot-toast";
import SearchableSelect from "../../../components/ui/SearchableSelect";
import DatePicker from "../../../components/ui/DatePicker";

import { getFromLocalStorage } from "../../../helpers/localStorageFile";

const TransactionList = () => {
  const navigate = useNavigate();
  
  const role = (getFromLocalStorage('role') || localStorage.getItem('role'))?.toUpperCase();
  const userType = getFromLocalStorage('userType') || localStorage.getItem('userType');
  const isAdmin = role === 'ADMIN' || userType === 'SYSTEM_ADMIN';
  const permissions = JSON.parse(getFromLocalStorage('permissions') || localStorage.getItem('permissions') || '[]');
  const canCreate = isAdmin || permissions.includes('create-finance') || permissions.includes('create-payment');

  // Detect context so paths work for both admin and staff
  const basePath = userType === 'SYSTEM_ADMIN' ? '/admin/dashboard/finance' : '/staff/finance';
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    categoryId: "",
    startDate: "",
    endDate: "",
  });

  // Only the print receipt still uses a lightweight overlay (it's view-only, like a receipt popup)
  const [selectedTxForPrint, setSelectedTxForPrint] = useState(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const [transRes, catRes] = await Promise.all([
        getAllTransactionsAPI(filters),
        getTransactionCategoriesAPI(),
      ]);
      if (transRes.success) setTransactions(transRes.data);
      if (catRes.success) setCategories(catRes.data);
    } catch {
      toast.error("Failed to fetch transactions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters.type, filters.categoryId, filters.startDate, filters.endDate]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Client-side search + tab filter
  const filteredTransactions = transactions.filter((tx) => {
    const matchesTab = activeTab === "ALL" || tx.status === activeTab;
    const lc = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      tx.patient?.name?.toLowerCase().includes(lc) ||
      tx.patient?.mrNumber?.toLowerCase().includes(lc) ||
      tx.staff?.name?.toLowerCase().includes(lc) ||
      tx.referenceNumber?.toLowerCase().includes(lc) ||
      String(tx.id).includes(lc);
    return matchesTab && matchesSearch;
  });

  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    const headers = ["Tx ID", "Date", "Entity", "Category", "Method", "Amount", "Type", "Status"];
    
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map(tx => {
        const entity = tx.patient ? tx.patient.name : (tx.staff ? tx.staff.name : 'External');
        const category = tx.category?.name || "N/A";
        const date = new Date(tx.createdAt).toLocaleDateString();
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
    link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported successfully");
  };

  const columns = [
    {
      header: "Tx ID",
      render: (tx) => (
        <span className="text-xs font-mono font-bold text-slate-400">#{tx.id}</span>
      ),
    },
    {
      header: "Date",
      render: (tx) => (
        <div>
          <p className="text-sm font-medium text-slate-900">
            {new Date(tx.createdAt).toLocaleDateString()}
          </p>
          <p className="text-[10px] text-slate-400">
            {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      ),
    },
    {
      header: "Entity",
      render: (tx) =>
        tx.patient ? (
          <div className="space-y-1">
            <p className="text-sm font-bold text-teal-700">{tx.patient.name}</p>
            <p className="text-[10px] text-slate-400">MR: {tx.patient.mrNumber}</p>
            <div className="flex flex-wrap gap-1">
              {tx.appointment && (
                <span className="inline-block px-1.5 py-0.5 bg-sky-50 text-sky-700 border border-sky-100 rounded text-[9px] font-bold">
                  Appt #{tx.appointmentId} {tx.appointment.doctor ? `(Dr. ${tx.appointment.doctor.name})` : ''}
                </span>
              )}
              {tx.labTest && (
                <span className="inline-block px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded text-[9px] font-bold">
                  Test: {tx.labTest.testName}
                </span>
              )}
              {tx.bedAssignment && (
                <span className="inline-block px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[9px] font-bold">
                  Bed: {tx.bedAssignment.bed?.bedNumber || `Bed ${tx.bedAssignment.bedId}`}
                </span>
              )}
            </div>
          </div>
        ) : tx.staff ? (
          <div>
            <p className="text-sm font-bold text-blue-600">{tx.staff.name}</p>
            <p className="text-[10px] text-slate-400">Staff ID: {tx.staffId}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-400">External</p>
        ),
    },
    {
      header: "Category",
      render: (tx) => (
        <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 whitespace-nowrap">
          {tx.category?.name || "N/A"}
        </span>
      ),
    },
    {
      header: "Method",
      render: (tx) => (
        <p className="text-xs font-bold text-slate-600 uppercase">{tx.method || "N/A"}</p>
      ),
    },
    {
      header: "Amount",
      render: (tx) => (
        <p className={`text-sm font-black whitespace-nowrap ${tx.type === "INCOME" ? "text-teal-600" : "text-rose-600"}`}>
          {tx.type === "INCOME" ? "+" : "−"} Rs {tx.amount.toLocaleString()}
        </p>
      ),
    },
    {
      header: "Type",
      render: (tx) => (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${tx.type === "INCOME" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
          {tx.type === "INCOME" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {tx.type}
        </div>
      ),
    },
    {
      header: "Status",
      render: (tx) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
          tx.status === "PAID"
            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
            : tx.status === "PENDING"
            ? "bg-amber-50 text-amber-600 border-amber-100"
            : "bg-rose-50 text-rose-600 border-rose-100"
        }`}>
          {tx.status}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (tx) => (
        <div className="flex items-center gap-2">
          {tx.status === "PENDING" && canCreate && (
            <button
              onClick={() => navigate(`${basePath}/pay/${tx.id}`)}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
              title="Collect Payment"
            >
              <CreditCard className="w-3 h-3" /> Pay Now
            </button>
          )}
          <button
            onClick={() => { setSelectedTxForPrint(tx); setIsPrintOpen(true); }}
            className="p-1.5 bg-slate-50 border border-slate-200 text-slate-600 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Print Receipt / Invoice"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      {/* Standard ListComponent header */}
      <ListComponent
        title="Financial Ledger"
        description="View, audit, and manage all hospital transactions."
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onAdd={canCreate ? () => navigate(`${basePath}/create`) : null}
        addButtonText="New Transaction"
      >
        {/* Extra filter controls in the search bar row */}
        <div className="w-44">
          <SearchableSelect
            value={filters.type}
            onChange={(val) => setFilters((prev) => ({ ...prev, type: val }))}
            options={[
              { value: "INCOME", label: "Income" },
              { value: "EXPENSE", label: "Expense" }
            ]}
            placeholder="All Types"
            searchable={false}
          />
        </div>

        <div className="w-48">
          <SearchableSelect
            value={filters.categoryId}
            onChange={(val) => setFilters((prev) => ({ ...prev, categoryId: val }))}
            options={categories.map((cat) => ({ value: String(cat.id), label: cat.name }))}
            placeholder="All Categories"
            searchable={true}
          />
        </div>

        <div className="flex items-center gap-1">
          <div className="w-40">
            <DatePicker
              value={filters.startDate}
              onChange={(val) => setFilters((prev) => ({ ...prev, startDate: val }))}
              placeholder="Start Date"
            />
          </div>
          <span className="text-slate-400 text-xs font-bold">—</span>
          <div className="w-40">
            <DatePicker
              value={filters.endDate}
              onChange={(val) => setFilters((prev) => ({ ...prev, endDate: val }))}
              placeholder="End Date"
            />
          </div>
        </div>

        <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors whitespace-nowrap">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </ListComponent>

      {/* Status tabs */}
      <div className="flex border-b border-slate-200 gap-6 mb-4">
        {[
          { key: "ALL", label: "All", color: "teal" },
          { key: "PAID", label: "Paid", color: "emerald" },
          { key: "PENDING", label: "Unpaid / Pending", color: "amber" },
        ].map(({ key, label, color }) => {
          const count =
            key === "ALL"
              ? transactions.length
              : transactions.filter((t) => t.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`pb-3 text-sm font-bold transition-all relative ${
                activeTab === key ? `text-${color}-600` : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {label} ({count})
              {activeTab === key && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${color}-600 rounded-full`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Receipt print overlay — thermal style */}
      <ThermalReceiptPrintView
        isOpen={isPrintOpen}
        onClose={() => { setIsPrintOpen(false); setSelectedTxForPrint(null); }}
        transaction={selectedTxForPrint}
      />

      {/* Consistent DataTable */}
      <DataTable
        columns={columns}
        data={filteredTransactions}
        isLoading={isLoading}
        emptyMessage="No transactions found matching your criteria."
        onRowClick={(tx) => { setSelectedTxForPrint(tx); setIsPrintOpen(true); }}
      />

      {!isLoading && (
        <p className="text-xs text-slate-400 font-medium mt-3 text-right">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </p>
      )}
    </div>
  );
};

export default TransactionList;

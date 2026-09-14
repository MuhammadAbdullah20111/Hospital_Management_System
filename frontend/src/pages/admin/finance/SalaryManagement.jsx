import React, { useState, useEffect } from "react";
import { getSalaryConfigsAPI, updateSalaryConfigAPI, generatePayrollAPI } from "../../../api/admin/finance";
import { 
  Users, 
  DollarSign, 
  Settings, 
  Play, 
  CheckCircle,
  AlertCircle,
  Plus,
  Minus
} from "lucide-react";
import LoadingPlaceholder from "../../../components/ui/LoadingPlaceholder";
import toast from "react-hot-toast";

const SalaryManagement = () => {
  const [configs, setConfigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);

  const fetchConfigs = async () => {
    setIsLoading(true);
    try {
      const res = await getSalaryConfigsAPI();
      if (res.success) setConfigs(res.data);
    } catch (error) {
      toast.error("Failed to fetch salary configurations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleUpdateConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await updateSalaryConfigAPI(editingConfig.staffId, editingConfig);
      if (res.success) {
        toast.success("Salary updated successfully");
        setEditingConfig(null);
        fetchConfigs();
      }
    } catch (error) {
      toast.error("Failed to update salary");
    }
  };

  const handleGeneratePayroll = async () => {
    const month = new Date().toLocaleString('default', { month: 'long' });
    const year = new Date().getFullYear();

    if (!window.confirm(`Are you sure you want to generate payroll for ${month} ${year}? This will create expense transactions for all configured staff.`)) {
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generatePayrollAPI({ month, year });
      if (res.success) {
        toast.success(`Payroll generated for ${month} ${year}`);
      }
    } catch (error) {
      toast.error("Failed to generate payroll");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) return <LoadingPlaceholder className="h-64" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Staff Payroll Management</h1>
          <p className="text-sm text-slate-500">Configure base pay and generate monthly salaries</p>
        </div>
        <button 
          onClick={handleGeneratePayroll}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 disabled:opacity-50"
        >
          {isGenerating ? "Processing..." : <><Play className="w-4 h-4 fill-current" /> Run Monthly Payroll</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">Staff Member</th>
                  <th className="px-6 py-4">Base Salary</th>
                  <th className="px-6 py-4">Net Salary</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {configs.map((config) => (
                  <tr key={config.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold">
                          {config.staff.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{config.staff.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                            {config.staff.role?.name || "STAFF"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-600">Rs {config.baseSalary.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-teal-600">Rs {config.netSalary.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setEditingConfig(config)}
                        className="p-2 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Editor Sidebar */}
        <div className="space-y-6">
          {editingConfig ? (
            <div className="bg-white p-6 rounded-2xl border-2 border-teal-500 shadow-xl animate-in slide-in-from-right duration-300">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-teal-600" />
                Configure Salary
              </h2>
              <div className="mb-6 p-3 bg-teal-50 rounded-xl">
                <p className="text-xs text-teal-600 font-bold uppercase mb-1">Editing For</p>
                <p className="text-sm font-bold text-teal-900">{editingConfig.staff.name}</p>
              </div>

              <form onSubmit={handleUpdateConfig} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Base Salary</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="number"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold"
                      value={editingConfig.baseSalary}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setEditingConfig(prev => ({ 
                          ...prev, 
                          baseSalary: val,
                          netSalary: val + prev.allowances - prev.deductions
                        }));
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-emerald-600 uppercase mb-1 flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Allowances
                    </label>
                    <input 
                      type="number"
                      className="w-full px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-sm font-bold text-emerald-700"
                      value={editingConfig.allowances}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setEditingConfig(prev => ({ 
                          ...prev, 
                          allowances: val,
                          netSalary: prev.baseSalary + val - prev.deductions
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-rose-600 uppercase mb-1 flex items-center gap-1">
                      <Minus className="w-3 h-3" /> Deductions
                    </label>
                    <input 
                      type="number"
                      className="w-full px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl text-sm font-bold text-rose-700"
                      value={editingConfig.deductions}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setEditingConfig(prev => ({ 
                          ...prev, 
                          deductions: val,
                          netSalary: prev.baseSalary + prev.allowances - val
                        }));
                      }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Final Monthly Net Pay</p>
                  <p className="text-xl font-bold text-white">Rs {editingConfig.netSalary.toLocaleString()}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => setEditingConfig(null)}
                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-100"
                  >
                    Save Config
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-slate-50 p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <AlertCircle className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-400">No Selection</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Select a staff member from the list to configure their salary structure.</p>
            </div>
          )}

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> 
              Payroll Guidelines
            </h4>
            <ul className="text-xs text-blue-700 space-y-2 list-disc list-inside font-medium">
              <li>Payroll can only be run once per month.</li>
              <li>Ensure all allowances and deductions are updated before running.</li>
              <li>Completed payroll generates transactions in the ledger.</li>
              <li>Bank transfers are initiated based on these records.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryManagement;

import React, { useState, useEffect } from 'react';
import { X, Search, DollarSign, CreditCard, User, Layers, FileText, ArrowDownCircle, ArrowUpCircle, Link } from 'lucide-react';
import { createTransactionAPI, getTransactionCategoriesAPI } from '../../../api/admin/finance';
import { getAllPatientsAPI, getPatientByIdAPI } from '../../../api/admin/patients';
import { getAllStaffAPI } from '../../../api/admin/staff';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import toast from 'react-hot-toast';

const CreateTransactionModal = ({ isOpen, onClose, onSuccess }) => {
  const [allCategories, setAllCategories] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPatientData, setSelectedPatientData] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    amount: '',
    type: 'INCOME',
    method: 'CASH',
    status: 'PAID',
    categoryId: '',
    patientId: '',
    staffId: '',
    appointmentId: '',
    labTestId: '',
    bedAssignmentId: '',
    notes: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  const [staffList, setStaffList] = useState([]);
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  const [staffSearchResults, setStaffSearchResults] = useState([]);

  const fetchStaffList = async () => {
    try {
      const response = await getAllStaffAPI();
      if (response.success) {
        setStaffList(response.staff || []);
      }
    } catch (error) {
      console.error("Failed to fetch staff list:", error);
    }
  };

  useEffect(() => {
    if (isOpen && formData.type === 'EXPENSE' && staffList.length === 0) {
      fetchStaffList();
    }
  }, [isOpen, formData.type]);

  useEffect(() => {
    if (!isOpen) {
      setStaffSearchTerm('');
      setStaffSearchResults([]);
      setSearchTerm('');
      setSelectedPatientData(null);
      setErrors({});
      setFormData({
        amount: '',
        type: 'INCOME',
        method: 'CASH',
        status: 'PAID',
        categoryId: '',
        patientId: '',
        staffId: '',
        appointmentId: '',
        labTestId: '',
        bedAssignmentId: '',
        notes: ''
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await getTransactionCategoriesAPI();
      if (response.success) {
        setAllCategories(response.data);
      }
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  // Filter categories dynamically based on selected transaction type (INCOME or EXPENSE)
  const filteredCategories = allCategories.filter(c => c.type === formData.type);

  // Auto-select first category in list when type changes
  useEffect(() => {
    if (filteredCategories.length > 0) {
      setFormData(prev => ({ ...prev, categoryId: filteredCategories[0].id.toString() }));
    } else {
      setFormData(prev => ({ ...prev, categoryId: '' }));
    }
  }, [formData.type, allCategories]);

  const handlePatientSearch = async (val) => {
    setSearchTerm(val);
    if (val.length > 2) {
      try {
        const response = await getAllPatientsAPI();
        if (response.success) {
          const filtered = response.patients.filter(p => 
            p.name.toLowerCase().includes(val.toLowerCase()) || 
            p.mrNumber.toLowerCase().includes(val.toLowerCase())
          );
          setPatients(filtered);
        }
      } catch (error) {
        console.error("Search failed");
      }
    } else {
      setPatients([]);
    }
  };

  const fetchPatientDetails = async (patientId) => {
    try {
      const res = await getPatientByIdAPI(patientId);
      if (res.success) {
        setSelectedPatientData(res.patient);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load patient appointments & billing items");
    }
  };

  const handleLinkChange = (linkType, val) => {
    if (!val) {
      setFormData(prev => ({
        ...prev,
        [`${linkType}Id`]: '',
        amount: prev[`${linkType}Id`] ? '' : prev.amount,
        notes: prev[`${linkType}Id`] ? '' : prev.notes
      }));
      return;
    }

    const numVal = parseInt(val);

    if (linkType === 'appointment') {
      const appt = selectedPatientData?.appointments?.find(a => a.id === numVal);
      const apptCat = allCategories.find(c => c.name.toLowerCase().includes('appointment') || c.name.toLowerCase().includes('consultation'));
      setFormData(prev => ({
        ...prev,
        appointmentId: val,
        labTestId: '',
        bedAssignmentId: '',
        categoryId: apptCat ? apptCat.id.toString() : prev.categoryId,
        amount: appt?.doctor?.consultationFee ? appt.doctor.consultationFee.toString() : prev.amount,
        notes: appt ? `Consultation fee for Appointment #${appt.id} with Dr. ${appt.doctor?.name || 'Doctor'}` : prev.notes
      }));
    } else if (linkType === 'labTest') {
      const lt = selectedPatientData?.labTests?.find(l => l.id === numVal);
      const labCat = allCategories.find(c => c.name.toLowerCase().includes('lab'));
      setFormData(prev => ({
        ...prev,
        labTestId: val,
        appointmentId: '',
        bedAssignmentId: '',
        categoryId: labCat ? labCat.id.toString() : prev.categoryId,
        amount: lt?.test?.price ? lt.test.price.toString() : prev.amount,
        notes: lt ? `Lab Test fee for ${lt.testName} (Lab Test #${lt.id})` : prev.notes
      }));
    } else if (linkType === 'bedAssignment') {
      const ba = selectedPatientData?.bedAssignments?.find(b => b.id === numVal);
      const bedCat = allCategories.find(c => c.name.toLowerCase().includes('bed') || c.name.toLowerCase().includes('rent'));
      setFormData(prev => ({
        ...prev,
        bedAssignmentId: val,
        appointmentId: '',
        labTestId: '',
        categoryId: bedCat ? bedCat.id.toString() : prev.categoryId,
        amount: ba ? (ba.totalBill || ba.bed?.room?.category?.pricePerDay || 1000).toString() : prev.amount,
        notes: ba ? `Bed Rent for Bed ${ba.bed?.bedNumber || ba.bedId} (Assignment #${ba.id})` : prev.notes
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.amount) newErrors.amount = "Amount is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill required fields");
      return;
    }
    setErrors({});

    setIsSubmitting(true);
    try {
      const response = await createTransactionAPI({
        ...formData,
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId),
        patientId: formData.patientId ? parseInt(formData.patientId) : undefined,
        staffId: formData.staffId ? parseInt(formData.staffId) : undefined,
        appointmentId: formData.appointmentId ? parseInt(formData.appointmentId) : undefined,
        labTestId: formData.labTestId ? parseInt(formData.labTestId) : undefined,
        bedAssignmentId: formData.bedAssignmentId ? parseInt(formData.bedAssignmentId) : undefined,
      });

      if (response.success) {
        toast.success("Transaction recorded successfully");
        onSuccess();
        onClose();
        setFormData({
          amount: '',
          type: 'INCOME',
          method: 'CASH',
          status: 'PAID',
          categoryId: filteredCategories[0]?.id?.toString() || '',
          patientId: '',
          staffId: '',
          appointmentId: '',
          labTestId: '',
          bedAssignmentId: '',
          notes: ''
        });
        setSelectedPatientData(null);
        setSearchTerm('');
        setStaffSearchTerm('');
        setStaffSearchResults([]);
      }
    } catch (error) {
      toast.error(error.message || "Failed to record transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between transition-colors ${
          formData.type === 'INCOME' ? 'bg-teal-600' : 'bg-rose-600'
        }`}>
          <div className="flex items-center gap-2 text-white">
            <div className="p-2 bg-white/20 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">Record Transaction</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Transaction Type Select */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'INCOME' })}
              className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-bold border-2 transition-all ${
                formData.type === 'INCOME' 
                  ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm' 
                  : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <ArrowUpCircle className="w-5 h-5" /> Income
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
              className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-bold border-2 transition-all ${
                formData.type === 'EXPENSE' 
                  ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm' 
                  : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <ArrowDownCircle className="w-5 h-5" /> Expense
            </button>
          </div>

          {/* Amount Field */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
              Amount (PKR)
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs.</div>
              <input 
                type="number"
                placeholder="0.00"
                className={`w-full pl-12 pr-4 py-3 bg-slate-50 border ${errors.amount ? 'border-red-500' : 'border-transparent'} rounded-2xl text-lg font-bold text-slate-900 focus:ring-2 focus:ring-teal-500/20 transition-all`}
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            {errors.amount && <p className="text-xs text-red-500 font-medium mt-1">{errors.amount}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Category */}
            <div>
              <SearchableSelect
                label="Category"
                options={filteredCategories.map(cat => ({ value: cat.id, label: cat.name }))}
                value={formData.categoryId}
                onChange={(val) => setFormData({...formData, categoryId: val})}
                searchable={false}
                placeholder="Select"
              />
              {errors.categoryId && <p className="text-xs text-red-500 font-medium mt-1">{errors.categoryId}</p>}
            </div>

            {/* Method */}
            <div>
              <SearchableSelect
                label="Method"
                options={[
                  { value: 'CASH', label: 'Cash' },
                  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                  { value: 'CARD', label: 'Card' },
                  { value: 'ONLINE', label: 'Online' }
                ]}
                value={formData.method}
                onChange={(val) => setFormData({...formData, method: val})}
                searchable={false}
                placeholder="Select"
              />
            </div>

            {/* Status */}
            <div>
              <SearchableSelect
                label="Status"
                options={[
                  { value: 'PAID', label: 'Paid / Cleared' },
                  { value: 'PENDING', label: 'Pending / Unpaid' }
                ]}
                value={formData.status}
                onChange={(val) => setFormData({...formData, status: val})}
                searchable={false}
                placeholder="Select"
              />
            </div>
          </div>

          {/* Patient Search (Only visible for Incomes) */}
          {formData.type === 'INCOME' && (
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                Patient (Optional Search)
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search patient..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-teal-500/20 transition-all"
                  value={searchTerm}
                  onChange={(e) => handlePatientSearch(e.target.value)}
                />
                
                {patients.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-48 overflow-y-auto">
                    {patients.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            patientId: p.id,
                            appointmentId: '',
                            labTestId: '',
                            bedAssignmentId: ''
                          });
                          setSearchTerm(`${p.name} (${p.mrNumber})`);
                          setPatients([]);
                          fetchPatientDetails(p.id);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-teal-50 text-sm border-b border-slate-50 last:border-none flex justify-between items-center"
                      >
                        <span className="font-bold text-slate-900">{p.name}</span>
                        <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded uppercase">{p.mrNumber}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {formData.patientId && (
                 <div className="mt-2 flex flex-col gap-3">
                   <div className="flex items-center gap-2">
                     <div className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg border border-emerald-100 flex items-center gap-1">
                       <User className="w-3 h-3" /> Selected Patient ID: {formData.patientId}
                     </div>
                     <button 
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          patientId: '',
                          appointmentId: '',
                          labTestId: '',
                          bedAssignmentId: ''
                        });
                        setSearchTerm('');
                        setSelectedPatientData(null);
                      }}
                      className="text-[10px] font-bold text-slate-400 hover:text-rose-600 transition-colors"
                     >
                       Clear Selection
                     </button>
                   </div>

                   {selectedPatientData && (
                     <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl space-y-3 mt-1">
                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                         <Link className="w-3 h-3 text-teal-600" />
                         <span>Link Medical Records</span>
                       </div>
                       
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Link to Appointment */}
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Appointment</label>
                            <SearchableSelect
                              value={formData.appointmentId}
                              onChange={(val) => handleLinkChange('appointment', val)}
                              options={selectedPatientData.appointments?.map(appt => ({
                                value: String(appt.id),
                                label: `Appt #${appt.id} - Dr. ${appt.doctor?.name} (${new Date(appt.date).toLocaleDateString()})`
                              })) || []}
                              placeholder="None"
                              searchable={true}
                            />
                          </div>

                          {/* Link to Lab Test */}
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lab Test</label>
                            <SearchableSelect
                              value={formData.labTestId}
                              onChange={(val) => handleLinkChange('labTest', val)}
                              options={selectedPatientData.labTests?.map(lt => ({
                                value: String(lt.id),
                                label: `Test #${lt.id} - ${lt.testName} (${lt.status})`
                              })) || []}
                              placeholder="None"
                              searchable={true}
                            />
                          </div>

                          {/* Link to Bed Assignment */}
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bed Assignment</label>
                            <SearchableSelect
                              value={formData.bedAssignmentId}
                              onChange={(val) => handleLinkChange('bedAssignment', val)}
                              options={selectedPatientData.bedAssignments?.map(ba => ({
                                value: String(ba.id),
                                label: `Assign #{ba.id} - Bed ${ba.bed?.bedNumber} (${ba.actualDischargeAt ? 'Discharged' : 'Active'})`
                              })) || []}
                              placeholder="None"
                              searchable={true}
                            />
                          </div>
                        </div>
                     </div>
                   )}
                 </div>
              )}
            </div>
          )}

          {/* Staff Search (Only visible for Expenses) */}
          {formData.type === 'EXPENSE' && (
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                Staff Member (Optional Search)
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search staff..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-rose-500/20 transition-all"
                  value={staffSearchTerm}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStaffSearchTerm(val);
                    if (val.length > 1) {
                      setStaffSearchResults(staffList.filter(s =>
                        s.name.toLowerCase().includes(val.toLowerCase()) ||
                        s.email.toLowerCase().includes(val.toLowerCase())
                      ));
                    } else {
                      setStaffSearchResults([]);
                    }
                  }}
                />
                
                {staffSearchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-48 overflow-y-auto">
                    {staffSearchResults.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          const salaryCat = allCategories.find(c => c.name.toLowerCase().includes('salary') && c.type === 'EXPENSE');
                          setFormData({
                            ...formData,
                            staffId: s.id.toString(),
                            patientId: '',
                            appointmentId: '',
                            labTestId: '',
                            bedAssignmentId: '',
                            categoryId: salaryCat ? salaryCat.id.toString() : formData.categoryId,
                            notes: `Salary disbursement for ${s.name}`
                          });
                          setStaffSearchTerm(`${s.name} (${s.email})`);
                          setStaffSearchResults([]);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-rose-50 text-sm border-b border-slate-50 last:border-none flex justify-between items-center"
                      >
                        <span className="font-bold text-slate-900">{s.name}</span>
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded uppercase">{s.role?.name || s.role || 'Staff'}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {formData.staffId && (
                 <div className="mt-2 flex items-center gap-2">
                   <div className="px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-lg border border-rose-100 flex items-center gap-1">
                     <User className="w-3 h-3" /> Selected Staff: {staffSearchTerm}
                   </div>
                   <button 
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        staffId: '',
                        notes: ''
                      });
                      setStaffSearchTerm('');
                    }}
                    className="text-[10px] font-bold text-slate-400 hover:text-rose-600 transition-colors"
                   >
                     Clear Selection
                   </button>
                 </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
              Notes / Description
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
              <textarea 
                placeholder="Enter transaction details..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-teal-500/20 transition-all h-20 resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`flex-2 py-3 px-8 text-white font-bold rounded-2xl transition-all disabled:opacity-50 ${
                formData.type === 'INCOME' 
                  ? 'bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20' 
                  : 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20'
              }`}
            >
              {isSubmitting ? 'Recording...' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTransactionModal;

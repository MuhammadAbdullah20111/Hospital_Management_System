import React from 'react';
import { X, Printer, Heart } from 'lucide-react';

const ReceiptPrintView = ({ isOpen, onClose, transaction }) => {
  if (!isOpen || !transaction) return null;

  const entityName = transaction.patient?.name || transaction.staff?.name || 'External';
  const entityIdLabel = transaction.patient ? 'MR Number' : 'Staff ID';
  const entityIdVal = transaction.patient?.mrNumber || transaction.staffId || 'N/A';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:p-0 print:bg-white print:backdrop-blur-none">
      {/* Modal Box */}
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 print:shadow-none print:rounded-none print:w-full print:max-w-none print:h-full">
        
        {/* Header - Hidden on print */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-white">
            <Printer className="w-5 h-5 text-teal-400" />
            <h2 className="text-sm font-bold">Print Invoice / Receipt</h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/10"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div 
          id="printable-receipt-content" 
          className="p-8 space-y-6 text-slate-800 bg-white font-sans print:p-4 print:text-black"
        >
          {/* Print Style Injector */}
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-receipt-content, #printable-receipt-content * {
                visibility: visible !important;
              }
              #printable-receipt-content {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                padding: 0px !important;
                margin: 0px !important;
              }
            }
          `}} />

          {/* Hospital Brand */}
          <div className="flex justify-between items-start border-b-2 border-slate-100 pb-5">
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">MKMC Hospital</h1>
              <p className="text-xs text-slate-400 font-medium">Mehmoud Khan Medical Center</p>
              <p className="text-[10px] text-slate-400 mt-1">Sector G-11, Islamabad, Pakistan | +92 51 111-222-333</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                transaction.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
              }`}>
                {transaction.status}
              </span>
              <p className="text-[10px] text-slate-400 font-bold mt-2">INVOICE #{transaction.id}</p>
            </div>
          </div>

          {/* Invoice Meta Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 print:bg-white print:p-0 print:border-none">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Billed To</p>
              <p className="font-extrabold text-slate-900">{entityName}</p>
              {transaction.patient && (
                <>
                  <p className="text-slate-500 font-medium mt-1">Patient Directory Reference</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{entityIdLabel}: {entityIdVal}</p>
                </>
              )}
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-right print:bg-white print:p-0 print:border-none">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Payment Info</p>
              <p className="font-semibold text-slate-700">Date: {new Date(transaction.createdAt).toLocaleDateString()}</p>
              <p className="text-slate-500 font-medium mt-1">Method: <span className="font-bold text-slate-700 uppercase">{transaction.method}</span></p>
              {transaction.referenceNumber && (
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Ref: {transaction.referenceNumber}</p>
              )}
            </div>
          </div>

          {/* Billing Table */}
          <div className="mt-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 print:bg-white">
                  <th className="py-2.5 px-3 font-bold text-slate-500">Service Description</th>
                  <th className="py-2.5 px-3 font-bold text-slate-500">Category</th>
                  <th className="py-2.5 px-3 font-bold text-slate-50 text-right print:text-slate-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900">
                      {transaction.notes || `${transaction.category?.name} Service Fee`}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Service Code: SVC-00{transaction.categoryId}</p>
                    {transaction.appointment && (
                      <p className="text-[10px] text-sky-600 font-bold mt-1 bg-sky-50/50 px-1.5 py-0.5 rounded inline-block">
                        Linked Appointment: #{transaction.appointmentId} {transaction.appointment.doctor ? `(Dr. ${transaction.appointment.doctor.name})` : ''}
                      </p>
                    )}
                    {transaction.labTest && (
                      <p className="text-[10px] text-purple-600 font-bold mt-1 bg-purple-50/50 px-1.5 py-0.5 rounded inline-block">
                        Linked Lab Test: #{transaction.labTestId} ({transaction.labTest.testName})
                      </p>
                    )}
                    {transaction.bedAssignment && (
                      <p className="text-[10px] text-amber-600 font-bold mt-1 bg-amber-50/50 px-1.5 py-0.5 rounded inline-block">
                        Linked Bed Assignment: #{transaction.bedAssignmentId} (Bed {transaction.bedAssignment.bed?.bedNumber || transaction.bedAssignment.bedId})
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-600">
                    {transaction.category?.name}
                  </td>
                  <td className="py-3 px-3 text-right font-extrabold text-slate-900">
                    Rs. {transaction.amount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pricing Calculation Summary */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between font-medium text-slate-500">
                <span>Subtotal:</span>
                <span>Rs. {(transaction.baseAmount || transaction.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-500">
                <span>Discount / Tax:</span>
                <span>Rs. {(transaction.discount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-black text-slate-900 text-sm">
                <span>Total Paid:</span>
                <span>Rs. {transaction.status === 'PAID' ? transaction.amount.toLocaleString() : '0'}</span>
              </div>
              {transaction.status === 'PENDING' && (
                <div className="flex justify-between text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded">
                  <span>Balance Due:</span>
                  <span>Rs. {transaction.amount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Terms / Signatures */}
          <div className="pt-10 border-t border-slate-100 grid grid-cols-2 items-end gap-10">
            <div className="text-[10px] text-slate-400 font-medium">
              <p className="flex items-center gap-1 text-slate-500 font-bold mb-1">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> Get Well Soon
              </p>
              <p>This is a computer-generated invoice and does not require a physical signature. Returns/refunds policy details are available at reception desk.</p>
            </div>
            <div className="text-right space-y-4">
              <div className="inline-block border-b border-slate-300 w-36 h-8"></div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Authorized Signature</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ReceiptPrintView;

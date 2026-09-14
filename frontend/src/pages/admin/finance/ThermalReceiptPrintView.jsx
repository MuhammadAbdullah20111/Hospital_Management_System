import React from 'react';
import { X, Printer } from 'lucide-react';
import { getFromLocalStorage } from '../../../helpers/localStorageFile';

const ThermalReceiptPrintView = ({ isOpen, onClose, transaction }) => {
  if (!isOpen || !transaction) return null;

  const printedByName = getFromLocalStorage('name') || 'Staff';
  const rawRole = getFromLocalStorage('role') || getFromLocalStorage('userType') || 'Staff';
  const printedByRole = rawRole === 'SYSTEM_ADMIN' ? 'Admin' : rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();

  const entityName = transaction.patient?.name || transaction.staff?.name || 'External';
  const entityIdLabel = transaction.patient ? 'MR Number' : 'Staff ID';
  const entityIdVal = transaction.patient?.mrNumber || transaction.staffId || 'N/A';

  // Extract queue token if it exists in linked relations
  const queueToken = transaction.appointment?.queueToken || transaction.labTest?.queueToken || null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[60] flex overflow-auto p-4 bg-slate-900/60 backdrop-blur-sm print:p-0 print:bg-white print:backdrop-blur-none">
      {/* Modal Box */}
      <div className="m-auto w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh] print:shadow-none print:rounded-none print:w-full print:h-auto print:max-h-none">
        
        {/* Header - Hidden on print */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-white">
            <Printer className="w-5 h-5 text-teal-400" />
            <h2 className="text-sm font-bold">Print Receipt</h2>
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

        {/* Scrollable container for screen, but visible on print */}
        <div className="flex-1 min-h-0 overflow-auto custom-scrollbar bg-slate-100 print:bg-white print:overflow-visible">
          <div className="min-w-fit min-h-full p-6 flex justify-center items-start print:p-0 print:block">
            {/* Printable Thermal Area - strictly bounded width */}
            <div 
              id="printable-receipt-content" 
              className="w-[300px] shrink-0 bg-white text-black font-sans print:w-[300px] print:mx-auto"
              style={{
                fontFamily: "'Inter', sans-serif"
              }}
            >
            {/* Print Style Injector for Thermal constraints */}
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
                  width: 300px !important;
                  padding: 0px !important;
                  margin: 0px !important;
                }
                @page {
                  margin: 0;
                  size: 80mm 297mm;
                }
              }
            `}} />

            {/* Content of Thermal Receipt */}
            <div className="px-4 py-6 border border-slate-200 print:border-none print:px-0 print:py-0">
              
              {/* Hospital Header */}
              <div className="text-center mb-4 border-b border-black pb-4 border-dashed">
                <h1 className="text-lg font-black tracking-tight uppercase">MKMC Hospital</h1>
                <p className="text-[10px] font-medium leading-tight mt-1">Mehmod khan Medical Center</p>
                <p className="text-[9px] mt-1">Sector G-11, Islamabad, Pakistan</p>
                <p className="text-[9px]">+92 51 111-222-333</p>
              </div>

              {/* Queue Token (Top Center) */}
              {queueToken && (
                <div className="text-center mb-4 border-b border-black pb-4 border-dashed">
                  <p className="text-[10px] uppercase font-bold">Queue Token</p>
                  <p className="text-4xl font-black tabular-nums tracking-tighter my-1">{queueToken.tokenNumber}</p>
                  <p className="text-[10px] uppercase tracking-widest">{queueToken.department}</p>
                </div>
              )}

              {/* Receipt Meta */}
              <div className="text-[10px] mb-4 space-y-1">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-bold">{new Date(transaction.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Receipt #:</span>
                  <span className="font-bold">{transaction.id}</span>
                </div>
                {transaction.referenceNumber && (
                  <div className="flex justify-between">
                    <span>Ref #:</span>
                    <span className="font-bold">{transaction.referenceNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span className="font-bold uppercase">{transaction.method} ({transaction.status})</span>
                </div>
              </div>

              {/* Patient Details */}
              <div className="text-[10px] mb-4 border-t border-black pt-3 border-dashed">
                <p className="uppercase font-bold mb-1">Patient Details</p>
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className="font-bold">{entityName}</span>
                </div>
                <div className="flex justify-between">
                  <span>{entityIdLabel}:</span>
                  <span className="font-bold">{entityIdVal}</span>
                </div>
              </div>

              {/* Service Details */}
              <div className="text-[10px] mb-4 border-t border-b border-black py-3 border-dashed space-y-2">
                <div className="flex justify-between font-bold uppercase pb-1 border-b border-slate-300">
                  <span>Service</span>
                  <span>Amount</span>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <span className="font-bold block leading-tight">
                      {transaction.notes || `${transaction.category?.name} Service`}
                    </span>
                    {transaction.appointment && (
                      <span className="text-[9px] block mt-0.5">
                        Appt: #{transaction.appointmentId} {transaction.appointment.doctor ? `(Dr. ${transaction.appointment.doctor.name})` : ''}
                      </span>
                    )}
                    {transaction.labTest && (
                      <span className="text-[9px] block mt-0.5">
                        Test: {transaction.labTest.testName}
                      </span>
                    )}
                    {transaction.bedAssignment && (
                      <span className="text-[9px] block mt-0.5 space-y-0.5">
                        <span className="block">Bed: {transaction.bedAssignment.bed?.bedNumber || transaction.bedAssignment.bedId}</span>
                        {(() => {
                          const ba = transaction.bedAssignment;
                          let totalDays = 1;
                          if (ba.actualDischargeAt || ba.expectedDischargeAt) {
                            const start = new Date(ba.assignedAt);
                            const end = new Date(ba.actualDischargeAt || ba.expectedDischargeAt);
                            const diff = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
                            totalDays = Math.max(1, diff);
                          }
                          const perDay = ba.dailyRate > 0 ? ba.dailyRate : ((transaction.baseAmount || transaction.amount) / totalDays);
                          return (
                            <>
                              <span className="block text-slate-500">Per Day: Rs. {perDay.toLocaleString()}</span>
                              <span className="block text-slate-500">Total Days: {totalDays}</span>
                            </>
                          );
                        })()}
                      </span>
                    )}
                  </div>
                  <span className="font-bold whitespace-nowrap">Rs. {transaction.amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Totals */}
              <div className="text-[10px] space-y-1 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rs. {(transaction.baseAmount || transaction.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>Rs. {(transaction.discount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-[12px] pt-1 border-t border-slate-300">
                  <span>Total Paid:</span>
                  <span>Rs. {transaction.status === 'PAID' ? transaction.amount.toLocaleString() : '0'}</span>
                </div>
                {transaction.status === 'PENDING' && (
                  <div className="flex justify-between font-bold text-[12px] pt-1 border-t border-black mt-1">
                    <span>Balance Due:</span>
                    <span>Rs. {transaction.amount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="text-center text-[9px] border-t border-black pt-4 border-dashed mt-8 space-y-1">
                <p className="font-bold uppercase tracking-widest">Get Well Soon</p>
                <p className="leading-tight">Thank you for visiting MKMC Hospital. Please retain this receipt for your records.</p>
                <div className="text-[8px] text-slate-500 font-medium italic pt-2 border-t border-slate-100 mt-2">
                  Printed by: {printedByName} ({printedByRole})
                </div>
              </div>

            </div>
          </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ThermalReceiptPrintView;

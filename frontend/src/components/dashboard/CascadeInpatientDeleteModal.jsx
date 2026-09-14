import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Trash2, Home, Bed, UserX, ShieldAlert } from 'lucide-react';
import LoadingPlaceholder from '../ui/LoadingPlaceholder';

/**
 * Cascade Warning Modal for Inpatient Deletion (Wards, Rooms, Beds)
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {string} props.type - 'WARD', 'ROOM', or 'BED'
 * @param {Object} props.item - The item to delete
 * @param {Function} props.onConfirm - Function to call when confirming delete
 */
const CascadeInpatientDeleteModal = ({
  isOpen,
  onClose,
  type,
  item,
  onConfirm
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (isOpen) {
      setConfirmName('');
      setCountdown(3);
      setIsDeleting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (isOpen && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isOpen, countdown]);

  if (!isOpen || !item) return null;

  const itemName = type === 'WARD' ? item.name : type === 'ROOM' ? `Room ${item.roomNumber}` : `Bed ${item.bedNumber}`;
  const targetConfirm = type === 'WARD' ? item.name : type === 'ROOM' ? item.roomNumber : item.bedNumber;

  // Dependency counts
  const roomCount = item._count?.rooms || 0;
  const bedCount = item._count?.beds || 0;
  
  // Check for occupied beds
  // For WARD: check if any bed in the ward is occupied
  // For ROOM: check if any bed in the room is occupied
  // For BED: check if the bed itself is occupied
  let isOccupied = false;
  if (type === 'WARD') {
    isOccupied = item.beds?.some(b => b.status === 'OCCUPIED');
  } else if (type === 'ROOM') {
    isOccupied = item.beds?.some(b => b.status === 'OCCUPIED');
  } else if (type === 'BED') {
    isOccupied = item.status === 'OCCUPIED';
  }

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(item.id);
      onClose();
    } catch (error) {
      console.error("Deletion failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const isConfirmDisabled = confirmName !== targetConfirm || countdown > 0 || isOccupied || isDeleting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border-t-4 border-teal-600 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-rose-100 p-2 rounded-full text-rose-600">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Delete {type.charAt(0) + type.slice(1).toLowerCase()}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto space-y-6">
          <div>
            <p className="text-slate-600 font-medium">
              You are about to delete <strong className="text-slate-900 font-bold">{itemName}</strong>.
            </p>
            {isOccupied && (
              <div className="mt-4 bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-start gap-3 text-rose-700">
                <ShieldAlert className="shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-bold text-sm uppercase tracking-tight">Cannot delete occupied resource!</p>
                  <p className="text-xs mt-1 leading-relaxed">There are patients currently assigned to beds in this {type.toLowerCase()}. Please discharge or transfer all patients before deleting.</p>
                </div>
              </div>
            )}
          </div>

          {!isOccupied && (
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Impacted Dependencies</p>
              
              <div className="grid grid-cols-1 gap-3">
                {type === 'WARD' && (
                  <>
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="bg-teal-100 p-2 rounded-full text-teal-600">
                        <Home size={20} />
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold text-sm">{roomCount} {roomCount === 1 ? 'Room' : 'Rooms'}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">Will be permanently removed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                        <Bed size={20} />
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold text-sm">{bedCount} {bedCount === 1 ? 'Bed' : 'Beds'}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">Will be permanently removed</p>
                      </div>
                    </div>
                  </>
                )}

                {type === 'ROOM' && (
                  <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                      <Bed size={20} />
                    </div>
                    <div>
                      <p className="text-slate-900 font-bold text-sm">{bedCount} {bedCount === 1 ? 'Bed' : 'Beds'}</p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">Will be permanently removed</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                    <UserX size={20} />
                  </div>
                  <div>
                    <p className="text-slate-900 font-bold text-sm">Assignment History</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">All historical records will be deleted</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block mb-2 text-xs font-bold text-slate-500 uppercase">
                  Type <strong className="text-slate-900 font-extrabold">{targetConfirm}</strong> to confirm:
                </label>
                <input 
                  type="text"
                  className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 transition-all font-medium text-sm ${
                    confirmName && confirmName !== targetConfirm 
                      ? 'border-rose-300 focus:ring-rose-500/20' 
                      : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                  }`}
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder={`Enter ${targetConfirm}...`}
                  disabled={isOccupied}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-200/50 rounded-xl transition-colors"
            disabled={isDeleting}
          >
            Cancel
          </button>
          {!isOccupied && (
            <button 
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
              className="px-5 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-bold text-sm transition-all shadow-sm shadow-rose-200 disabled:opacity-50 disabled:grayscale flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <LoadingPlaceholder className="h-4 w-4" colorClass="text-white" />
                  Processing...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  {countdown > 0 ? `Delete (${countdown}s)` : 'Permanently Delete'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CascadeInpatientDeleteModal;

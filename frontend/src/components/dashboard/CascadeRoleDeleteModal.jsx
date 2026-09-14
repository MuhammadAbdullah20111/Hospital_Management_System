import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, ShieldAlert, Users, KeyRound, ArrowRight } from 'lucide-react';
import LoadingPlaceholder from '../ui/LoadingPlaceholder';
import { useFormik } from 'formik';
import SearchableSelect from '../ui/SearchableSelect';

/**
 * @typedef {Object} Role
 * @property {number} id
 * @property {string} name
 */

/**
 * @typedef {Object} Dependencies
 * @property {number} staffCount
 * @property {number} permissionCount
 * @property {number} rolesCount
 */

/**
 * Cascade Warning Modal for Role Deletion
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {Role} props.role - The role to delete
 * @param {Role[]} props.allRoles - List of all roles (to select replacement)
 * @param {Function} props.fetchDependencies - Function to fetch dependencies, returns a promise with { staff: number, rolePermissions: number }
 * @param {Function} props.onDelete - Function to call when confirming delete, takes (roleId, replacementRoleId?)
 */
const CascadeRoleDeleteModal = ({
  isOpen,
  onClose,
  role,
  allRoles = [],
  fetchDependencies,
  onDelete
}) => {
  const [step, setStep] = useState('WARNING'); // 'WARNING', 'REASSIGN', 'CONFIRM'
  const [dependencies, setDependencies] = useState({ staff: 0, rolePermissions: 0, inheritedRoles: 0 });
  const [isLoadingdeps, setIsLoadingDeps] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [replacementRoleId, setReplacementRoleId] = useState('');
  const [confirmName, setConfirmName] = useState('');
  const [notifyUsers, setNotifyUsers] = useState(false);

  useEffect(() => {
    if (isOpen && role) {
      setStep('WARNING');
      setCountdown(5);
      setConfirmName('');
      setReplacementRoleId('');
      setNotifyUsers(false);
      
      const loadDeps = async () => {
        setIsLoadingDeps(true);
        try {
          const deps = await fetchDependencies(role.id);
          setDependencies({
            staff: deps?.staff || 0,
            rolePermissions: deps?.rolePermissions || 0,
            inheritedRoles: 0, // Not supported in DB yet, hardcoded to 0
          });
        } catch (error) {
          console.error("Failed to load dependencies", error);
        } finally {
          setIsLoadingDeps(false);
        }
      };
      
      loadDeps();
    }
  }, [isOpen, role, fetchDependencies]);

  useEffect(() => {
    let timer;
    if (isOpen && step === 'CONFIRM' && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isOpen, step, countdown]);

  if (!isOpen || !role) return null;

  // Protect system roles. If you have "Super Admin" role with id=1, prevent it.
  const isSystemProtected = role.name.toLowerCase() === 'system' || role.name.toLowerCase() === 'super admin' || role.id === 1;

  const handlePrimaryAction = () => {
    if (dependencies.staff > 0) {
      setStep('REASSIGN');
    } else {
      setStep('CONFIRM');
    }
  };

  const handleConfirmDelete = async () => {
    await onDelete(role.id, replacementRoleId || null);
    onClose();
  };

  const isConfirmDisabled = confirmName !== role.name || countdown > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border-t-4 border-teal-600 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-teal-100 p-2 rounded-full text-teal-600">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Cascade Warning: Delete Role
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content body */}
        <div className="px-6 py-6 overflow-y-auto">
          {isSystemProtected ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3">
              <ShieldAlert className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Cannot delete protected role.</p>
                <p className="text-sm mt-1">This is a protected system role and cannot be deleted.</p>
              </div>
            </div>
          ) : step === 'WARNING' ? (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div>
                <p className="text-gray-700">
                  Deleting <strong className="text-gray-900">'{role.name}'</strong> will affect the following dependencies:
                </p>
              </div>

              {isLoadingdeps ? (
                <div className="flex flex-col items-center justify-center p-8 text-gray-500 gap-2">
                  <LoadingPlaceholder className="h-8 w-8" />
                  <span>Scanning dependencies...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">
                        {dependencies.staff} {dependencies.staff === 1 ? 'user' : 'users'}
                      </p>
                      <p className="text-sm text-gray-500">will lose this role assignment</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                      <ShieldAlert size={20} />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">
                        {dependencies.inheritedRoles} {dependencies.inheritedRoles === 1 ? 'role' : 'roles'}
                      </p>
                      <p className="text-sm text-gray-500">inherit permissions from this role</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                      <KeyRound size={20} />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">
                        {dependencies.rolePermissions} permission {dependencies.rolePermissions === 1 ? 'set' : 'sets'}
                      </p>
                      <p className="text-sm text-gray-500">will be orphaned</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm border border-red-100 font-medium">
                This action cannot be undone. All role permissions will be permanently removed.
              </div>
            </div>
          ) : step === 'REASSIGN' ? (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div>
                <p className="text-gray-700 font-medium mb-1">Reassign {dependencies.staff} Users</p>
                <p className="text-sm text-gray-500 mb-4">
                  Please select a replacement role for the affected users. If no replacement is selected, they will lose their current permissions and access.
                </p>
                <SearchableSelect
                  value={replacementRoleId}
                  onChange={(val) => setReplacementRoleId(val)}
                  options={allRoles.filter(r => r.id !== role.id).map(r => ({ value: String(r.id), label: r.name }))}
                  placeholder="-- No replacement (Demote users) --"
                  searchable={true}
                />
              </div>

              {/* Fake toggle for notification */}
              <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`relative inline-block w-10 h-6 rounded-full transition-colors ${notifyUsers ? 'bg-teal-600' : 'bg-gray-300'}`}>
                  <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${notifyUsers ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={notifyUsers} 
                  onChange={() => setNotifyUsers(!notifyUsers)} 
                />
                <div>
                  <p className="text-gray-900 font-medium text-sm">Notify users</p>
                  <p className="text-xs text-gray-500">Send an automated email explaining the role change.</p>
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4">
               <div>
                <p className="text-gray-700 font-medium mb-1">Final Confirmation</p>
                <p className="text-sm text-gray-500 mb-4">
                  You are about to permanently delete <strong>{role.name}</strong> 
                  {replacementRoleId ? (
                    <span className="text-teal-600 font-medium"> and reassign its users</span>
                  ) : dependencies.staff > 0 ? (
                    <span className="text-red-600 font-medium"> and demote {dependencies.staff} users</span>
                  ) : null}.
                </p>
                
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Please type <strong>{role.name}</strong> to confirm.
                </label>
                <input 
                  type="text"
                  className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                    confirmName && confirmName !== role.name 
                      ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-red-500/50 focus:border-red-500'
                  }`}
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder={role.name}
                />
               </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-xl">
          {isSystemProtected ? (
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
            >
              Close
            </button>
          ) : step === 'WARNING' ? (
             <>
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                disabled={isLoadingdeps}
              >
                Cancel
              </button>
              <button 
                onClick={handlePrimaryAction}
                disabled={isLoadingdeps}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors shadow-sm disabled:opacity-50 flex flex-row items-center gap-2"
              >
                {dependencies.staff > 0 ? (
                  <>
                    Continue to Reassign <ArrowRight size={16} />
                  </>
                ) : (
                  'Proceed to Delete'
                )}
              </button>
             </>
          ) : step === 'REASSIGN' ? (
            <>
              <button 
                onClick={() => setStep('WARNING')}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => setStep('CONFIRM')}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors shadow-sm"
              >
                Next Step
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setStep(dependencies.staff > 0 ? 'REASSIGN' : 'WARNING')}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Back
              </button>
              <button 
                 onClick={handleConfirmDelete}
                 disabled={isConfirmDisabled}
                 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-sm focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {countdown > 0 ? `Delete Anyway (${countdown}s)` : 'Delete Anyway'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CascadeRoleDeleteModal;

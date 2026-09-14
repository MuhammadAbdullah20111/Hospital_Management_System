import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, 
  Plus, 
  Cpu, 
  Network, 
  Activity, 
  RefreshCw, 
  Trash2, 
  Edit, 
  ArrowLeft, 
  Check, 
  X,
  Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  getAllDevicesAPI, 
  createDeviceAPI, 
  updateDeviceAPI, 
  deleteDeviceAPI, 
  testConnectionAPI, 
  syncDeviceAPI,
  syncAllDevicesAPI
} from '../../../api/admin/attendance';
import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';

const DeviceManagement = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [activeTestingIds, setActiveTestingIds] = useState(new Set());
  const [activeSyncingIds, setActiveSyncingIds] = useState(new Set());

  // Modal/Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    ipAddress: '',
    port: 4370,
    isActive: true
  });

  const fetchDevices = async () => {
    try {
      const response = await getAllDevicesAPI();
      if (response.success) {
        setDevices(response.devices);
      }
    } catch (err) {
      console.error('Failed to load devices:', err);
      toast.error('Failed to load biometric devices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleOpenAddModal = () => {
    setEditingDevice(null);
    setFormData({
      name: '',
      ipAddress: '',
      port: 4370,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (device) => {
    setEditingDevice(device);
    setFormData({
      name: device.name,
      ipAddress: device.ipAddress,
      port: device.port,
      isActive: device.isActive
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDevice(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.ipAddress) {
      toast.error('Name and IP address are required');
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      if (editingDevice) {
        response = await updateDeviceAPI(editingDevice.id, formData);
      } else {
        response = await createDeviceAPI(formData);
      }

      if (response.success) {
        toast.success(editingDevice ? 'Device updated successfully' : 'Device added successfully');
        fetchDevices();
        handleCloseModal();
      }
    } catch (err) {
      console.error('Failed to save device:', err);
      toast.error(err.message || 'Failed to save device configurations');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this device? This will remove all associated logs mapping.')) return;

    try {
      const response = await deleteDeviceAPI(id);
      if (response.success) {
        toast.success('Device deleted successfully');
        fetchDevices();
      }
    } catch (err) {
      console.error('Failed to delete device:', err);
      toast.error('Failed to delete biometric terminal');
    }
  };

  const handleTestConnection = async (id) => {
    setActiveTestingIds(prev => new Set(prev).add(id));
    try {
      const response = await testConnectionAPI(id);
      if (response.success) {
        toast.success(`Connection Active: ${response.message || 'OK'}`);
        fetchDevices(); // Reload to update status badge
      }
    } catch (err) {
      console.error('Connection failed:', err);
      toast.error(err.message || 'Device connection failed');
      fetchDevices();
    } finally {
      setActiveTestingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleSyncDevice = async (id) => {
    setActiveSyncingIds(prev => new Set(prev).add(id));
    try {
      const response = await syncDeviceAPI(id);
      if (response.success) {
        const count = response.stats?.inserted || 0;
        toast.success(`Sync Complete! Fetched and saved ${count} new attendance logs.`);
        fetchDevices();
      }
    } catch (err) {
      console.error('Sync failed:', err);
      toast.error(err.message || 'Synchronization failed');
    } finally {
      setActiveSyncingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleSyncAllDevices = async () => {
    setIsSyncingAll(true);
    try {
      const response = await syncAllDevicesAPI();
      if (response.success) {
        toast.success('All active biometric devices synced successfully');
        fetchDevices();
      }
    } catch (err) {
      console.error('Sync all failed:', err);
      toast.error('Failed to sync all active devices');
    } finally {
      setIsSyncingAll(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LoadingPlaceholder className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
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
            <Cpu className="w-7 h-7 text-teal-600 animate-pulse" />
            Biometric Terminals
          </h1>
          <p className="text-slate-500">Manage and sync physical ZKTeco TCP/IP biometric readers.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncAllDevices}
            disabled={isSyncingAll}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:bg-slate-50 rounded-xl font-bold text-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
            Sync All Active
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Device
          </button>
        </div>
      </div>

      {/* Grid List */}
      {devices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-teal-100 shadow-sm hover:shadow-md transition-all p-12 text-center space-y-4">
          <Fingerprint className="w-16 h-16 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-lg">No Devices Configured</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Add your ZKTeco biometric clock-in reader to establish connection and fetch punches.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add First Device
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map(device => {
            const isTesting = activeTestingIds.has(device.id);
            const isSyncing = activeSyncingIds.has(device.id);

            return (
              <div 
                key={device.id} 
                className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all ${
                  device.isActive ? 'border-teal-100 hover:shadow-md' : 'border-slate-200 opacity-60'
                }`}
              >
                <div>
                  {/* Status and Title */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 ${
                      device.status === 'CONNECTED' ? 'bg-emerald-50 text-emerald-700' :
                      device.status === 'DISCONNECTED' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Activity className="w-3 h-3" />
                      {device.status}
                    </span>

                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleOpenEditModal(device)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-slate-50 transition-colors"
                        title="Edit Device"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(device.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-50 transition-colors"
                        title="Delete Device"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-800 text-lg mb-1">{device.name}</h3>
                  
                  {/* Connection info */}
                  <div className="space-y-1.5 text-sm text-slate-500 mb-4 font-mono">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-slate-400" />
                      <span>{device.ipAddress}:{device.port}</span>
                    </div>
                  </div>

                  {device.ipAddress === '127.0.0.1' && (
                    <div className="px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-lg inline-block mb-4">
                      ⚙️ Simulation Fallback Enabled
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-4 mt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                    <span>Last Synced:</span>
                    <span className="font-medium text-slate-600">
                      {device.lastSyncAt ? new Date(device.lastSyncAt).toLocaleString() : 'Never'}
                    </span>
                  </div>

                  {/* Operational Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleTestConnection(device.id)}
                      disabled={isTesting || !device.isActive}
                      className="px-3 py-2 border border-slate-200 hover:bg-slate-50 disabled:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Play className={`w-3.5 h-3.5 ${isTesting ? 'animate-pulse' : ''}`} />
                      {isTesting ? 'Testing...' : 'Test Conn'}
                    </button>
                    <button
                      onClick={() => handleSyncDevice(device.id)}
                      disabled={isSyncing || !device.isActive}
                      className="px-3 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'Syncing...' : 'Sync Logs'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-teal-100 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between px-6 py-4 bg-teal-50 border-b border-teal-100">
              <h3 className="font-bold text-slate-800">
                {editingDevice ? 'Edit Biometric Device' : 'Configure New Biometric Device'}
              </h3>
              <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-teal-100/50 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Device Name / Location *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Front Gate Reception"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                  required
                />
              </div>

              {/* IP Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Device IP Address *</label>
                <input
                  type="text"
                  name="ipAddress"
                  value={formData.ipAddress}
                  onChange={handleInputChange}
                  placeholder="e.g. 192.168.1.201 (or 127.0.0.1)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                  required
                />
              </div>

              {/* Port */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">TCP/UDP Connection Port</label>
                <input
                  type="number"
                  name="port"
                  value={formData.port}
                  onChange={handleInputChange}
                  placeholder="Default 4370"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500/20 border-slate-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-slate-700 cursor-pointer">
                  Device Active (Auto-Sync Enabled)
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center gap-1.5"
                >
                  {isSubmitting && <LoadingPlaceholder className="w-4 h-4" colorClass="text-white" />}
                  {editingDevice ? 'Save Changes' : 'Add Terminal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DeviceManagement;

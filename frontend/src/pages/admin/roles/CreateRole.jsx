import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ShieldCheck } from 'lucide-react';
import { createRoleAPI } from '../../../api/admin/roles';
import { getAllPermissionsAPI } from '../../../api/admin/permissions';
import toast from 'react-hot-toast';

const CreateRole = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [permissions, setPermissions] = useState([]);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        permissions: [] // Array of permission IDs
    });

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            const response = await getAllPermissionsAPI();
            if (response.success) {
                setPermissions(response.permissions);
            }
        } catch (error) {
            console.error("Failed to fetch permissions:", error);
            toast.error("Failed to load permissions list");
        }
    };

    const handlePermissionChange = (permissionId) => {
        setFormData(prev => {
            const currentPermissions = prev.permissions;
            if (currentPermissions.includes(permissionId)) {
                return {
                    ...prev,
                    permissions: currentPermissions.filter(id => id !== permissionId)
                };
            } else {
                return {
                    ...prev,
                    permissions: [...currentPermissions, permissionId]
                };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Role Name is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill all required fields");
            return;
        }
        setErrors({});

        setIsLoading(true);
        try {
            const response = await createRoleAPI(formData);
            if (response.success) {
                toast.success("Role created successfully");
                navigate('/admin/dashboard/roles');
            }
        } catch (error) {
            console.error("Failed to create role:", error);
            toast.error(error.message || "Failed to create role");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/admin/dashboard/roles')}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Create New Role</h1>
                    <p className="text-slate-500">Define a new role and assign system permissions</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Details Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-teal-600" />
                        Role Details
                    </h2>

                    <div className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Role Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`w-full px-4 py-2 bg-slate-50 border ${errors.name ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all`}
                                placeholder="e.g. Senior Doctor"
                            />
                            {errors.name && <p className="text-xs text-red-500 font-medium mt-1">{errors.name}</p>}
                        </div>
                    </div>
                </div>

                {/* Permissions Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-teal-600" />
                            Permissions
                        </h2>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, permissions: permissions.map(p => p.id) }))}
                                className="text-sm font-semibold text-teal-600 hover:text-teal-700 px-2 py-1 rounded-lg hover:bg-teal-50 transition-colors"
                            >
                                Select All
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, permissions: [] }))}
                                className="text-sm font-semibold text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                Deselect All
                            </button>
                            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full ml-2">
                                {formData.permissions.length} Selected
                            </span>
                        </div>
                    </div>

                    {permissions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {permissions.map((perm) => (
                                <label
                                    key={perm.id}
                                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.permissions.includes(perm.id)
                                            ? 'bg-teal-50 border-teal-200'
                                            : 'bg-white border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="relative flex items-center mt-0.5">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                            checked={formData.permissions.includes(perm.id)}
                                            onChange={() => handlePermissionChange(perm.id)}
                                        />
                                    </div>
                                    <div>
                                        <span className={`block text-sm font-semibold mb-0.5 ${formData.permissions.includes(perm.id) ? 'text-teal-900' : 'text-slate-700'
                                            }`}>
                                            {perm.name}
                                        </span>
                                        {/* Optional description if available in permission object */}
                                    </div>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            No active permissions found in the system.
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-xl hover:bg-teal-700 transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20"
                    >
                        {isLoading ? (
                            <>
                                <LoadingPlaceholder className="h-4" colorClass="text-white" />
                                Creating Role...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Create Role
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRole;

import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Hospital } from 'lucide-react';
import { getWardByIdAPI, updateWardAPI } from '../../../api/admin/inpatient';
import toast from 'react-hot-toast';

const EditWard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        isActive: true
    });

    useEffect(() => {
        const fetchWard = async () => {
            try {
                const response = await getWardByIdAPI(id);
                if (response.success) {
                    const { name, code, description, isActive } = response.ward;
                    setFormData({ name, code, description: description || '', isActive });
                }
            } catch (error) {
                console.error("Failed to fetch ward:", error);
                toast.error("Failed to load ward data");
                navigate('/admin/dashboard/inpatient/wards');
            } finally {
                setIsLoading(false);
            }
        };
        fetchWard();
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Ward Name is required";
        if (!formData.code.trim()) newErrors.code = "Ward Code is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill all required fields");
            return;
        }
        setErrors({});

        setIsSaving(true);
        try {
            const response = await updateWardAPI(id, formData);
            if (response.success) {
                toast.success("Ward updated successfully");
                navigate('/admin/dashboard/inpatient/wards');
            }
        } catch (error) {
            console.error("Failed to update ward:", error);
            toast.error(error.message || "Failed to update ward");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <LoadingPlaceholder className="h-16 w-16" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/admin/dashboard/inpatient/wards')}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Edit Ward</h1>
                    <p className="text-slate-500">Update ward details and settings</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Hospital className="w-5 h-5 text-teal-600" />
                        Ward Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Ward Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`w-full px-4 py-2 bg-slate-50 border ${errors.name ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all`}
                            />
                            {errors.name && <p className="text-xs text-red-500 font-medium mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Ward Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                className={`w-full px-4 py-2 bg-slate-50 border ${errors.code ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all`}
                            />
                            {errors.code && <p className="text-xs text-red-500 font-medium mt-1">{errors.code}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                rows="4"
                            />
                        </div>

                        <div className="md:col-span-2 flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
                                Mark as Active Ward
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-xl hover:bg-teal-700 transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20"
                    >
                        {isSaving ? (
                            <>
                                <LoadingPlaceholder className="h-4" colorClass="text-white" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Update Ward
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditWard;

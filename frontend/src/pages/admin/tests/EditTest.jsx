import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Beaker, Info, Tag, Banknote, Trash2 } from 'lucide-react';
import { getTestByIdAPI, updateTestAPI, deleteTestAPI } from '../../../api/admin/tests';
import toast from 'react-hot-toast';
import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import SearchableSelect from '../../../components/ui/SearchableSelect';

const EditTest = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        isActive: true
    });

    useEffect(() => {
        fetchTestData();
    }, [id]);

    const fetchTestData = async () => {
        setIsLoading(true);
        try {
            const response = await getTestByIdAPI(id);
            if (response.success) {
                const { name, category, price, isActive } = response.test;
                setFormData({
                    name,
                    category: category || '',
                    price: price.toString(),
                    isActive
                });
            }
        } catch (error) {
            console.error("Failed to fetch test data:", error);
            toast.error(error.message || "Failed to load test data");
            navigate('/admin/dashboard/tests');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.price) newErrors.price = "Price is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill all required fields");
            return;
        }
        setErrors({});

        setIsSaving(true);
        try {
            const response = await updateTestAPI(id, {
                ...formData,
                price: parseFloat(formData.price)
            });
            if (response.success) {
                toast.success("Test definition updated successfully");
                navigate('/admin/dashboard/tests');
            }
        } catch (error) {
            console.error("Failed to update test:", error);
            toast.error(error.message || "Failed to update test");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete this test?`)) {
            try {
                const response = await deleteTestAPI(id);
                if (response.success) {
                    toast.success("Test deleted successfully");
                    navigate('/admin/dashboard/tests');
                }
            } catch (error) {
                console.error("Failed to delete test:", error);
                toast.error(error.message || "Failed to delete test");
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <LoadingPlaceholder className="h-10 w-10" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors mb-2 text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Test List
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900">Edit Test</h1>
                    <p className="text-slate-500">Update existing test parameters and pricing.</p>
                </div>
                <button
                    onClick={handleDelete}
                    className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete Test"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-teal-100 shadow-sm p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Beaker className="w-4 h-4 text-teal-600" />
                            Test Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full px-4 py-2 bg-slate-50 border ${errors.name ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-slate-700`}
                            placeholder="e.g. Complete Blood Count (CBC)"
                        />
                        {errors.name && <p className="text-xs text-red-500 font-medium mt-1">{errors.name}</p>}
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <SearchableSelect
                            label="Category"
                            options={[
                                { value: 'Hematology', label: 'Hematology' },
                                { value: 'Biochemistry', label: 'Biochemistry' },
                                { value: 'Microbiology', label: 'Microbiology' },
                                { value: 'Endocrinology', label: 'Endocrinology' },
                                { value: 'Immunology', label: 'Immunology' },
                                { value: 'Radiology', label: 'Radiology' },
                                { value: 'Other', label: 'Other' }
                            ]}
                            value={formData.category}
                            onChange={(val) => setFormData({ ...formData, category: val })}
                            searchable={false}
                            placeholder="Select Category"
                            icon={Tag}
                        />
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-teal-600" />
                            Standard Price (Rs) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className={`w-full px-4 py-2 bg-slate-50 border ${errors.price ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-slate-700`}
                            placeholder="0.00"
                        />
                        {errors.price && <p className="text-xs text-red-500 font-medium mt-1">{errors.price}</p>}
                    </div>

                    {/* Status Toggle */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Info className="w-4 h-4 text-teal-600" />
                            Test Status
                        </label>
                        <div className="flex items-center gap-4 h-11">
                            <div
                                onClick={() => setFormData({ ...formData, isActive: true })}
                                className="flex items-center gap-2 cursor-pointer group"
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.isActive === true ? 'border-teal-600 bg-teal-600' : 'border-slate-300 group-hover:border-teal-400'}`}>
                                    {formData.isActive === true && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <span className={`font-medium ${formData.isActive === true ? 'text-teal-700' : 'text-slate-500'}`}>Active</span>
                            </div>

                            <div
                                onClick={() => setFormData({ ...formData, isActive: false })}
                                className="flex items-center gap-2 cursor-pointer group"
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.isActive === false ? 'border-red-500 bg-red-500' : 'border-slate-300 group-hover:border-red-400'}`}>
                                    {formData.isActive === false && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <span className={`font-medium ${formData.isActive === false ? 'text-red-700' : 'text-slate-500'}`}>Inactive</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-xl font-bold transition-all shadow-sm hover:shadow-md h-12 min-w-[160px] justify-center"
                    >
                        {isSaving ? (
                            <LoadingPlaceholder className="h-5 w-5" colorClass="text-white" />
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Update Test Definition
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditTest;

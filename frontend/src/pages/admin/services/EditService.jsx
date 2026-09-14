import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Stethoscope, Image as ImageIcon, Star, Users, Percent, List, Info, Upload, X } from 'lucide-react';
import { getServiceByIdAPI, updateServiceAPI } from '../../../api/admin/services';
import toast from 'react-hot-toast';
import SearchableSelect from '../../../components/ui/SearchableSelect';

const EditService = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        specialty: '',
        description: '',
        shortDescription: '',
        baseCost: '',
        image: '',
        imageAlt: '',
        icon: '',
        successRate: '',
        rating: '',
        patientsServed: '',
        features: '',
        isActive: true
    });

    useEffect(() => {
        fetchService();
    }, [id]);

    const fetchService = async () => {
        setIsFetching(true);
        try {
            const response = await getServiceByIdAPI(id);
            if (response.success) {
                const s = response.service;
                setFormData({
                    name: s.name || '',
                    category: s.category || '',
                    specialty: s.specialty || '',
                    description: s.description || '',
                    shortDescription: s.shortDescription || '',
                    baseCost: s.baseCost || '',
                    image: s.image || '',
                    imageAlt: s.imageAlt || '',
                    icon: s.icon || '',
                    successRate: s.successRate || '',
                    rating: s.rating || '',
                    patientsServed: s.patientsServed || '',
                    features: s.features ? s.features.join(', ') : '',
                    isActive: s.isActive
                });

                if (s.image) {
                    // Check if image is a full URL or a relative path
                    if (s.image.startsWith('http')) {
                        setImagePreview(s.image);
                    } else {
                        // Assuming the backend is on the same host but port 5000 or similar
                        const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
                        const apiRoot = baseUrl.replace('/api', '');
                        setImagePreview(`${apiRoot}${s.image}`);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to load service:", error);
            toast.error("Failed to load service details");
            navigate('/admin/dashboard/services');
        } finally {
            setIsFetching(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size should be less than 5MB");
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setFormData({ ...formData, image: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.baseCost) newErrors.baseCost = "Base Cost is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill all required fields");
            return;
        }
        setErrors({});

        setIsLoading(true);
        try {
            const data = new FormData();

            // Append all text fields
            Object.keys(formData).forEach(key => {
                if (key !== 'image') {
                    data.append(key, formData[key]);
                }
            });

            // Append file if exists
            if (imageFile) {
                data.append('image', imageFile);
            } else if (formData.image) {
                // If no new file but existing image path, append it back
                data.append('image', formData.image);
            }

            const response = await updateServiceAPI(id, data);
            if (response.success) {
                toast.success("Service updated successfully");
                navigate('/admin/dashboard/services');
            }
        } catch (error) {
            console.error("Failed to update service:", error);
            toast.error(error.message || "Failed to update service");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingPlaceholder className="h-12 w-12" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/admin/dashboard/services')}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Edit Service</h1>
                    <p className="text-slate-500">Modify service details</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Core Details */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-teal-600" />
                        Service Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Service Name <span className="text-red-500">*</span>
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
                            <SearchableSelect
                                label="Category"
                                value={formData.category}
                                onChange={(val) => setFormData({ ...formData, category: val })}
                                options={[
                                    { value: 'Clinical', label: 'Clinical' },
                                    { value: 'Specialized', label: 'Specialized' },
                                    { value: 'Diagnostics', label: 'Diagnostics' },
                                    { value: 'Surgical', label: 'Surgical' },
                                    { value: 'Therapy', label: 'Therapy' }
                                ]}
                                placeholder="Select Category"
                                searchable={false}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Specialty
                            </label>
                            <input
                                type="text"
                                value={formData.specialty}
                                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                placeholder="e.g. Cardiology"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Base Cost (Rs) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.baseCost}
                                onChange={(e) => setFormData({ ...formData, baseCost: e.target.value })}
                                className={`w-full px-4 py-2 bg-slate-50 border ${errors.baseCost ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all`}
                            />
                            {errors.baseCost && <p className="text-xs text-red-500 font-medium mt-1">{errors.baseCost}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Short Description
                            </label>
                            <input
                                type="text"
                                value={formData.shortDescription}
                                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                placeholder="Brief summary for service list..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Full Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                rows="3"
                                placeholder="Detailed information about this service..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Features (Comma separated)
                            </label>
                            <div className="relative">
                                <List className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <textarea
                                    value={formData.features}
                                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                    rows="2"
                                    placeholder="e.g. 24/7 Support, Expert Doctors, Modern Equipment"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Public Content & Media */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-teal-600" />
                        Media & Branding
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Service Image
                            </label>

                            {imagePreview ? (
                                <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden group border border-slate-200">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <label className="p-2 bg-white rounded-full text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                                            <Upload className="w-5 h-5" />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="p-2 bg-white rounded-full text-red-500 hover:bg-slate-100 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full aspect-video md:aspect-[21/9] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-teal-300 transition-all cursor-pointer group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="p-3 bg-white rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                            <Upload className="w-6 h-6 text-teal-600" />
                                        </div>
                                        <p className="mb-2 text-sm text-slate-700">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-slate-500">PNG, JPG or WebP (MAX. 5MB)</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Image Alt Text
                            </label>
                            <input
                                type="text"
                                value={formData.imageAlt}
                                onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                placeholder="Description for screen readers"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Icon Name
                            </label>
                            <input
                                type="text"
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                placeholder="e.g. Heart, Stethoscope, Activity"
                            />
                        </div>
                    </div>
                </div>

                {/* Performance Stats */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Star className="w-5 h-5 text-teal-600" />
                        Performance & Statistics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Success Rate (%)
                            </label>
                            <div className="relative">
                                <Percent className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    value={formData.successRate}
                                    onChange={(e) => setFormData({ ...formData, successRate: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                    placeholder="e.g. 98.5"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Rating (1-5)
                            </label>
                            <div className="relative">
                                <Star className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    value={formData.rating}
                                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                    placeholder="e.g. 4.9"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Patients Served
                            </label>
                            <div className="relative">
                                <Users className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.patientsServed}
                                    onChange={(e) => setFormData({ ...formData, patientsServed: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                    placeholder="e.g. 1500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Info className="w-5 h-5 text-teal-600" />
                        Service Status
                    </h2>
                    <div className="md:col-span-2 flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
                            Mark as Active Service
                        </label>
                    </div>
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
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditService;

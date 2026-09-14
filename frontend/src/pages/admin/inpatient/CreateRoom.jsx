import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, DoorOpen } from 'lucide-react';
import { createRoomAPI, getAllWardsAPI } from '../../../api/admin/inpatient';
import { getRoomCategoriesAPI } from '../../../api/admin/finance';
import toast from 'react-hot-toast';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import { Layout, Tags } from 'lucide-react';

const CreateRoom = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [errors, setErrors] = useState({});
    const [wards, setWards] = useState([]);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        roomNumber: '',
        wardId: '',
        floor: '',
        categoryId: '',
        isActive: true
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [wardRes, categoryRes] = await Promise.all([
                    getAllWardsAPI(),
                    getRoomCategoriesAPI()
                ]);

                if (wardRes.success) {
                    setWards(wardRes.wards);
                    if (wardRes.wards.length > 0) {
                        setFormData(prev => ({ ...prev, wardId: wardRes.wards[0].id }));
                    }
                }

                if (categoryRes.success) {
                    setCategories(categoryRes.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast.error("Failed to load form dependencies");
            } finally {
                setIsFetchingData(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.roomNumber.trim()) newErrors.roomNumber = "Room Number is required";
        if (!formData.wardId) newErrors.wardId = "Ward assignment is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill all required fields");
            return;
        }
        setErrors({});

        setIsLoading(true);
        try {
            const data = {
                ...formData,
                wardId: parseInt(formData.wardId),
                categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
                floor: formData.floor ? parseInt(formData.floor) : null
            };
            const response = await createRoomAPI(data);
            if (response.success) {
                toast.success("Room created successfully");
                navigate('/admin/dashboard/inpatient/rooms');
            }
        } catch (error) {
            console.error("Failed to create room:", error);
            toast.error(error.message || "Failed to create room");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetchingData) {
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
                    onClick={() => navigate('/admin/dashboard/inpatient/rooms')}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Create New Room</h1>
                    <p className="text-slate-500">Add a new room to a ward</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <DoorOpen className="w-5 h-5 text-teal-600" />
                        Room Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <SearchableSelect
                                label="Assign Ward"
                                icon={Layout}
                                options={wards.map(w => ({
                                    value: w.id,
                                    label: w.name,
                                    subLabel: w.code
                                }))}
                                value={formData.wardId}
                                onChange={(val) => setFormData({ ...formData, wardId: val })}
                                placeholder="Choose a ward for this room..."
                            />
                            {errors.wardId && <p className="text-xs text-red-500 font-medium mt-1">{errors.wardId}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <SearchableSelect
                                label="Room Category / Daily Rate"
                                icon={Tags}
                                options={categories.map(c => ({
                                    value: c.id,
                                    label: c.name,
                                    subLabel: `Rs. ${c.pricePerDay} / day`
                                }))}
                                value={formData.categoryId}
                                onChange={(val) => setFormData({ ...formData, categoryId: val })}
                                placeholder="Choose a category (sets the daily rate)..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Room Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.roomNumber}
                                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                className={`w-full px-4 py-2 bg-slate-50 border ${errors.roomNumber ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all`}
                                placeholder="e.g. 101, A-05"
                            />
                            {errors.roomNumber && <p className="text-xs text-red-500 font-medium mt-1">{errors.roomNumber}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Floor
                            </label>
                            <input
                                type="number"
                                value={formData.floor}
                                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                placeholder="e.g. 1"
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
                                Mark as Active Room
                            </label>
                        </div>
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
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Create Room
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRoom;

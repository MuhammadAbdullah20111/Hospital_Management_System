import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Bed } from 'lucide-react';
import { createBedAPI, getAllWardsAPI, getAllRoomsAPI } from '../../../api/admin/inpatient';
import toast from 'react-hot-toast';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import { Layout, DoorOpen, Activity } from 'lucide-react';

const CreateBed = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [errors, setErrors] = useState({});
    const [wards, setWards] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [formData, setFormData] = useState({
        bedNumber: '',
        wardId: '',
        roomId: '',
        status: 'AVAILABLE',
        isActive: true
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [wardsRes, roomsRes] = await Promise.all([
                    getAllWardsAPI(),
                    getAllRoomsAPI()
                ]);

                if (wardsRes.success) {
                    setWards(wardsRes.wards);
                    if (wardsRes.wards.length > 0) {
                        setFormData(prev => ({ ...prev, wardId: wardsRes.wards[0].id }));
                    }
                }

                if (roomsRes.success) {
                    setRooms(roomsRes.rooms);
                }
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
                toast.error("Failed to load required data");
            } finally {
                setIsFetchingData(false);
            }
        };
        fetchData();
    }, []);

    const handleWardChange = (wardId) => {
        setFormData({ ...formData, wardId, roomId: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.bedNumber.trim()) newErrors.bedNumber = "Bed Number is required";
        if (!formData.roomId) newErrors.roomId = "Room selection is required";
        if (!formData.wardId) newErrors.wardId = "Ward selection is required";

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
                roomId: formData.roomId ? parseInt(formData.roomId) : null
            };
            const response = await createBedAPI(data);
            if (response.success) {
                toast.success("Bed created successfully");
                navigate('/admin/dashboard/inpatient/beds');
            }
        } catch (error) {
            console.error("Failed to create bed:", error);
            toast.error(error.message || "Failed to create bed");
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
                    onClick={() => navigate('/admin/dashboard/inpatient/beds')}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Create New Bed</h1>
                    <p className="text-slate-500">Add a new bed to a room or ward</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Bed className="w-5 h-5 text-teal-600" />
                        Bed Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-1">
                            <SearchableSelect
                                label="Assign Ward"
                                icon={Layout}
                                options={wards.map(w => ({
                                    value: w.id,
                                    label: w.name,
                                    subLabel: w.code
                                }))}
                                value={formData.wardId}
                                onChange={handleWardChange}
                                placeholder="Choose Ward..."
                            />
                            {errors.wardId && <p className="text-xs text-red-500 font-medium mt-1">{errors.wardId}</p>}
                        </div>

                        <div className="md:col-span-1">
                            <SearchableSelect
                                label="Assign Room"
                                icon={DoorOpen}
                                options={rooms
                                    .filter(room => room.wardId === parseInt(formData.wardId))
                                    .map(room => ({
                                        value: room.id,
                                        label: `Room ${room.roomNumber}`,
                                        subLabel: room.type
                                    }))}
                                value={formData.roomId}
                                onChange={(val) => setFormData({ ...formData, roomId: val })}
                                placeholder="Choose Room..."
                                noOptionsMessage={formData.wardId ? "No rooms in this ward" : "Select a ward first"}
                            />
                            {errors.roomId && <p className="text-xs text-red-500 font-medium mt-1">{errors.roomId}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Bed Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.bedNumber}
                                onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                                className={`w-full px-4 py-2 bg-slate-50 border ${errors.bedNumber ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all`}
                                placeholder="e.g. B-01, ICU-BED-1"
                            />
                            {errors.bedNumber && <p className="text-xs text-red-500 font-medium mt-1">{errors.bedNumber}</p>}
                        </div>

                        <div className="md:col-span-1">
                            <SearchableSelect
                                label="Initial Status"
                                icon={Activity}
                                options={[
                                    { value: 'AVAILABLE', label: 'Available' },
                                    { value: 'MAINTENANCE', label: 'Maintenance' },
                                    { value: 'CLEANING', label: 'Cleaning' }
                                ]}
                                value={formData.status}
                                onChange={(val) => setFormData({ ...formData, status: val })}
                                placeholder="Select Status..."
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
                                Mark as Active Bed
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
                                Create Bed
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateBed;

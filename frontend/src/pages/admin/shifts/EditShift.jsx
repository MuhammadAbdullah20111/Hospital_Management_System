import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Clock, Plus, Trash2 } from 'lucide-react';
import { getShiftByIdAPI, updateShiftAPI } from '../../../api/admin/shifts';
import { getAllDepartmentsAPI } from '../../../api/admin/staff';
import toast from 'react-hot-toast';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import TimePicker from '../../../components/ui/TimePicker';

const EditShift = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        departmentId: '',
        slots: []
    });
    const [departments, setDepartments] = useState([]);

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const DAYS_MAP = { 'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6 };

    const calculateDuration = (startDay, endDay, startTime, endTime) => {
        if (!startTime || !endTime || !startDay || !endDay) return '0h 0m';

        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);

        const startIndex = DAYS_MAP[startDay];
        const endIndex = DAYS_MAP[endDay];

        const startTotalMinutes = (startIndex * 24 * 60) + (startHours * 60) + startMinutes;
        let endTotalMinutes = (endIndex * 24 * 60) + (endHours * 60) + endMinutes;

        if (endTotalMinutes <= startTotalMinutes) {
            endTotalMinutes += 7 * 24 * 60;
        }

        const durationMinutes = endTotalMinutes - startTotalMinutes;
        const h = Math.floor(durationMinutes / 60);
        const m = durationMinutes % 60;

        if (h > 24) {
            const d = Math.floor(h / 24);
            const remainingH = h % 24;
            return `${d}d ${remainingH}h ${m}m`;
        }
        return `${h}h ${m}m`;
    };

    const handleSlotChange = (index, field, value) => {
        const newSlots = [...formData.slots];
        newSlots[index][field] = value;
        setFormData({ ...formData, slots: newSlots });
    };

    const addSlot = () => {
        setFormData({
            ...formData,
            slots: [...formData.slots, { startDayOfWeek: 'Monday', endDayOfWeek: 'Monday', startTime: '08:00', endTime: '16:00' }]
        });
    };

    const removeSlot = (index) => {
        const newSlots = [...formData.slots];
        newSlots.splice(index, 1);
        setFormData({ ...formData, slots: newSlots });
    };

    useEffect(() => {
        fetchShift();
    }, [id]);

    const fetchShift = async () => {
        setIsFetching(true);
        try {
            const [shiftRes, deptsRes] = await Promise.all([
                getShiftByIdAPI(id),
                getAllDepartmentsAPI()
            ]);

            if (deptsRes.success) setDepartments(deptsRes.departments);

            if (shiftRes.success) {
                const shift = shiftRes.shift;
                // Map existing slots to handle the rename from dayOfWeek to startDayOfWeek/endDayOfWeek
                const mappedSlots = (shift.slots || []).map(s => ({
                    ...s,
                    startDayOfWeek: s.startDayOfWeek || s.dayOfWeek || 'Monday',
                    endDayOfWeek: s.endDayOfWeek || s.dayOfWeek || 'Monday',
                }));

                setFormData({
                    name: shift.name,
                    departmentId: shift.departmentId || '',
                    slots: mappedSlots
                });
            }
        } catch (error) {
            console.error("Failed to load shift:", error);
            toast.error("Failed to load shift details");
            navigate('/admin/dashboard/shifts');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Shift name is required";
        if (formData.slots.length === 0) newErrors.slots = "At least one shift slot is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill all required fields");
            return;
        }
        setErrors({});

        const payload = {
            name: formData.name,
            departmentId: formData.departmentId ? Number(formData.departmentId) : null,
            slots: formData.slots.map(s => ({
                startDayOfWeek: s.startDayOfWeek,
                endDayOfWeek: s.endDayOfWeek,
                startTime: s.startTime,
                endTime: s.endTime
            }))
        };

        setIsLoading(true);
        try {
            const response = await updateShiftAPI(id, payload);
            if (response.success) {
                toast.success("Shift updated successfully");
                navigate('/admin/dashboard/shifts');
            }
        } catch (error) {
            console.error("Failed to update shift:", error);
            toast.error(error.message || "Failed to update shift");
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
                    onClick={() => navigate('/admin/dashboard/shifts')}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Edit Shift</h1>
                    <p className="text-slate-500">Modify working hours</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-teal-600" />
                        Shift Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Shift Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`w-full px-4 py-2 bg-slate-50 border ${errors.name ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all`}
                            />
                            {errors.name && <p className="text-xs text-red-500 font-medium mt-1">{errors.name}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <SearchableSelect
                                label="Department (Optional)"
                                value={formData.departmentId}
                                onChange={(val) => setFormData({ ...formData, departmentId: val })}
                                options={departments.map(dept => ({ value: String(dept.id), label: dept.name }))}
                                placeholder="General (All Departments)"
                                searchable={false}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-medium text-slate-700">
                                    Shift Slots <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={addSlot}
                                    className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Slot
                                </button>
                            </div>
                            {errors.slots && <p className="text-xs text-red-500 font-medium mb-4">{errors.slots}</p>}

                            <div className="space-y-4">
                                {formData.slots.map((slot, index) => (
                                    <div key={index} className="flex flex-wrap items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <div className="flex-1 min-w-[120px]">
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Start Day</label>
                                            <SearchableSelect
                                                value={slot.startDayOfWeek}
                                                onChange={(val) => handleSlotChange(index, 'startDayOfWeek', val)}
                                                options={DAYS.map(day => ({ value: day, label: day }))}
                                                searchable={false}
                                                placeholder="Start Day"
                                            />
                                        </div>

                                        <div className="w-[135px]">
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Start Time</label>
                                            <TimePicker
                                                value={slot.startTime}
                                                onChange={(val) => handleSlotChange(index, 'startTime', val)}
                                                className="w-full"
                                                inputClassName="px-3 py-3 rounded-lg"
                                                icon={null}
                                            />
                                        </div>
                                            <div className="flex-1 min-w-[120px]">
                                            <label className="block text-xs font-medium text-slate-500 mb-1">End Day</label>
                                            <SearchableSelect
                                                value={slot.endDayOfWeek}
                                                onChange={(val) => handleSlotChange(index, 'endDayOfWeek', val)}
                                                options={DAYS.map(day => ({ value: day, label: day }))}
                                                searchable={false}
                                                placeholder="End Day"
                                            />
                                        </div>
                                        <div className="w-[135px]">
                                            <label className="block text-xs font-medium text-slate-500 mb-1">End Time</label>
                                            <TimePicker
                                                value={slot.endTime}
                                                onChange={(val) => handleSlotChange(index, 'endTime', val)}
                                                className="w-full"
                                                inputClassName="px-3 py-3 rounded-lg"
                                                icon={null}
                                            />
                                        </div>

                                        <div className="w-[100px]">
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Duration</label>
                                            <div className="px-3 py-2 bg-teal-50 border border-teal-100 rounded-lg text-teal-700 text-sm font-semibold truncate">
                                                {calculateDuration(slot.startDayOfWeek, slot.endDayOfWeek, slot.startTime, slot.endTime)}
                                            </div>
                                        </div>

                                        {formData.slots.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeSlot(index)}
                                                className="mt-5 p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove slot"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-xl hover:bg-teal-700 transition-all font-bold disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20"
                    >
                        {isLoading ? (
                            <>
                                <LoadingPlaceholder className="h-5" colorClass="text-white" />
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditShift;

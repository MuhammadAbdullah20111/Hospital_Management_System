import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    User,
    Mail,
    Phone,
    ShieldCheck,
    Clock,
    Building2,
    ArrowLeft,
    Save,
    CheckCircle2,
    ChevronDown,
    Currency,
    Wallet,
    Fingerprint
} from 'lucide-react';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import LoadingPlaceholder from '../../../components/ui/LoadingPlaceholder';
import toast from 'react-hot-toast';
import {
    getStaffByIdAPI,
    updateStaffAPI,
    getAllRolesAPI,
    getAllShiftsAPI,
    getAllDepartmentsAPI
} from '../../../api/admin/staff';

const EditStaff = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [rolesRes, shiftsRes, deptsRes, staffRes] = await Promise.all([
                    getAllRolesAPI(),
                    getAllShiftsAPI(),
                    getAllDepartmentsAPI(),
                    getStaffByIdAPI(id)
                ]);

                if (rolesRes.success) setRoles(rolesRes.roles);
                if (shiftsRes.success) setShifts(shiftsRes.shifts);
                if (deptsRes.success) setDepartments(deptsRes.departments);

                if (staffRes.success) {
                    const s = staffRes.staff;
                    formik.setValues({
                        name: s.name || '',
                        email: s.email || '',
                        phoneNumber: s.phoneNumber || '',
                        roleId: s.roleId || '',
                        shiftId: s.shiftId || '',
                        departmentId: s.departmentId || '',
                        isActive: s.isActive ?? true,
                        consultationFee: s.consultationFee || 0,
                        consultationDuration: s.consultationDuration || 15,
                        biometricPin: s.biometricPin || ''
                    });
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast.error("Failed to load staff details or associated data");
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchData();
    }, [id]);

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            phoneNumber: '',
            roleId: '',
            shiftId: '',
            departmentId: '',
            isActive: true,
            consultationFee: 0,
            consultationDuration: 15,
            biometricPin: ''
        },
        validationSchema: Yup.object({
            name: Yup.string()
                .min(2, 'Name must be at least 2 characters')
                .required('Name is required'),
            email: Yup.string()
                .email('Invalid email address')
                .required('Email is required'),
            phoneNumber: Yup.string()
                .matches(/^03[0-9]{9}$/, 'Must be a valid 11-digit Pakistani phone number starting with 03')
                .required('Phone number is required'),
            roleId: Yup.string().required('Role is required'),
            shiftId: Yup.string().required('Work shift is required'),
            departmentId: Yup.string().optional().nullable(),
            isActive: Yup.boolean().required(),
            consultationFee: Yup.number().min(0, 'Cannot be negative').optional(),
            consultationDuration: Yup.number().min(5, 'Min 5 mins').optional(),
            biometricPin: Yup.string()
                .matches(/^[0-9]+$/, 'Biometric PIN must contain only numbers')
                .required('Biometric PIN is required')
        }),
        onSubmit: async (values) => {
            setIsUpdating(true);
            try {
                const response = await updateStaffAPI(id, {
                    ...values,
                    roleId: Number(values.roleId),
                    shiftId: values.shiftId ? Number(values.shiftId) : null,
                    departmentId: values.departmentId ? Number(values.departmentId) : null,
                    biometricPin: values.biometricPin
                });

                if (response.success) {
                    toast.success('Staff member updated successfully!');
                    navigate('/admin/dashboard/staff');
                }
            } catch (error) {
                console.error("Staff update failed:", error);
                toast.error(error.message || "Failed to update staff member");
            } finally {
                setIsUpdating(false);
            }
        },
    });

    // Filter shifts based on selected department (Exclusive filtering)
    const filteredShifts = formik.values.departmentId 
        ? shifts.filter(shift => shift.departmentId && String(shift.departmentId) === String(formik.values.departmentId))
        : shifts;

    // Reset shiftId if selected department changes and current shift is not in filtered list
    useEffect(() => {
        if (formik.values.shiftId && formik.values.departmentId) {
            const currentShift = shifts.find(s => s.id === Number(formik.values.shiftId));
            if (currentShift && currentShift.departmentId && currentShift.departmentId !== Number(formik.values.departmentId)) {
                // If it's a manual change (not during initial load)
                if (!isLoadingData) {
                    formik.setFieldValue('shiftId', '');
                }
            }
        }
    }, [formik.values.departmentId, shifts, isLoadingData]);

    const selectedRoleName = roles.find(r => String(r.id) === String(formik.values.roleId))?.name;
    const isDoctor = selectedRoleName === 'DOCTOR';

    const roleOptions = roles.map(role => ({ value: role.id, label: role.name }));
    const departmentOptions = departments.map(dept => ({ value: dept.id, label: dept.name }));
    const shiftOptions = filteredShifts.map(shift => {
        const formatTime = (timeStr) => {
            if (!timeStr) return "";
            const [hours, minutes] = timeStr.split(':').map(Number);
            const p = hours >= 12 ? 'PM' : 'AM';
            const h = hours % 12 || 12;
            return `${h}:${minutes.toString().padStart(2, '0')} ${p}`;
        };

        let summary = 'No Slots';
        if (shift.slots && shift.slots.length > 0) {
            const slotStrings = shift.slots.slice(0, 2).map(s => {
                const start = s.startDayOfWeek.substring(0, 3);
                const end = s.endDayOfWeek.substring(0, 3);
                const days = start === end ? start : `${start}-${end}`;
                return `${days} | ${formatTime(s.startTime)}`;
            });
            summary = slotStrings.join(', ') + (shift.slots.length > 2 ? '...' : '');
        }

        return { value: shift.id, label: `${shift.name} (${summary})` };
    });


    if (isLoadingData) {
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
                        Back to Staff List
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900">Edit Staff Member</h1>
                    <p className="text-slate-500">Update the profile and assignment details for {formik.values.name}.</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={formik.handleSubmit} className="bg-white rounded-2xl border border-teal-100 shadow-sm p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <User className="w-4 h-4 text-teal-600" />
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. John Doe"
                            className={`w-full px-4 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${formik.touched.name && formik.errors.name
                                ? 'border-red-500 focus:ring-red-500/20'
                                : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                                }`}
                            {...formik.getFieldProps('name')}
                        />
                        {formik.touched.name && formik.errors.name && (
                            <p className="text-xs text-red-500 font-medium">{formik.errors.name}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-teal-600" />
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            placeholder="john@example.com"
                            className={`w-full px-4 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${formik.touched.email && formik.errors.email
                                ? 'border-red-500 focus:ring-red-500/20'
                                : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                                }`}
                            {...formik.getFieldProps('email')}
                        />
                        {formik.touched.email && formik.errors.email && (
                            <p className="text-xs text-red-500 font-medium">{formik.errors.email}</p>
                        )}
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-teal-600" />
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. 03214567890"
                            className={`w-full px-4 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${formik.touched.phoneNumber && formik.errors.phoneNumber
                                ? 'border-red-500 focus:ring-red-500/20'
                                : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                                }`}
                            {...formik.getFieldProps('phoneNumber')}
                        />
                        {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                            <p className="text-xs text-red-500 font-medium">{formik.errors.phoneNumber}</p>
                        )}
                    </div>

                    {/* Biometric User PIN */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Fingerprint className="w-4 h-4 text-teal-600" />
                            Biometric Device PIN <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="biometricPin"
                            placeholder="e.g. 1001"
                            className={`w-full px-4 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${formik.touched.biometricPin && formik.errors.biometricPin
                                ? 'border-red-500 focus:ring-red-500/20'
                                : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                                }`}
                            {...formik.getFieldProps('biometricPin')}
                        />
                        {formik.touched.biometricPin && formik.errors.biometricPin && (
                            <p className="text-xs text-red-500 font-medium">{formik.errors.biometricPin}</p>
                        )}
                    </div>

                    {/* Role Dropdown */}
                    <div className="space-y-2">
                        <SearchableSelect
                            label="Assign Role"
                            options={roleOptions}
                            value={formik.values.roleId}
                            onChange={(val) => formik.setFieldValue('roleId', val)}
                            placeholder="Select Role"
                            searchable={false}
                            icon={ShieldCheck}
                        />
                        {formik.touched.roleId && formik.errors.roleId && (
                            <p className="text-xs text-red-500 font-medium">{formik.errors.roleId}</p>
                        )}
                    </div>

                    {/* Department Dropdown */}
                    <div className="space-y-2">
                        <SearchableSelect
                            label="Department"
                            options={departmentOptions}
                            value={formik.values.departmentId}
                            onChange={(val) => formik.setFieldValue('departmentId', val)}
                            placeholder="Select Department"
                            searchable={false}
                            icon={Building2}
                        />
                        {formik.touched.departmentId && formik.errors.departmentId && (
                            <p className="text-xs text-red-500 font-medium">{formik.errors.departmentId}</p>
                        )}
                    </div>

                    {/* Shift Dropdown */}
                    <div className="space-y-2">
                        <SearchableSelect
                            label="Work Shift"
                            options={shiftOptions}
                            value={formik.values.shiftId}
                            onChange={(val) => formik.setFieldValue('shiftId', val)}
                            placeholder="Select Shift"
                            searchable={false}
                            icon={Clock}
                        />
                        {formik.touched.shiftId && formik.errors.shiftId && (
                            <p className="text-xs text-red-500 font-medium">{formik.errors.shiftId}</p>
                        )}
                    </div>

                    {/* Doctor-Specific Fields */}
                    {isDoctor && (
                        <>
                            {/* Consultation Fee */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Wallet className="w-4 h-4 text-teal-600" />
                                    Consultation Fee (Rs)
                                </label>
                                <input
                                    type="number"
                                    name="consultationFee"
                                    placeholder="e.g. 1500"
                                    className={`w-full px-4 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${formik.touched.consultationFee && formik.errors.consultationFee
                                        ? 'border-red-500 focus:ring-red-500/20'
                                        : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                                        }`}
                                    {...formik.getFieldProps('consultationFee')}
                                />
                                {formik.touched.consultationFee && formik.errors.consultationFee && (
                                    <p className="text-xs text-red-500 font-medium">{formik.errors.consultationFee}</p>
                                )}
                            </div>

                            {/* Consultation Duration */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-teal-600" />
                                    Slot Duration (Mins)
                                </label>
                                <input
                                    type="number"
                                    name="consultationDuration"
                                    placeholder="e.g. 15"
                                    className={`w-full px-4 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${formik.touched.consultationDuration && formik.errors.consultationDuration
                                        ? 'border-red-500 focus:ring-red-500/20'
                                        : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                                        }`}
                                    {...formik.getFieldProps('consultationDuration')}
                                />
                                {formik.touched.consultationDuration && formik.errors.consultationDuration && (
                                    <p className="text-xs text-red-500 font-medium">{formik.errors.consultationDuration}</p>
                                )}
                            </div>
                        </>
                    )}

                    {/* Status Toggle */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-teal-600" />
                            Account Status
                        </label>
                        <div className="flex items-center gap-4 h-11">
                            <div 
                                onClick={() => formik.setFieldValue('isActive', true)}
                                className="flex items-center gap-2 cursor-pointer group"
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formik.values.isActive === true ? 'border-teal-600 bg-teal-600' : 'border-slate-300 group-hover:border-teal-400'}`}>
                                    {formik.values.isActive === true && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <span className={`font-medium ${formik.values.isActive === true ? 'text-teal-700' : 'text-slate-500'}`}>Active</span>
                            </div>

                            <div 
                                onClick={() => formik.setFieldValue('isActive', false)}
                                className="flex items-center gap-2 cursor-pointer group"
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formik.values.isActive === false ? 'border-red-500 bg-red-500' : 'border-slate-300 group-hover:border-red-400'}`}>
                                    {formik.values.isActive === false && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <span className={`font-medium ${formik.values.isActive === false ? 'text-red-700' : 'text-slate-500'}`}>Inactive</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isUpdating}
                        onClick={() => {
                            if (Object.keys(formik.errors).length > 0) {
                                toast.error("Please fill all required fields");
                            }
                        }}
                        className="flex items-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-xl font-bold transition-all shadow-sm hover:shadow-md h-12 min-w-[170px] justify-center"
                    >
                        {isUpdating ? (
                            <LoadingPlaceholder className="w-5 h-5" colorClass="text-white" />
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Update Staff Info
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditStaff;

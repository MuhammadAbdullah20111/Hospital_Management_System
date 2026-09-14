import { useState, useEffect } from "react";
import { User, Mail, Phone, Lock, Save, Key, Fingerprint, Send, Eye, EyeOff, Camera, Trash2 } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { getAdminProfileAPI, updateAdminProfileAPI, requestAdminPasswordOTPAPI, uploadAdminProfileImageAPI, deleteAdminProfileImageAPI, toggleAdmin2FAAPI } from "../../api/admin/auth";
import LoadingPlaceholder from "../../components/ui/LoadingPlaceholder";

const Profile = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [isToggling2FA, setIsToggling2FA] = useState(false);

    const profileSchema = Yup.object().shape({
        name: Yup.string().required("Name is required"),
        email: Yup.string().email("Invalid email").required("Email is required"),
        phoneNumber: Yup.string().nullable(),
    });

    const passwordSchema = Yup.object().shape({
        newPassword: Yup.string().min(6, "Password must be at least 6 characters").required("New password is required"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
            .required('Confirm password is required'),
        otp: Yup.string().length(6, "OTP must be 6 digits").required("Required"),
    });

    const profileForm = useFormik({
        initialValues: {
            name: "",
            email: "",
            phoneNumber: "",
        },
        validationSchema: profileSchema,
        onSubmit: async (values) => {
            setIsSaving(true);
            try {
                const response = await updateAdminProfileAPI(values);
                if (response.success) {
                    toast.success("Profile updated");
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Error updating profile");
            } finally {
                setIsSaving(false);
            }
        },
    });

    const passwordForm = useFormik({
        initialValues: {
            newPassword: "",
            confirmPassword: "",
            otp: "",
        },
        validationSchema: passwordSchema,
        onSubmit: async (values, { resetForm }) => {
            setIsSaving(true);
            try {
                const response = await updateAdminProfileAPI({
                    password: values.newPassword,
                    otp: values.otp
                });
                if (response.success) {
                    toast.success("Password updated");
                    resetForm();
                    setIsOtpSent(false);
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Error updating password");
            } finally {
                setIsSaving(false);
            }
        },
    });

    const handleRequestOTP = async () => {
        setIsSaving(true);
        try {
            const response = await requestAdminPasswordOTPAPI();
            if (response.success) {
                toast.success("OTP sent");
                setIsOtpSent(true);
                setCountdown(60);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error sending OTP");
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getAdminProfileAPI();
                if (response.success) {
                    setProfileImage(response.admin.profileImage || null);
                    profileForm.setValues({
                        name: response.admin.name || "",
                        email: response.admin.email || "",
                        phoneNumber: response.admin.phoneNumber || "",
                    });
                    setIs2FAEnabled(response.admin.isTwoFactorEnabled || false);
                }
            } catch (error) {
                toast.error("Error loading profile");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error("Please upload an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append("profileImage", file);

        try {
            const response = await uploadAdminProfileImageAPI(formData);
            if (response.success) {
                toast.success("Profile image updated");
                setProfileImage(response.data?.profileImage || response.profileImage);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error uploading image");
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleDeleteImage = async () => {
        if (!window.confirm("Are you sure you want to delete your profile picture?")) return;
        
        setIsUploadingImage(true);
        try {
            const response = await deleteAdminProfileImageAPI();
            if (response.success) {
                toast.success("Profile image deleted");
                setProfileImage(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error deleting image");
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleToggle2FA = async () => {
        setIsToggling2FA(true);
        try {
            const newValue = !is2FAEnabled;
            const response = await toggleAdmin2FAAPI({ enable: newValue });
            if (response.success) {
                setIs2FAEnabled(newValue);
                toast.success(response.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error toggling 2FA");
        } finally {
            setIsToggling2FA(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <LoadingPlaceholder className="h-10 w-10" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-semibold text-slate-800 mb-8">Account Settings</h1>

            <div className="space-y-12">
                {/* Personal Info Section */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-medium text-slate-900">Personal Information</h2>
                        <p className="text-sm text-slate-500 mt-1">Update your basic account details and profile picture.</p>
                        
                        <div className="mt-6 flex flex-col items-center sm:items-start">
                            <div className="relative group">
                                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 flex items-center justify-center">
                                    {profileImage ? (
                                        <img src={profileImage.startsWith('http') ? profileImage : `${import.meta.env.VITE_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${profileImage}`} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-16 w-16 text-slate-400" />
                                    )}
                                </div>
                                <label className={`absolute bottom-0 right-0 p-2 rounded-full bg-teal-600 text-white shadow-md cursor-pointer hover:bg-teal-700 transition-colors ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <Camera className="h-5 w-5" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
                                </label>
                                {profileImage && (
                                    <button 
                                        type="button"
                                        onClick={handleDeleteImage}
                                        disabled={isUploadingImage}
                                        className="absolute top-0 right-0 p-1.5 rounded-full bg-red-500 text-white shadow-sm cursor-pointer hover:bg-red-600 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <p className="mt-3 text-xs text-slate-500 max-w-[150px] text-center sm:text-left">Recommended size: 256x256px.<br/>Max 5MB.</p>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <form onSubmit={profileForm.handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        {...profileForm.getFieldProps('name')}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none transition-colors"
                                    />
                                    {profileForm.touched.name && profileForm.errors.name && (
                                        <p className="mt-1 text-xs text-red-500">{profileForm.errors.name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        {...profileForm.getFieldProps('phoneNumber')}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none transition-colors"
                                    />
                                    {profileForm.touched.phoneNumber && profileForm.errors.phoneNumber && (
                                        <p className="text-xs text-red-500 font-medium mt-1">{profileForm.errors.phoneNumber}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    {...profileForm.getFieldProps('email')}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none transition-colors bg-slate-50"
                                />
                                {profileForm.touched.email && profileForm.errors.email && (
                                    <p className="mt-1 text-xs text-red-500">{profileForm.errors.email}</p>
                                )}
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50 transition-colors"
                                >
                                    {isSaving ? (
                                        <LoadingPlaceholder className="h-5 w-5" colorClass="text-white" />
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* Password Section */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h2 className="text-lg font-medium text-slate-900">Security</h2>
                        <p className="text-sm text-slate-500 mt-1">Change your password and verify identity.</p>
                    </div>
                    <div className="md:col-span-2">
                        <form onSubmit={passwordForm.handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="newPassword"
                                            {...passwordForm.getFieldProps('newPassword')}
                                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none transition-colors"
                                            placeholder="••••••••"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-teal-600 focus:outline-none"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {passwordForm.touched.newPassword && passwordForm.errors.newPassword && (
                                        <p className="mt-1 text-xs text-red-500">{passwordForm.errors.newPassword}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            {...passwordForm.getFieldProps('confirmPassword')}
                                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none transition-colors"
                                            placeholder="••••••••"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-teal-600 focus:outline-none"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {passwordForm.touched.confirmPassword && passwordForm.errors.confirmPassword && (
                                        <p className="mt-1 text-xs text-red-500">{passwordForm.errors.confirmPassword}</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Email Verification</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="otp"
                                        {...passwordForm.getFieldProps('otp')}
                                        disabled={!isOtpSent}
                                        className={`flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none transition-colors ${!isOtpSent ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
                                        placeholder="Enter 6-digit code"
                                    />

                                    <button
                                        type="button"
                                        onClick={handleRequestOTP}
                                        disabled={countdown > 0 || isSaving}
                                        className="px-4 py-2 text-xs font-semibold text-teal-600 bg-white border border-teal-200 rounded-md hover:bg-teal-50 hover:border-teal-300 disabled:opacity-50 transition-all"
                                    >
                                        {countdown > 0 ? `Resend in ${countdown}s` : (isOtpSent ? 'Resend code' : 'Get code')}
                                    </button>
                                </div>
                                {passwordForm.touched.otp && passwordForm.errors.otp && (
                                    <p className="mt-1 text-xs text-red-500">{passwordForm.errors.otp}</p>
                                )}
                            </div>

                            <div className="bg-slate-50 p-4 rounded-md border border-slate-200 mt-5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-slate-700">Two-Factor Authentication (2FA)</h3>
                                    <p className="text-xs text-slate-500 mt-1">Require an OTP sent to your email when logging in.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleToggle2FA}
                                    disabled={isToggling2FA}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 ${is2FAEnabled ? 'bg-teal-600' : 'bg-slate-200'} ${isToggling2FA ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${is2FAEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSaving || !isOtpSent}
                                    className="rounded-md bg-slate-800 px-6 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-50 transition-colors"
                                >
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Profile;

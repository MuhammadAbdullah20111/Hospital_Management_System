import ApiService from "../../services/ApiService";

export const adminLoginAPI = async (credentials) => {
    try {
        return await ApiService.post("/admin/auth/login", credentials);
    } catch (error) {
        throw error;
    }
};

export const adminLogoutAPI = async () => {
    return await ApiService.post("/admin/auth/logout");
};

export const getAdminProfileAPI = async () => {
    return await ApiService.get("/admin/auth/profile");
};

export const updateAdminProfileAPI = async (data) => {
    return await ApiService.put("/admin/auth/profile", data);
};

export const adminForgotPasswordAPI = async (data) => {
    return await ApiService.post("/admin/auth/forgot-password", data);
};

export const adminResetPasswordAPI = async (data) => {
    return await ApiService.post("/admin/auth/reset-password", data);
};

export const requestAdminPasswordOTPAPI = async () => {
    return await ApiService.post("/admin/auth/request-password-otp");
};

export const uploadAdminProfileImageAPI = async (formData) => {
    return await ApiService.post("/admin/auth/profile/image", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const deleteAdminProfileImageAPI = async () => {
    return await ApiService.delete("/admin/auth/profile/image");
};

export const toggleAdmin2FAAPI = async (data) => {
    return await ApiService.post("/admin/auth/toggle-2fa", data);
};

export const verifyAdmin2FAAPI = async (data) => {
    return await ApiService.post("/admin/auth/verify-2fa", data);
};

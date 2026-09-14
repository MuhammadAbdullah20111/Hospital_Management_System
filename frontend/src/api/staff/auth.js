import ApiService from "../../services/ApiService";

export const staffLoginAPI = async (credentials) => {
    try {
        return await ApiService.post("/staff/auth/login", credentials);
    } catch (error) {
        throw error;
    }
};

export const staffForgotPasswordAPI = async (data) => {
    return await ApiService.post("/staff/auth/forgot-password", data);
};

export const staffResetPasswordAPI = async (data) => {
    return await ApiService.post("/staff/auth/reset-password", data);
};

export const getStaffProfileAPI = async () => {
    return await ApiService.get("/staff/auth/profile");
};

export const updateStaffProfileAPI = async (data) => {
    return await ApiService.put("/staff/auth/profile", data);
};

export const requestStaffPasswordOTPAPI = async () => {
    return await ApiService.post("/staff/auth/request-password-otp");
};

export const uploadStaffProfileImageAPI = async (formData) => {
    return await ApiService.post("/staff/auth/profile/image", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const deleteStaffProfileImageAPI = async () => {
    return await ApiService.delete("/staff/auth/profile/image");
};

export const toggleStaff2FAAPI = async (data) => {
    return await ApiService.post("/staff/auth/toggle-2fa", data);
};

export const verifyStaff2FAAPI = async (data) => {
    return await ApiService.post("/staff/auth/verify-2fa", data);
};


import ApiService from "../../services/ApiService";

export const getAllPermissionsAPI = async () => {
    try {
        return await ApiService.get("/admin/permissions");
    } catch (error) {
        throw error;
    }
};

import ApiService from "../../services/ApiService";

export const getAdminLayoutAPI = async () => {
    try {
        return await ApiService.get("/admin/layout");
    } catch (error) {
        throw error;
    }
};

import ApiService from "../../services/ApiService";

export const getAdminHomeAPI = async () => {
    try {
        return await ApiService.get("/admin/home");
    } catch (error) {
        throw error;
    }
};

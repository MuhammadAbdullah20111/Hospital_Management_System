import ApiService from "../../services/ApiService";

export const getStaffLayoutAPI = async () => {
    try {
        return await ApiService.get("/staff/layout");
    } catch (error) {
        throw error;
    }
};

import ApiService from "../../services/ApiService";

export const getStaffHomeAPI = async () => {
    try {
        return await ApiService.get("/staff/home");
    } catch (error) {
        throw error;
    }
};

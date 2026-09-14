import ApiService from "../../services/ApiService";

export const getServicesAPI = async () => {
    try {
        return await ApiService.get("/web/services");
    } catch (error) {
        throw error;
    }
};

export const getDoctorsAPI = async () => {
    try {
        return await ApiService.get("/web/doctors");
    } catch (error) {
        throw error;
    }
};

export const submitContactAPI = async (data) => {
    try {
        return await ApiService.post("/contact", data);
    } catch (error) {
        throw error;
    }
};

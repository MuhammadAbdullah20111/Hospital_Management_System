import ApiService from "../../services/ApiService";

export const getAllShiftsAPI = async () => {
    try {
        return await ApiService.get("/admin/shifts");
    } catch (error) {
        throw error;
    }
};

export const getShiftByIdAPI = async (id) => {
    try {
        return await ApiService.get(`/admin/shifts/${id}`);
    } catch (error) {
        throw error;
    }
};

export const createShiftAPI = async (data) => {
    try {
        return await ApiService.post("/admin/shifts", data);
    } catch (error) {
        throw error;
    }
};

export const updateShiftAPI = async (id, data) => {
    try {
        return await ApiService.put(`/admin/shifts/${id}`, data);
    } catch (error) {
        throw error;
    }
};

export const deleteShiftAPI = async (id) => {
    try {
        return await ApiService.delete(`/admin/shifts/${id}`);
    } catch (error) {
        throw error;
    }
};

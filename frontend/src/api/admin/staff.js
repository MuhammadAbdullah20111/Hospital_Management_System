import ApiService from "../../services/ApiService";

export const getAllStaffAPI = async () => {
    try {
        return await ApiService.get("/admin/staff");
    } catch (error) {
        throw error;
    }
};

export const createStaffAPI = async (data) => {
    try {
        return await ApiService.post("/admin/staff", data);
    } catch (error) {
        throw error;
    }
};

export const getAllRolesAPI = async () => {
    try {
        return await ApiService.get("/admin/roles");
    } catch (error) {
        throw error;
    }
};

export const getAllShiftsAPI = async () => {
    try {
        return await ApiService.get("/admin/shifts");
    } catch (error) {
        throw error;
    }
};

export const getAllDepartmentsAPI = async () => {
    try {
        return await ApiService.get("/admin/departments");
    } catch (error) {
        throw error;
    }
};

export const getStaffByIdAPI = async (id) => {
    try {
        return await ApiService.get(`/admin/staff/${id}`);
    } catch (error) {
        throw error;
    }
};

export const updateStaffAPI = async (id, data) => {
    try {
        return await ApiService.put(`/admin/staff/${id}`, data);
    } catch (error) {
        throw error;
    }
};

export const deleteStaffAPI = async (id) => {
    try {
        return await ApiService.delete(`/admin/staff/${id}`);
    } catch (error) {
        throw error;
    }
};

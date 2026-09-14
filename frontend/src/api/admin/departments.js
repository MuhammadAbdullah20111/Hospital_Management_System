import ApiService from "../../services/ApiService";

export const getAllDepartmentsAPI = async () => {
    try {
        return await ApiService.get("/admin/departments");
    } catch (error) {
        throw error;
    }
};

export const getDepartmentByIdAPI = async (id) => {
    try {
        return await ApiService.get(`/admin/departments/${id}`);
    } catch (error) {
        throw error;
    }
};

export const createDepartmentAPI = async (data) => {
    try {
        return await ApiService.post("/admin/departments", data);
    } catch (error) {
        throw error;
    }
};

export const updateDepartmentAPI = async (id, data) => {
    try {
        return await ApiService.put(`/admin/departments/${id}`, data);
    } catch (error) {
        throw error;
    }
};

export const deleteDepartmentAPI = async (id) => {
    try {
        return await ApiService.delete(`/admin/departments/${id}`);
    } catch (error) {
        throw error;
    }
};

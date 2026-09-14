import ApiService from "../../services/ApiService";

export const getAllRolesAPI = async () => {
    try {
        return await ApiService.get("/admin/roles");
    } catch (error) {
        throw error;
    }
};

export const getRoleByIdAPI = async (id) => {
    try {
        return await ApiService.get(`/admin/roles/${id}`);
    } catch (error) {
        throw error;
    }
};

export const createRoleAPI = async (data) => {
    try {
        return await ApiService.post("/admin/roles", data);
    } catch (error) {
        throw error;
    }
};

export const updateRoleAPI = async (id, data) => {
    try {
        return await ApiService.put(`/admin/roles/${id}`, data);
    } catch (error) {
        throw error;
    }
};

export const deleteRoleAPI = async (id, replacementRoleId = null) => {
    try {
        const data = replacementRoleId ? { replacementRoleId } : undefined;
        return await ApiService.delete(`/admin/roles/${id}`, data);
    } catch (error) {
        throw error;
    }
};

export const getRoleDependenciesAPI = async (id) => {
    try {
        return await ApiService.get(`/admin/roles/${id}/dependencies`);
    } catch (error) {
        throw error;
    }
};

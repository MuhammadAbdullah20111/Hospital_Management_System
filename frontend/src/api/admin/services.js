import ApiService from "../../services/ApiService";

export const getAllServicesAPI = async () => {
    try {
        return await ApiService.get("/admin/services");
    } catch (error) {
        throw error;
    }
};

export const getServiceByIdAPI = async (id) => {
    try {
        return await ApiService.get(`/admin/services/${id}`);
    } catch (error) {
        throw error;
    }
};

export const createServiceAPI = async (formData) => {
    try {
        return await ApiService.postForm("/admin/services", formData);
    } catch (error) {
        throw error;
    }
};

export const updateServiceAPI = async (id, formData) => {
    try {
        return await ApiService.putForm(`/admin/services/${id}`, formData);
    } catch (error) {
        throw error;
    }
};

export const deleteServiceAPI = async (id) => {
    try {
        return await ApiService.delete(`/admin/services/${id}`);
    } catch (error) {
        throw error;
    }
};

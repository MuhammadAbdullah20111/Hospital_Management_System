import ApiService from "../../services/ApiService";

export const getAllTestsAPI = async () => {
    try {
        return await ApiService.get("/admin/tests");
    } catch (error) {
        throw error;
    }
};

export const getTestByIdAPI = async (id) => {
    try {
        return await ApiService.get(`/admin/tests/${id}`);
    } catch (error) {
        throw error;
    }
};

export const createTestAPI = async (testData) => {
    try {
        return await ApiService.post("/admin/tests", testData);
    } catch (error) {
        throw error;
    }
};

export const updateTestAPI = async (id, testData) => {
    try {
        return await ApiService.put(`/admin/tests/${id}`, testData);
    } catch (error) {
        throw error;
    }
};

export const deleteTestAPI = async (id) => {
    try {
        return await ApiService.delete(`/admin/tests/${id}`);
    } catch (error) {
        throw error;
    }
};

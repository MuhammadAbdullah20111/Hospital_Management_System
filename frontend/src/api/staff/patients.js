import ApiService from "../../services/ApiService";

export const getAllPatientsAPI = async () => {
    try {
        return await ApiService.get("/staff/patient");
    } catch (error) {
        throw error;
    }
};

export const getPatientByIdAPI = async (id) => {
    try {
        return await ApiService.get(`/staff/patient/${id}`);
    } catch (error) {
        throw error;
    }
};

export const createPatientAPI = async (data) => {
    try {
        return await ApiService.post("/staff/patient", data);
    } catch (error) {
        throw error;
    }
};

export const getNextMrNumberAPI = async () => {
    try {
        return await ApiService.get("/staff/patient/next-mr-number");
    } catch (error) {
        throw error;
    }
};

export const updatePatientAPI = async (id, data) => {
    try {
        return await ApiService.put(`/staff/patient/${id}`, data);
    } catch (error) {
        throw error;
    }
};

export const deletePatientAPI = async (id) => {
    try {
        return await ApiService.delete(`/staff/patient/${id}`);
    } catch (error) {
        throw error;
    }
};

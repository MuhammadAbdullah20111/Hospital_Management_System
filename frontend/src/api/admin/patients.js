import ApiService from "../../services/ApiService";

const getEndpoint = (path) => {
    const userType = localStorage.getItem('userType');

    if (userType === 'SYSTEM_ADMIN') {
        return `/admin/${path === 'patient' ? 'patients' : path}`;
    }
    return `/staff/${path}`;
};

export const getAllPatientsAPI = async (params = {}) => {
    return await ApiService.getWithParams(getEndpoint("patient"), params);
};

export const getPatientByIdAPI = async (id) => {
    return await ApiService.get(`${getEndpoint("patient")}/${id}`);
};

export const createPatientAPI = async (data) => {
    return await ApiService.post(getEndpoint("patient"), data);
};

export const updatePatientAPI = async (id, data) => {
    return await ApiService.put(`${getEndpoint("patient")}/${id}`, data);
};

export const deletePatientAPI = async (id) => {
    return await ApiService.delete(`${getEndpoint("patient")}/${id}`);
};

export const getNextMrNumberAPI = async () => {
    return await ApiService.get(`${getEndpoint("patient")}/next-mr-number`);
};

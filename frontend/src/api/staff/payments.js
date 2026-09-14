import ApiService from "../../services/ApiService";

export const createPaymentAPI = async (data) => {
    return await ApiService.post("/staff/payment", data);
};

export const getAllPaymentsAPI = async (params) => {
    return await ApiService.getWithParams("/staff/payment", params);
};

export const getPaymentByIdAPI = async (id) => {
    return await ApiService.get(`/staff/payment/${id}`);
};

export const updatePaymentAPI = async (id, data) => {
    return await ApiService.put(`/staff/payment/${id}`, data);
};

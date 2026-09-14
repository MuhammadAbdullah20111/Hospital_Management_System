import ApiService from "../../services/ApiService";

const getEndpoint = (path) => {
    const userType = localStorage.getItem('userType');

    if (userType === 'SYSTEM_ADMIN') {
        return `/admin/${path === 'payment' ? 'payments' : path}`;
    }
    return `/staff/${path}`;
};

export const getAllPaymentsAPI = async () => {
    return await ApiService.get(getEndpoint("payment"));
};

export const getPaymentByIdAPI = async (id) => {
    return await ApiService.get(`${getEndpoint("payment")}/${id}`);
};

export const createPaymentAPI = async (data) => {
    return await ApiService.post(getEndpoint("payment"), data);
};

export const updatePaymentAPI = async (id, data) => {
    return await ApiService.put(`${getEndpoint("payment")}/${id}`, data);
};

export const deletePaymentAPI = async (id) => {
    return await ApiService.delete(`${getEndpoint("payment")}/${id}`);
};

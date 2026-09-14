import ApiService from "../../services/ApiService";

const getEndpoint = (path) => {
    const userType = localStorage.getItem('userType');

    if (userType === 'SYSTEM_ADMIN') {
        return `/admin/${path === 'appointment' ? 'appointments' : path}`;
    }
    return `/staff/${path}`;
};

export const getAllAppointmentsAPI = async () => {
    return await ApiService.get(getEndpoint("appointment"));
};

export const getAppointmentByIdAPI = async (id) => {
    return await ApiService.get(`${getEndpoint("appointment")}/${id}`);
};

export const createAppointmentAPI = async (data) => {
    return await ApiService.post(getEndpoint("appointment"), data);
};

export const updateAppointmentAPI = async (id, data) => {
    return await ApiService.put(`${getEndpoint("appointment")}/${id}`, data);
};

export const deleteAppointmentAPI = async (id) => {
    return await ApiService.delete(`${getEndpoint("appointment")}/${id}`);
};

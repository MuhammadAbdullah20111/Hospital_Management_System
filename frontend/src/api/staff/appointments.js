import ApiService from "../../services/ApiService";

export const getDoctorsAPI = async () => {
    try {
        return await ApiService.get("/staff/staff/doctors");
    } catch (error) {
        throw error;
    }
};

export const getAllAppointmentsAPI = async () => {
    try {
        return await ApiService.get("/staff/appointment");
    } catch (error) {
        throw error;
    }
};

export const createAppointmentAPI = async (data) => {
    try {
        return await ApiService.post("/staff/appointment", data);
    } catch (error) {
        throw error;
    }
};

export const getAppointmentByIdAPI = async (id) => {
    try {
        return await ApiService.get(`/staff/appointment/${id}`);
    } catch (error) {
        throw error;
    }
};

export const updateAppointmentAPI = async (id, data) => {
    try {
        return await ApiService.put(`/staff/appointment/${id}`, data);
    } catch (error) {
        throw error;
    }
};

export const deleteAppointmentAPI = async (id) => {
    try {
        return await ApiService.delete(`/staff/appointment/${id}`);
    } catch (error) {
        throw error;
    }
};

// Clinical API
export const createPrescriptionAPI = async (data) => {
    try {
        return await ApiService.post("/staff/clinical/prescription", data);
    } catch (error) {
        throw error;
    }
};

export const getPatientHistoryAPI = async (patientId) => {
    try {
        return await ApiService.get(`/staff/clinical/patient-history/${patientId}`);
    } catch (error) {
        throw error;
    }
};

export const getPrescriptionByAppointmentIdAPI = async (appointmentId) => {
    try {
        return await ApiService.get(`/staff/clinical/prescription/appointment/${appointmentId}`);
    } catch (error) {
        throw error;
    }
};

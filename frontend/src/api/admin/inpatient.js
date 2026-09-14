import ApiService from "../../services/ApiService";

// Wards
export const getAllWardsAPI = async () => {
    try {
        return await ApiService.get("/admin/wards");
    } catch (error) {
        throw error;
    }
};

export const getWardByIdAPI = async (id) => {
    try {
        return await ApiService.get(`/admin/wards/${id}`);
    } catch (error) {
        throw error;
    }
};

export const createWardAPI = async (data) => {
    try {
        return await ApiService.post("/admin/wards", data);
    } catch (error) {
        throw error;
    }
};

export const updateWardAPI = async (id, data) => {
    try {
        return await ApiService.put(`/admin/wards/${id}`, data);
    } catch (error) {
        throw error;
    }
};

export const deleteWardAPI = async (id) => {
    try {
        return await ApiService.delete(`/admin/wards/${id}`);
    } catch (error) {
        throw error;
    }
};

// Rooms
export const getAllRoomsAPI = async (params = {}) => {
    try {
        return await ApiService.getWithParams("/admin/rooms", params);
    } catch (error) {
        throw error;
    }
};

export const getRoomByIdAPI = async (id) => {
    try {
        return await ApiService.get(`/admin/rooms/${id}`);
    } catch (error) {
        throw error;
    }
};

export const createRoomAPI = async (data) => {
    try {
        return await ApiService.post("/admin/rooms", data);
    } catch (error) {
        throw error;
    }
};

export const updateRoomAPI = async (id, data) => {
    try {
        return await ApiService.put(`/admin/rooms/${id}`, data);
    } catch (error) {
        throw error;
    }
};

export const deleteRoomAPI = async (id) => {
    try {
        return await ApiService.delete(`/admin/rooms/${id}`);
    } catch (error) {
        throw error;
    }
};

// Beds
export const getAllBedsAPI = async (params = {}) => {
    try {
        return await ApiService.getWithParams("/admin/beds", params);
    } catch (error) {
        throw error;
    }
};

export const getBedByIdAPI = async (id) => {
    try {
        return await ApiService.get(`/admin/beds/${id}`);
    } catch (error) {
        throw error;
    }
};

export const createBedAPI = async (data) => {
    try {
        return await ApiService.post("/admin/beds", data);
    } catch (error) {
        throw error;
    }
};

export const updateBedAPI = async (id, data) => {
    try {
        return await ApiService.put(`/admin/beds/${id}`, data);
    } catch (error) {
        throw error;
    }
};

export const deleteBedAPI = async (id) => {
    try {
        return await ApiService.delete(`/admin/beds/${id}`);
    } catch (error) {
        throw error;
    }
};

export const assignBedAPI = async (data) => {
    try {
        return await ApiService.post("/admin/beds/assign", data);
    } catch (error) {
        throw error;
    }
};

export const dischargePatientAPI = async (assignmentId, data) => {
    try {
        return await ApiService.post(`/admin/beds/discharge/${assignmentId}`, data);
    } catch (error) {
        throw error;
    }
};

export const transferPatientAPI = async (data) => {
    try {
        return await ApiService.post("/admin/beds/transfer", data);
    } catch (error) {
        throw error;
    }
};

export const updateBedStatusAPI = async (id, status) => {
    try {
        return await ApiService.patch(`/admin/beds/${id}/status`, { status });
    } catch (error) {
        throw error;
    }
};

// Dashboard
export const getInpatientSummaryAPI = async () => {
    try {
        return await ApiService.get("/admin/inpatient/summary");
    } catch (error) {
        throw error;
    }
};

export const getBedOccupancyAPI = async () => {
    try {
        return await ApiService.get("/admin/inpatient/occupancy");
    } catch (error) {
        throw error;
    }
};

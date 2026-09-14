import ApiService from "../../services/ApiService";

export const getAllDevicesAPI = async () => {
    return ApiService.get("/admin/attendance/devices");
};

export const createDeviceAPI = async (data) => {
    return ApiService.post("/admin/attendance/devices", data);
};

export const updateDeviceAPI = async (id, data) => {
    return ApiService.put(`/admin/attendance/devices/${id}`, data);
};

export const deleteDeviceAPI = async (id) => {
    return ApiService.delete(`/admin/attendance/devices/${id}`);
};

export const testConnectionAPI = async (id) => {
    return ApiService.post(`/admin/attendance/devices/${id}/test`);
};

export const syncDeviceAPI = async (id) => {
    return ApiService.post(`/admin/attendance/devices/${id}/sync`);
};

export const syncAllDevicesAPI = async () => {
    return ApiService.post("/admin/attendance/devices/sync-all");
};

export const getAttendanceLogsAPI = async (params = {}) => {
    return ApiService.getWithParams("/admin/attendance/logs", params);
};

export const getDailySummariesAPI = async (params = {}) => {
    return ApiService.getWithParams("/admin/attendance/summaries", params);
};

export const updateDailySummaryAPI = async (id, data) => {
    return ApiService.put(`/admin/attendance/summaries/${id}`, data);
};

export const getMonthlyReportAPI = async (params = {}) => {
    return ApiService.getWithParams("/admin/attendance/reports/monthly", params);
};

export const simulatePunchAPI = async (data) => {
    return ApiService.post("/admin/attendance/simulate/punch", data);
};

export const clearSimulationLogsAPI = async () => {
    return ApiService.post("/admin/attendance/simulate/clear");
};

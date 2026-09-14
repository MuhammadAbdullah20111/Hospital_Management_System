import apiService from "../../services/ApiService";

export const getFinanceSummaryAPI = async (startDate, endDate) => {
  return await apiService.getWithParams('/admin/finance/transactions/summary', { startDate, endDate });
};

export const getAllTransactionsAPI = async (filters) => {
  return await apiService.getWithParams('/admin/finance/transactions', filters);
};

export const getTransactionCategoriesAPI = async (type) => {
  return await apiService.getWithParams('/admin/finance/categories', { type });
};

export const createTransactionAPI = async (data) => {
  return await apiService.post('/admin/finance/transactions', data);
};

export const getSalaryConfigsAPI = async () => {
  return await apiService.get('/admin/finance/salaries');
};

export const updateSalaryConfigAPI = async (staffId, data) => {
  return await apiService.post(`/admin/finance/salaries/${staffId}`, data);
};

export const generatePayrollAPI = async (data) => {
  return await apiService.post('/admin/finance/salaries/generate-payroll', data);
};

export const getRoomCategoriesAPI = async () => {
  return await apiService.get('/admin/finance/room-categories');
};

export const updateRoomCategoryAPI = async (id, data) => {
  return await apiService.put(`/admin/finance/room-categories/${id}`, data);
};

export const updateTransactionAPI = async (id, data) => {
  return await apiService.put(`/admin/finance/transactions/${id}`, data);
};

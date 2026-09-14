import ApiResponse from "../../utils/ApiResponse.js";
import SalaryRepository from "../../models/Salary.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const getSalaryConfigs = asyncHandler(async (req, res) => {
  const configs = await SalaryRepository.getAllSalaryConfigs();
  return ApiResponse.success(res, "Salary configurations retrieved successfully", { configs });
});

export const upsertSalaryConfig = asyncHandler(async (req, res) => {
  const { staffId } = req.params;
  const config = await SalaryRepository.upsertSalaryConfig(staffId, req.body);
  return ApiResponse.success(res, "Salary configuration updated successfully", { config });
});

export const generatePayroll = asyncHandler(async (req, res) => {
  const { month, year } = req.body;
  if (!month || !year) {
    return ApiResponse.error(res, "Month and year are required", 400);
  }
  const transactions = await SalaryRepository.generatePayroll(month, year);
  return ApiResponse.success(res, `Payroll generated for ${month}/${year}`, { transactions });
});

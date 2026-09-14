import ApiResponse from "../../utils/ApiResponse.js";
import TransactionRepository from "../../models/Transaction.js";
import prisma from "../../config/prismaClient.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const getAllTransactions = asyncHandler(async (req, res) => {
  const transactions = await TransactionRepository.findAll(req.query);
  return ApiResponse.success(res, "Transactions retrieved successfully", { data: transactions });
});

export const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await TransactionRepository.findById(parseInt(req.params.id));
  if (!transaction) {
    return ApiResponse.error(res, "Transaction not found", 404);
  }
  return ApiResponse.success(res, "Transaction retrieved successfully", { data: transaction });
});

export const createTransaction = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (data.amount !== undefined && data.amount !== '') data.amount = parseFloat(data.amount);
  if (data.baseAmount !== undefined && data.baseAmount !== '') data.baseAmount = parseFloat(data.baseAmount);
  if (data.discount !== undefined && data.discount !== '') data.discount = parseFloat(data.discount);
  if (data.categoryId !== undefined && data.categoryId !== '') data.categoryId = parseInt(data.categoryId);
  if (data.patientId !== undefined && data.patientId !== '' && data.patientId !== null) data.patientId = parseInt(data.patientId);
  if (data.staffId !== undefined && data.staffId !== '' && data.staffId !== null) data.staffId = parseInt(data.staffId);
  if (data.appointmentId !== undefined && data.appointmentId !== '' && data.appointmentId !== null) data.appointmentId = parseInt(data.appointmentId);
  if (data.labTestId !== undefined && data.labTestId !== '' && data.labTestId !== null) data.labTestId = parseInt(data.labTestId);
  if (data.bedAssignmentId !== undefined && data.bedAssignmentId !== '' && data.bedAssignmentId !== null) data.bedAssignmentId = parseInt(data.bedAssignmentId);
  if (data.assetRentId !== undefined && data.assetRentId !== '' && data.assetRentId !== null) data.assetRentId = parseInt(data.assetRentId);

  const transaction = await TransactionRepository.create(data);
  return ApiResponse.success(res, "Transaction recorded successfully", { data: transaction });
});

export const updateTransaction = asyncHandler(async (req, res) => {
  const transactionId = parseInt(req.params.id);
  const data = { ...req.body };
  if (data.amount !== undefined && data.amount !== '') data.amount = parseFloat(data.amount);
  if (data.baseAmount !== undefined && data.baseAmount !== '') data.baseAmount = parseFloat(data.baseAmount);
  if (data.discount !== undefined && data.discount !== '') data.discount = parseFloat(data.discount);
  if (data.categoryId !== undefined && data.categoryId !== '') data.categoryId = parseInt(data.categoryId);
  if (data.patientId !== undefined && data.patientId !== '' && data.patientId !== null) data.patientId = parseInt(data.patientId);
  if (data.staffId !== undefined && data.staffId !== '' && data.staffId !== null) data.staffId = parseInt(data.staffId);
  if (data.appointmentId !== undefined && data.appointmentId !== '' && data.appointmentId !== null) data.appointmentId = parseInt(data.appointmentId);
  if (data.labTestId !== undefined && data.labTestId !== '' && data.labTestId !== null) data.labTestId = parseInt(data.labTestId);
  if (data.bedAssignmentId !== undefined && data.bedAssignmentId !== '' && data.bedAssignmentId !== null) data.bedAssignmentId = parseInt(data.bedAssignmentId);
  if (data.assetRentId !== undefined && data.assetRentId !== '' && data.assetRentId !== null) data.assetRentId = parseInt(data.assetRentId);

  const transaction = await TransactionRepository.update(transactionId, data);
  
  // Sync with BedAssignment if status is PAID and has bedAssignmentId
  if (transaction.status === 'PAID' && transaction.bedAssignmentId) {
    try {
      await prisma.bedAssignment.update({
        where: { id: transaction.bedAssignmentId },
        data: { isPaid: true }
      });
    } catch (syncError) {
      console.error("Failed to sync BedAssignment payment status (non-blocking):", syncError);
    }
  }

  return ApiResponse.success(res, "Transaction updated successfully", { data: transaction });
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  await TransactionRepository.delete(parseInt(req.params.id));
  return ApiResponse.success(res, "Transaction deleted successfully");
});

// Categories
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await TransactionRepository.getCategories(req.query.type);
  return ApiResponse.success(res, "Categories retrieved successfully", { data: categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await TransactionRepository.createCategory(req.body);
  return ApiResponse.success(res, "Category created successfully", { data: category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await TransactionRepository.updateCategory(req.params.id, req.body);
  return ApiResponse.success(res, "Category updated successfully", { data: category });
});

// Reports
export const getFinanceSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const summary = await TransactionRepository.getSummary(startDate, endDate);
  return ApiResponse.success(res, "Finance summary retrieved successfully", { data: summary });
});

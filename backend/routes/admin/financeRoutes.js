import express from 'express';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';
import { 
  getAllTransactions, 
  getTransactionById, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction,
  getCategories,
  createCategory,
  updateCategory,
  getFinanceSummary
} from '../../controllers/admin/financeController.js';
import {
  getRoomCategories,
  createRoomCategory,
  updateRoomCategory
} from '../../controllers/admin/roomController.js';

const router = express.Router();

// Transactions
router.get('/transactions', checkPermission('view-finance'), getAllTransactions);
router.post('/transactions', checkPermission('create-finance'), createTransaction);
router.get('/transactions/summary', checkPermission('view-finance'), getFinanceSummary);
router.get('/transactions/:id', checkPermission('view-finance'), getTransactionById);
router.put('/transactions/:id', checkPermission('edit-finance'), updateTransaction);
router.delete('/transactions/:id', checkPermission('delete-finance'), deleteTransaction);

// Categories
router.get('/categories', getCategories);
router.post('/categories', checkPermission('create-finance'), createCategory);
router.put('/categories/:id', checkPermission('edit-finance'), updateCategory);

// Room Categories
router.get('/room-categories', getRoomCategories);
router.post('/room-categories', createRoomCategory);
router.put('/room-categories/:id', updateRoomCategory);

export default router;


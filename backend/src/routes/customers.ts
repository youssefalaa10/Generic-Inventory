import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { createCustomer, deleteCustomer, getCustomerById, listCustomers, updateCustomer } from '../controllers/customersController';

const router = Router();

// List with search & pagination
router.get('/', [
  query('q').optional().isString().trim().isLength({ max: 100 }),
  query('projectId').optional().isInt({ min: 1 }).toInt(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
], listCustomers);

// Get by id
router.get('/:id', [ param('id').isMongoId().withMessage('Invalid customer id') ], getCustomerById);

// Create
router.post('/', [
  body('name').notEmpty().withMessage('name required').isString().trim().isLength({ max: 100 }),
  body('phone').notEmpty().withMessage('phone required').isString().trim().isLength({ min: 8, max: 20 }),
  body('email').optional().isEmail().withMessage('invalid email').isLength({ max: 150 }).trim().toLowerCase(),
  body('address').optional().isString().isLength({ max: 200 }).trim(),
  body('balance').optional().isNumeric(),
  body('branchId').optional().isInt({ min: 1 }).toInt(),
  body('projectId').optional().isInt({ min: 1 }).toInt(),
], createCustomer);

// Update
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid customer id'),
  body('name').optional().isString().trim().isLength({ max: 100 }),
  body('phone').optional().isString().trim().isLength({ min: 8, max: 20 }),
  body('email').optional().isEmail().withMessage('invalid email').isLength({ max: 150 }).trim().toLowerCase(),
  body('address').optional().isString().isLength({ max: 200 }).trim(),
  body('balance').optional().isNumeric(),
  body('branchId').optional().isInt({ min: 1 }).toInt(),
  body('projectId').optional().isInt({ min: 1 }).toInt(),
], updateCustomer);

// Delete
router.delete('/:id', [ param('id').isMongoId().withMessage('Invalid customer id') ], deleteCustomer);

export default router;



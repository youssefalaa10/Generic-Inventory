import { Router } from 'express';
import { body, param } from 'express-validator';
import { listProducts, getProductById, createProduct, updateProduct, deleteProduct, searchProducts, lookupProduct } from '../controllers/productsController';

const router = Router();

// List all products
router.get('/', listProducts);
router.get('/pos/search', searchProducts);
router.get('/pos/lookup', lookupProduct);

// Get by id
router.get('/:id', [ param('id').isMongoId().withMessage('Invalid product id') ], getProductById);

// Create
router.post('/', [
  body('name').notEmpty().withMessage('name required'),
  body('sku').notEmpty().withMessage('sku required'),
  body('category').notEmpty().withMessage('category required'),
  body('baseUnit').isIn(['pcs','g','ml']).withMessage('invalid baseUnit'),
], createProduct);

// Update
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid product id'),
  body('baseUnit').optional().isIn(['pcs','g','ml']).withMessage('invalid baseUnit'),
], updateProduct);

// Delete
router.delete('/:id', [ param('id').isMongoId().withMessage('Invalid product id') ], deleteProduct);

export default router;

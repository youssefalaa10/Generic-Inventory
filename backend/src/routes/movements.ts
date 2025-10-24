import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { StockMovement } from '../models/StockMovement';
import { InventoryItem } from '../models/InventoryItem';
import { CustomError } from '../middleware/errorHandler';
import { AsyncParser } from 'json2csv';

const router = Router();

// Validation middleware
const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
    });
    return;
  }
  next();
};

// GET /api/movements - Get all stock movements with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('itemId').optional().isMongoId().withMessage('Invalid item ID'),
  query('movementType').optional().isIn(['in', 'out', 'adjustment']).withMessage('Invalid movement type'),
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || Number(process.env.DEFAULT_PAGE_SIZE) || 10;
    const skip = (page - 1) * limit;
    
    const itemId = req.query.itemId as string;
    const movementType = req.query.movementType as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    // Build filter object
    const filter: any = {};
    
    if (itemId) {
      filter.inventory_item_id = itemId;
    }
    
    if (movementType) {
      filter.movement_type = movementType;
    }
    
    if (startDate || endDate) {
      filter.created_at = {};
      if (startDate) filter.created_at.$gte = new Date(startDate);
      if (endDate) filter.created_at.$lte = new Date(endDate);
    }

    const movements = await StockMovement.find(filter)
      .populate('inventory_item_id', 'name sku barcode')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalMovements = await StockMovement.countDocuments(filter);
    const totalPages = Math.ceil(totalMovements / limit);

    res.json({
      success: true,
      data: movements,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalMovements,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/movements/:id - Get single stock movement
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid movement ID'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const movement = await StockMovement.findById(req.params.id)
      .populate('inventory_item_id', 'name sku barcode');
    
    if (!movement) {
      throw new CustomError('Stock movement not found', 404);
    }

    res.json({
      success: true,
      data: movement,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/movements - Create new stock movement
router.post('/', [
  body('inventory_item_id').isMongoId().withMessage('Valid inventory item ID is required'),
  body('movement_type').isIn(['in', 'out', 'adjustment']).withMessage('Movement type must be in, out, or adjustment'),
  body('quantity').isNumeric().withMessage('Quantity is required and must be a number'),
  body('reference_type').notEmpty().withMessage('Reference type is required'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { inventory_item_id, movement_type, quantity, reference_type, notes } = req.body;
    
    // Verify inventory item exists
    const item = await InventoryItem.findById(inventory_item_id);
    if (!item) {
      throw new CustomError('Inventory item not found', 404);
    }

    // Check if item is locked
    if (item.locked) {
      throw new CustomError('Cannot create movement for locked item', 400);
    }

    // Validate stock levels for 'out' movements
    if (movement_type === 'out' && item.currentStock < quantity) {
      throw new CustomError('Insufficient stock for this movement', 400);
    }

    const movementData = {
      inventory_item_id,
      item_name: item.name,
      movement_type,
      quantity,
      reference_type,
      notes: notes || '',
      created_by: req.headers['x-user-id'] as string || 'system',
    };

    const movement = new StockMovement(movementData);
    await movement.save();

    // Update inventory item stock
    if (movement_type === 'in') {
      item.currentStock += quantity;
    } else if (movement_type === 'out') {
      item.currentStock -= quantity;
    }
    // For 'adjustment', stock is already updated via the adjust-stock endpoint
    
    item.lastUpdatedBy = req.headers['x-user-id'] as string || 'system';
    await item.save();

    // Populate the movement for response
    await movement.populate('inventory_item_id', 'name sku barcode');

    res.status(201).json({
      success: true,
      data: movement,
      message: 'Stock movement created successfully',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/movements/export - Export movements to CSV
router.get('/export', [
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
  query('itemId').optional().isMongoId().withMessage('Invalid item ID'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const itemId = req.query.itemId as string;

    const filter: any = {};
    
    if (startDate || endDate) {
      filter.created_at = {};
      if (startDate) filter.created_at.$gte = startDate;
      if (endDate) filter.created_at.$lte = endDate;
    }
    
    if (itemId) {
      filter.inventory_item_id = itemId;
    }

    const movements = await StockMovement.find(filter)
      .populate('inventory_item_id', 'name sku barcode')
      .sort({ created_at: -1 })
      .lean();
    
    const fields = [
      'item_name',
      'movement_type',
      'quantity',
      'reference_type',
      'notes',
      'created_at',
      'created_by',
    ];

    const parser = new AsyncParser({ fields });
    const csv = await parser.parse(movements).promise();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=stock_movements.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

export default router;

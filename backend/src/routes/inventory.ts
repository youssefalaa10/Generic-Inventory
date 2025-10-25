import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { InventoryItem, InventoryItemDoc } from '../models/InventoryItem';
import { StockMovement } from '../models/StockMovement';
import { CustomError } from '../middleware/errorHandler';
import { AsyncParser } from 'json2csv';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new CustomError('Only CSV files are allowed', 400));
    }
  },
});

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

// GET /api/inventory - Get all inventory items with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('type').optional().isString().withMessage('Type must be a string'),
  query('lowStock').optional().isBoolean().withMessage('LowStock must be a boolean'),
  query('locked').optional().isBoolean().withMessage('Locked must be a boolean'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || Number(process.env.DEFAULT_PAGE_SIZE) || 10;
    const skip = (page - 1) * limit;
    
    const search = req.query.search as string;
    const type = req.query.type as string;
    const lowStock = req.query.lowStock === 'true';
    const locked = req.query.locked as string;

    // Build filter object
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (lowStock) {
      filter.$expr = { $lte: ['$currentStock', '$minimumStock'] };
    }
    
    if (locked !== undefined) {
      filter.locked = locked === 'true';
    }

    const items = await InventoryItem.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalItems = await InventoryItem.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    if (error && (error.code === 11000 || error.name === 'MongoServerError') && error.keyPattern) {
      const field = Object.keys(error.keyPattern)[0] || 'field';
      res.status(409).json({
        success: false,
        error: `Duplicate value for ${field}`,
        details: [{ msg: `An item with this ${field} already exists`, param: field, location: 'body' }],
      });
      return;
    }
    next(error);
  }
});

// GET /api/inventory/:id - Get single inventory item
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid item ID'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    
    if (!item) {
      throw new CustomError('Inventory item not found', 404);
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/inventory - Create new inventory item
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }).withMessage('Name too long'),
  body('type').optional().isIn(['packaging', 'supplies', 'fixtures', 'maintenance', 'security', 'marketing']).withMessage('Invalid type'),
  body('currentStock').optional().toInt().isInt({ min: 0 }).withMessage('Current stock must be a non-negative integer'),
  body('minimumStock').optional().toInt().isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer'),
  body('unit').trim().notEmpty().withMessage('Unit is required').isLength({ max: 100 }).withMessage('Unit too long'),
  body('costPerUnit').optional().toFloat().isFloat({ min: 0 }).withMessage('Cost per unit must be a non-negative number'),
  body('barcode').optional().isString().trim().isLength({ max: 50 }).withMessage('Barcode too long'),
  body('sku').optional().isString().trim().isLength({ max: 50 }).withMessage('SKU too long'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Business logic validation
    if (
      typeof req.body.minimumStock !== 'undefined' &&
      typeof req.body.currentStock !== 'undefined' &&
      Number(req.body.minimumStock) > Number(req.body.currentStock)
    ) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: [{ msg: 'Minimum stock cannot exceed current stock', param: 'minimumStock', location: 'body' }],
      });
      return;
    }

    const itemData = {
      ...req.body,
      createdBy: req.headers['x-user-id'] as string || 'system',
    };

    const item = new InventoryItem(itemData);
    await item.save();

    res.status(201).json({
      success: true,
      data: item,
      message: 'Inventory item created successfully',
    });
  } catch (error: any) {
    // Handle duplicate key errors (e.g., barcode, sku)
    if (error && (error.code === 11000 || error.name === 'MongoServerError') && error.keyPattern) {
      const field = Object.keys(error.keyPattern)[0] || 'field';
      res.status(409).json({
        success: false,
        error: `Duplicate value for ${field}`,
        details: [{ msg: `An item with this ${field} already exists`, param: field, location: 'body' }],
      });
      return;
    }
    next(error);
  }
});

// PUT /api/inventory/:id - Update inventory item
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid item ID'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 200 }).withMessage('Name too long'),
  body('type').optional().isIn(['packaging', 'supplies', 'fixtures', 'maintenance', 'security', 'marketing']).withMessage('Invalid type'),
  body('currentStock').optional().toInt().isInt({ min: 0 }).withMessage('Current stock must be a non-negative integer'),
  body('minimumStock').optional().toInt().isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer'),
  body('unit').optional().trim().notEmpty().withMessage('Unit cannot be empty').isLength({ max: 100 }).withMessage('Unit too long'),
  body('costPerUnit').optional().toFloat().isFloat({ min: 0 }).withMessage('Cost per unit must be a non-negative number'),
  body('barcode').optional().isString().trim().isLength({ max: 50 }).withMessage('Barcode too long'),
  body('sku').optional().isString().trim().isLength({ max: 50 }).withMessage('SKU too long'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Business logic validation when both values provided in update
    if (
      typeof req.body.minimumStock !== 'undefined' &&
      typeof req.body.currentStock !== 'undefined' &&
      Number(req.body.minimumStock) > Number(req.body.currentStock)
    ) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: [{ msg: 'Minimum stock cannot exceed current stock', param: 'minimumStock', location: 'body' }],
      });
      return;
    }

    const updateData = {
      ...req.body,
      lastUpdatedBy: req.headers['x-user-id'] as string || 'system',
    };

    const item = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!item) {
      throw new CustomError('Inventory item not found', 404);
    }

    res.json({
      success: true,
      data: item,
      message: 'Inventory item updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/inventory/:id - Delete inventory item
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid item ID'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    
    if (!item) {
      throw new CustomError('Inventory item not found', 404);
    }

    if (item.locked) {
      throw new CustomError('Cannot delete locked inventory item', 400);
    }

    await InventoryItem.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Inventory item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/inventory/:id/adjust-stock - Adjust stock quantity
router.patch('/:id/adjust-stock', [
  param('id').isMongoId().withMessage('Invalid item ID'),
  body('quantity').isNumeric().withMessage('Quantity is required and must be a number'),
  body('notes').notEmpty().withMessage('Notes are required'),
  body('reference_type').notEmpty().withMessage('Reference type is required'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quantity, notes, reference_type } = req.body;
    
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      throw new CustomError('Inventory item not found', 404);
    }

    if (item.locked) {
      throw new CustomError('Cannot adjust stock for locked item', 400);
    }

    const newStock = item.currentStock + quantity;
    if (newStock < 0) {
      throw new CustomError('Stock cannot be negative', 400);
    }

    // Update item stock
    item.currentStock = newStock;
    item.lastUpdatedBy = req.headers['x-user-id'] as string || 'system';
    await item.save();

    // Create stock movement record
    const movement = new StockMovement({
      inventory_item_id: item._id,
      item_name: item.name,
      movement_type: quantity > 0 ? 'in' : 'out',
      quantity: Math.abs(quantity),
      reference_type,
      notes,
      created_by: req.headers['x-user-id'] as string || 'system',
    });
    await movement.save();

    res.json({
      success: true,
      data: {
        item,
        movement,
      },
      message: 'Stock adjusted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/inventory/:id/lock - Lock/unlock inventory item
router.patch('/:id/lock', [
  param('id').isMongoId().withMessage('Invalid item ID'),
  body('locked').isBoolean().withMessage('Locked must be a boolean'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { locked } = req.body;
    
    const item = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      { 
        locked,
        lastUpdatedBy: req.headers['x-user-id'] as string || 'system',
      },
      { new: true }
    );

    if (!item) {
      throw new CustomError('Inventory item not found', 404);
    }

    res.json({
      success: true,
      data: item,
      message: `Inventory item ${locked ? 'locked' : 'unlocked'} successfully`,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/inventory/low-stock - Get low stock items
router.get('/low-stock', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await InventoryItem.find({
      $expr: { $lte: ['$currentStock', '$minimumStock'] }
    }).sort({ currentStock: 1 });

    res.json({
      success: true,
      data: items,
      count: items.length,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/inventory/stats - Get inventory statistics
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalItems = await InventoryItem.countDocuments();
    const lowStockItems = await InventoryItem.countDocuments({
      $expr: { $lte: ['$currentStock', '$minimumStock'] }
    });
    const lockedItems = await InventoryItem.countDocuments({ locked: true });
    
    const totalValue = await InventoryItem.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$currentStock', '$costPerUnit'] } }
        }
      }
    ]);

    const typeStats = await InventoryItem.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalStock: { $sum: '$currentStock' },
          totalValue: { $sum: { $multiply: ['$currentStock', '$costPerUnit'] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalItems,
        lowStockItems,
        lockedItems,
        totalValue: totalValue[0]?.totalValue || 0,
        typeStats,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/inventory/import - Import inventory from CSV
router.post('/import', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new CustomError('No file uploaded', 400);
    }

    const results: any[] = [];
    const errors: any[] = [];
    let addedCount = 0;

    const stream = Readable.from(req.file.buffer.toString());
    
    stream
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        try {
          for (const row of results) {
            try {
              const itemData = {
                name: row.name || row.اسم_العنصر,
                type: row.type || row.النوع || 'supplies',
                currentStock: parseFloat(row.currentStock || row.المخزون_الحالي || '0'),
                minimumStock: parseFloat(row.minimumStock || row.الحد_الأدنى || '0'),
                unit: row.unit || row.الوحدة || 'قطعة',
                costPerUnit: parseFloat(row.costPerUnit || row.التكلفة_لكل_وحدة || '0'),
                location: row.location || row.الموقع || '',
                barcode: row.barcode || row.الباركود || '',
                sku: row.sku || row.SKU || '',
                description: row.description || row.الوصف || '',
                category: row.category || row.الفئة || '',
                supplier: row.supplier || row.المورد || '',
                createdBy: req.headers['x-user-id'] as string || 'system',
              };

              const item = new InventoryItem(itemData);
              await item.save();
              addedCount++;
            } catch (error: any) {
              errors.push({
                row: row,
                error: error.message,
              });
            }
          }

          res.json({
            success: true,
            message: `Import completed. ${addedCount} items added successfully.`,
            data: {
              added: addedCount,
              errors: errors.length,
              errorDetails: errors,
            },
          });
        } catch (error) {
          next(error);
        }
      })
      .on('error', (error) => {
        next(new CustomError(`CSV parsing error: ${error.message}`, 400));
      });
  } catch (error) {
    next(error);
  }
});

// GET /api/inventory/export - Export inventory to CSV
router.get('/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await InventoryItem.find({}).lean();
    
    const fields = [
      'name',
      'type',
      'currentStock',
      'minimumStock',
      'unit',
      'costPerUnit',
      'location',
      'barcode',
      'sku',
      'description',
      'category',
      'supplier',
      'locked',
      'createdAt',
      'updatedAt',
    ];

    const parser = new AsyncParser({ fields });
    const csv = await parser.parse(items).promise();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

export default router;

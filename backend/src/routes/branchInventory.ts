import { Router, Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { BranchInventory } from '../models/BranchInventory';

const router = Router();

const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
    return;
  }
  next();
};

// GET /api/branch-inventory
router.get('/', [
  query('branchId').optional().isInt({ min: 1 }).toInt(),
  query('productId').optional().isInt({ min: 1 }).toInt(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
], validateRequest, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { branchId, productId } = req.query as any;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (branchId) filter.branchId = branchId;
    if (productId) filter.productId = productId;

    const [rows, total] = await Promise.all([
      BranchInventory.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
      BranchInventory.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: rows,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
    return;
  } catch (err) {
    next(err);
  }
});

// POST /api/branch-inventory
router.post('/', [
  body('branchId').isInt({ min: 1 }).withMessage('branchId is required').toInt(),
  body('productId').isInt({ min: 1 }).withMessage('productId is required').toInt(),
  body('quantity').optional().isInt({ min: 0 }).toInt(),
  body('minStock').optional().isInt({ min: 0 }).toInt(),
  body('lotNumber').optional().isString().trim().isLength({ max: 50 }),
  body('expiryDate').optional().isISO8601().toDate(),
], validateRequest, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { branchId, productId, quantity = 0, minStock = 0, lotNumber, expiryDate } = req.body;

    if (minStock > quantity) {
      res.status(400).json({ success: false, error: 'Validation failed', details: [{ msg: 'minStock cannot exceed quantity', param: 'minStock', location: 'body' }] });
      return;
    }

    const doc = await BranchInventory.create({
      branchId,
      productId,
      quantity,
      minStock,
      lotNumber,
      expiryDate,
      createdBy: (req.headers['x-user-id'] as string) || 'system',
    });

    res.status(201).json({ success: true, data: doc });
    return;
  } catch (error: any) {
    if (error && (error.code === 11000 || error.name === 'MongoServerError') && error.keyPattern) {
      res.status(409).json({ success: false, error: 'Duplicate record for branchId, productId and lotNumber' });
      return;
    }
    next(error);
  }
});

// PUT /api/branch-inventory
router.put('/', [
  body('branchId').isInt({ min: 1 }).toInt(),
  body('productId').isInt({ min: 1 }).toInt(),
  body('lotNumber').optional().isString().trim().isLength({ max: 50 }),
  body('quantity').optional().isInt({ min: 0 }).toInt(),
  body('minStock').optional().isInt({ min: 0 }).toInt(),
  body('expiryDate').optional().isISO8601().toDate(),
], validateRequest, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { branchId, productId, lotNumber, quantity, minStock, expiryDate } = req.body;

    if (typeof minStock !== 'undefined' && typeof quantity !== 'undefined' && minStock > quantity) {
      res.status(400).json({ success: false, error: 'Validation failed', details: [{ msg: 'minStock cannot exceed quantity', param: 'minStock', location: 'body' }] });
      return;
    }

    const filter: any = { branchId, productId };
    if (lotNumber) filter.lotNumber = lotNumber;

    const updated = await BranchInventory.findOneAndUpdate(filter, {
      $set: {
        ...(typeof quantity !== 'undefined' ? { quantity } : {}),
        ...(typeof minStock !== 'undefined' ? { minStock } : {}),
        ...(typeof expiryDate !== 'undefined' ? { expiryDate } : {}),
        lastUpdatedBy: (req.headers['x-user-id'] as string) || 'system',
      }
    }, { new: true, runValidators: true });

    if (!updated) {
      res.status(404).json({ success: false, error: 'Branch inventory record not found' });
      return;
    }

    res.json({ success: true, data: updated });
    return;
  } catch (err) {
    next(err);
  }
});

// DELETE /api/branch-inventory
router.delete('/', [
  body('branchId').isInt({ min: 1 }).toInt(),
  body('productId').isInt({ min: 1 }).toInt(),
  body('lotNumber').optional().isString().trim(),
], validateRequest, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { branchId, productId, lotNumber } = req.body;
    const filter: any = { branchId, productId };
    if (lotNumber) filter.lotNumber = lotNumber;

    const deleted = await BranchInventory.findOneAndDelete(filter);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Branch inventory record not found' });
      return;
    }

    res.json({ success: true, message: 'Deleted successfully' });
    return;
  } catch (err) {
    next(err);
  }
});

export default router;

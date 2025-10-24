import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { SupplyChain, SupplyChainModel } from '../models/SupplyChain';
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

// GET /api/supply-chain - Get all supply chain records with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['مخزون', 'مباع', 'مفقود', 'تالف', 'منتهي الصلاحية', 'في النقل', 'مستلم']).withMessage('Invalid status'),
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
  query('search').optional().isString().withMessage('Search must be a string'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || Number(process.env.DEFAULT_PAGE_SIZE) || 10;
    const skip = (page - 1) * limit;
    
    const status = req.query.status as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const search = req.query.search as string;

    // Build filter object
    const filter: any = {};
    
    if (status) {
      filter.الحالة_الحالية = status;
    }
    
    if (startDate || endDate) {
      filter.الوقت = {};
      if (startDate) filter.الوقت.$gte = new Date(startDate);
      if (endDate) filter.الوقت.$lte = new Date(endDate);
    }
    
    if (search) {
      filter.$or = [
        { اسم_المنتج: { $regex: search, $options: 'i' } },
        { رمز_SKU: { $regex: search, $options: 'i' } },
        { رمز_GTin: { $regex: search, $options: 'i' } },
        { الشركة_المصنعة: { $regex: search, $options: 'i' } },
      ];
    }

    const records = await SupplyChain.find(filter)
      .sort({ الوقت: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalRecords = await SupplyChain.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.json({
      success: true,
      data: records,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalRecords,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/supply-chain/:id - Get single supply chain record
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid record ID'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await SupplyChain.findById(req.params.id);
    
    if (!record) {
      throw new CustomError('Supply chain record not found', 404);
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/supply-chain - Create new supply chain record
router.post('/', [
  body('المعرف').isNumeric().withMessage('المعرف مطلوب ويجب أن يكون رقماً'),
  body('اسم_المنتج').notEmpty().withMessage('اسم المنتج مطلوب'),
  body('الكمية').isNumeric().withMessage('الكمية مطلوبة ويجب أن تكون رقماً'),
  body('الوحدة').optional().isString().withMessage('الوحدة يجب أن تكون نصاً'),
  body('الحالة_الحالية').optional().isIn(['مخزون', 'مباع', 'مفقود', 'تالف', 'منتهي الصلاحية', 'في النقل', 'مستلم']).withMessage('حالة غير صالحة'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recordData = {
      ...req.body,
      createdBy: req.headers['x-user-id'] as string || 'system',
      sessionId: req.headers['x-session-id'] as string || 'default',
    };

    const record = new SupplyChain(recordData);
    await record.save();

    res.status(201).json({
      success: true,
      data: record,
      message: 'Supply chain record created successfully',
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/supply-chain/:id - Update supply chain record
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid record ID'),
  body('اسم_المنتج').optional().notEmpty().withMessage('اسم المنتج لا يمكن أن يكون فارغاً'),
  body('الكمية').optional().isNumeric().withMessage('الكمية يجب أن تكون رقماً'),
  body('الحالة_الحالية').optional().isIn(['مخزون', 'مباع', 'مفقود', 'تالف', 'منتهي الصلاحية', 'في النقل', 'مستلم']).withMessage('حالة غير صالحة'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await SupplyChain.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!record) {
      throw new CustomError('Supply chain record not found', 404);
    }

    res.json({
      success: true,
      data: record,
      message: 'Supply chain record updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/supply-chain/:id - Delete supply chain record
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid record ID'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await SupplyChain.findByIdAndDelete(req.params.id);

    if (!record) {
      throw new CustomError('Supply chain record not found', 404);
    }

    res.json({
      success: true,
      message: 'Supply chain record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/supply-chain/status/:status - Get records by status
router.get('/status/:status', [
  param('status').isIn(['مخزون', 'مباع', 'مفقود', 'تالف', 'منتهي الصلاحية', 'في النقل', 'مستلم']).withMessage('Invalid status'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const records = await (SupplyChain as SupplyChainModel).getByStatus(req.params.status);

    res.json({
      success: true,
      data: records,
      count: records.length,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/supply-chain/product/:skuOrGtin - Get records by product
router.get('/product/:skuOrGtin', [
  param('skuOrGtin').notEmpty().withMessage('SKU or GTIN is required'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const records = await (SupplyChain as SupplyChainModel).getByProduct(req.params.skuOrGtin);

    res.json({
      success: true,
      data: records,
      count: records.length,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/supply-chain/stats - Get supply chain statistics
router.get('/stats', [
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

    const filter = {
      الوقت: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    const totalRecords = await SupplyChain.countDocuments(filter);
    
    const statusStats = await SupplyChain.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$الحالة_الحالية',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$الكمية' },
        },
      },
    ]);

    const manufacturerStats = await SupplyChain.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$الشركة_المصنعة',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$الكمية' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const dailyRecords = await SupplyChain.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$الوقت' },
            month: { $month: '$الوقت' },
            day: { $dayOfMonth: '$الوقت' },
          },
          count: { $sum: 1 },
          totalQuantity: { $sum: '$الكمية' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalRecords,
        statusStats,
        manufacturerStats,
        dailyRecords,
        dateRange: {
          startDate,
          endDate,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/supply-chain/export - Export supply chain records to CSV
router.get('/export', [
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
  query('status').optional().isIn(['مخزون', 'مباع', 'مفقود', 'تالف', 'منتهي الصلاحية', 'في النقل', 'مستلم']).withMessage('Invalid status'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const status = req.query.status as string;

    const filter: any = {};
    
    if (startDate || endDate) {
      filter.الوقت = {};
      if (startDate) filter.الوقت.$gte = startDate;
      if (endDate) filter.الوقت.$lte = endDate;
    }
    
    if (status) {
      filter.الحالة_الحالية = status;
    }

    const records = await SupplyChain.find(filter)
      .sort({ الوقت: -1 })
      .lean();
    
    const fields = [
      'الوقت',
      'المعرف',
      'رمز_SKU',
      'رمز_GTin',
      'رقم_الدفعة',
      'الرقم_التسلسلي',
      'اسم_المنتج',
      'الكمية',
      'الوحدة',
      'الشركة_المصنعة',
      'بلد_المنشأ',
      'تاريخ_التصنيع',
      'تاريخ_الانتهاء',
      'الحالة_الحالية',
      'وسيلة_النقل',
    ];

    const parser = new AsyncParser({ fields });
    const csv = await parser.parse(records).promise();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=supply_chain.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

export default router;

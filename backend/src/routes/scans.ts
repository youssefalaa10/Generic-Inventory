import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Scan, ScanModel } from '../models/Scan';
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

// GET /api/scans - Get all scan records with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('scanType').optional().isIn(['barcode', 'qr', 'manual', 'camera']).withMessage('Invalid scan type'),
  query('processingStatus').optional().isIn(['pending', 'processed', 'failed', 'ignored']).withMessage('Invalid processing status'),
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || Number(process.env.DEFAULT_PAGE_SIZE) || 10;
    const skip = (page - 1) * limit;
    
    const scanType = req.query.scanType as string;
    const processingStatus = req.query.processingStatus as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    // Build filter object
    const filter: any = {};
    
    if (scanType) {
      filter.scanType = scanType;
    }
    
    if (processingStatus) {
      filter.processingStatus = processingStatus;
    }
    
    if (startDate || endDate) {
      filter.receivedAt = {};
      if (startDate) filter.receivedAt.$gte = new Date(startDate);
      if (endDate) filter.receivedAt.$lte = new Date(endDate);
    }

    const scans = await Scan.find(filter)
      .sort({ receivedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalScans = await Scan.countDocuments(filter);
    const totalPages = Math.ceil(totalScans / limit);

    res.json({
      success: true,
      data: scans,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalScans,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/scans/:id - Get single scan record
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid scan ID'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const scan = await Scan.findById(req.params.id);
    
    if (!scan) {
      throw new CustomError('Scan record not found', 404);
    }

    res.json({
      success: true,
      data: scan,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/scans - Create new scan record
router.post('/', [
  body('barcode').optional().isString().withMessage('Barcode must be a string'),
  body('text').optional().isString().withMessage('Text must be a string'),
  body('raw').optional().isObject().withMessage('Raw must be an object'),
  body('scanType').optional().isIn(['barcode', 'qr', 'manual', 'camera']).withMessage('Invalid scan type'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const scanData = {
      ...req.body,
      createdBy: req.headers['x-user-id'] as string || 'system',
      sessionId: req.headers['x-session-id'] as string || 'default',
    };

    const scan = new Scan(scanData);
    await scan.save();

    res.status(201).json({
      success: true,
      data: scan,
      message: 'Scan record created successfully',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/scans/process-qr - Process QR code data
router.post('/process-qr', [
  body('qrData').notEmpty().withMessage('QR data is required'),
  body('scanType').optional().isIn(['barcode', 'qr', 'manual', 'camera']).withMessage('Invalid scan type'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { qrData, scanType = 'qr' } = req.body;
    
    let parsedData;
    try {
      // Try to parse as JSON first
      parsedData = JSON.parse(qrData);
    } catch {
      // If not JSON, treat as plain text
      parsedData = {
        text: qrData,
        productName: qrData,
      };
    }

    // Look for existing inventory item by SKU or barcode
    let existingItem = null;
    if (parsedData.sku || parsedData.gtin || parsedData.barcode) {
      existingItem = await InventoryItem.findOne({
        $or: [
          { sku: parsedData.sku },
          { barcode: parsedData.gtin || parsedData.barcode },
        ],
      });
    }

    const scanData = {
      barcode: parsedData.gtin || parsedData.barcode || '',
      text: parsedData.text || qrData,
      raw: parsedData,
      scanType,
      parsed: {
        id: parsedData.id || parsedData.المعرف,
        sku: parsedData.sku || parsedData.رمز_SKU,
        gtin: parsedData.gtin || parsedData.رمز_GTin,
        batchNumber: parsedData.batchNumber || parsedData.رقم_الدفعة,
        serialNumber: parsedData.serialNumber || parsedData.الرقم_التسلسلي,
        productName: parsedData.productName || parsedData.اسم_المنتج,
        quantity: parsedData.quantity || parsedData.الكمية,
        unit: parsedData.unit || parsedData.الوحدة,
        manufacturer: parsedData.manufacturer || parsedData.الشركة_المصنعة,
        originCountry: parsedData.originCountry || parsedData.بلد_المنشأ,
        manufactureDate: parsedData.manufactureDate || parsedData.تاريخ_التصنيع,
        expiryDate: parsedData.expiryDate || parsedData.تاريخ_الانتهاء,
        currentStatus: parsedData.currentStatus || parsedData.الحالة_الحالية,
        transportMode: parsedData.transportMode || parsedData.وسيلة_النقل,
      },
      processingStatus: 'processed',
      processedAt: new Date(),
      createdBy: req.headers['x-user-id'] as string || 'system',
      sessionId: req.headers['x-session-id'] as string || 'default',
    };

    const scan = new Scan(scanData);
    await scan.save();

    res.status(201).json({
      success: true,
      data: {
        scan,
        existingItem,
        matched: !!existingItem,
      },
      message: 'QR code processed successfully',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/scans/bridge - Bridge scan data to local server
router.post('/bridge', [
  body('scans').isArray().withMessage('Scans must be an array'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { scans } = req.body;
    const processedScans = [];

    for (const scanData of scans) {
      try {
        const scan = new Scan({
          ...scanData,
          createdBy: req.headers['x-user-id'] as string || 'system',
          sessionId: req.headers['x-session-id'] as string || 'default',
        });
        await scan.save();
        processedScans.push(scan);
      } catch (error: any) {
        console.error('Error processing scan:', error.message);
      }
    }

    res.status(201).json({
      success: true,
      data: processedScans,
      message: `${processedScans.length} scans processed successfully`,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/scans/:id/status - Update scan processing status
router.patch('/:id/status', [
  param('id').isMongoId().withMessage('Invalid scan ID'),
  body('processingStatus').isIn(['pending', 'processed', 'failed', 'ignored']).withMessage('Invalid processing status'),
  body('processingError').optional().isString().withMessage('Processing error must be a string'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { processingStatus, processingError } = req.body;
    
    const updateData: any = {
      processingStatus,
    };

    if (processingStatus === 'processed' || processingStatus === 'failed') {
      updateData.processedAt = new Date();
    }

    if (processingError) {
      updateData.processingError = processingError;
    }

    const scan = await Scan.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!scan) {
      throw new CustomError('Scan record not found', 404);
    }

    res.json({
      success: true,
      data: scan,
      message: 'Scan status updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/scans/product/:skuOrGtin - Get scans for specific product
router.get('/product/:skuOrGtin', [
  param('skuOrGtin').notEmpty().withMessage('SKU or GTIN is required'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const scans = await (Scan as ScanModel).getScansByProduct(req.params.skuOrGtin);

    res.json({
      success: true,
      data: scans,
      count: scans.length,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/scans/pending - Get pending scans
router.get('/pending', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const scans = await (Scan as ScanModel).getPendingScans();

    res.json({
      success: true,
      data: scans,
      count: scans.length,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/scans/stats - Get scan statistics
router.get('/stats', [
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

    const filter = {
      receivedAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    const totalScans = await Scan.countDocuments(filter);
    
    const scanTypeStats = await Scan.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$scanType',
          count: { $sum: 1 },
        },
      },
    ]);

    const processingStatusStats = await Scan.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$processingStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    const dailyScans = await Scan.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$receivedAt' },
            month: { $month: '$receivedAt' },
            day: { $dayOfMonth: '$receivedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalScans,
        scanTypeStats,
        processingStatusStats,
        dailyScans,
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

// GET /api/scans/export - Export scans to CSV
router.get('/export', [
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
  query('scanType').optional().isIn(['barcode', 'qr', 'manual', 'camera']).withMessage('Invalid scan type'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const scanType = req.query.scanType as string;

    const filter: any = {};
    
    if (startDate || endDate) {
      filter.receivedAt = {};
      if (startDate) filter.receivedAt.$gte = startDate;
      if (endDate) filter.receivedAt.$lte = endDate;
    }
    
    if (scanType) {
      filter.scanType = scanType;
    }

    const scans = await Scan.find(filter)
      .sort({ receivedAt: -1 })
      .lean();
    
    const fields = [
      'barcode',
      'text',
      'scanType',
      'processingStatus',
      'receivedAt',
      'createdBy',
      'sessionId',
    ];

    const parser = new AsyncParser({ fields });
    const csv = await parser.parse(scans).promise();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=scans.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

export default router;

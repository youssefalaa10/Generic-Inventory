import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { SupplyOrder, SupplyOrderModel } from '../models/SupplyOrder';
import { InventoryItem } from '../models/InventoryItem';
import { StockMovement } from '../models/StockMovement';
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

// GET /api/orders - Get all supply orders with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  query('supplier').optional().isString().withMessage('Supplier must be a string'),
  query('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || Number(process.env.DEFAULT_PAGE_SIZE) || 10;
    const skip = (page - 1) * limit;
    
    const status = req.query.status as string;
    const supplier = req.query.supplier as string;
    const priority = req.query.priority as string;

    // Build filter object
    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (supplier) {
      filter.supplier_name = { $regex: supplier, $options: 'i' };
    }
    
    if (priority) {
      filter.priority = priority;
    }

    const orders = await SupplyOrder.find(filter)
      .populate('items.inventory_item_id', 'name sku barcode')
      .sort({ order_date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalOrders = await SupplyOrder.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalOrders,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:id - Get single supply order
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid order ID'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await SupplyOrder.findById(req.params.id)
      .populate('items.inventory_item_id', 'name sku barcode');
    
    if (!order) {
      throw new CustomError('Supply order not found', 404);
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/orders - Create new supply order
router.post('/', [
  body('supplier_name').notEmpty().withMessage('Supplier name is required'),
  body('expected_delivery').isISO8601().withMessage('Expected delivery date is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.inventory_item_id').isMongoId().withMessage('Valid inventory item ID is required'),
  body('items.*.productName').notEmpty().withMessage('Product name is required'),
  body('items.*.quantity').isNumeric().withMessage('Quantity is required and must be a number'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderData = {
      ...req.body,
      created_by: req.headers['x-user-id'] as string || 'system',
    };

    // Verify all inventory items exist
    for (const item of orderData.items) {
      const inventoryItem = await InventoryItem.findById(item.inventory_item_id);
      if (!inventoryItem) {
        throw new CustomError(`Inventory item not found: ${item.inventory_item_id}`, 404);
      }
    }

    const order = new SupplyOrder(orderData);
    await order.save();

    // Populate the order for response
    await order.populate('items.inventory_item_id', 'name sku barcode');

    res.status(201).json({
      success: true,
      data: order,
      message: 'Supply order created successfully',
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/orders/:id - Update supply order
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('supplier_name').optional().notEmpty().withMessage('Supplier name cannot be empty'),
  body('expected_delivery').optional().isISO8601().withMessage('Expected delivery date must be valid'),
  body('items').optional().isArray({ min: 1 }).withMessage('At least one item is required'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await SupplyOrder.findById(req.params.id);
    
    if (!order) {
      throw new CustomError('Supply order not found', 404);
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      throw new CustomError('Cannot update delivered or cancelled order', 400);
    }

    const updateData = {
      ...req.body,
      lastUpdatedBy: req.headers['x-user-id'] as string || 'system',
    };

    const updatedOrder = await SupplyOrder.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('items.inventory_item_id', 'name sku barcode');

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Supply order updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/orders/:id - Delete supply order
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid order ID'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await SupplyOrder.findById(req.params.id);
    
    if (!order) {
      throw new CustomError('Supply order not found', 404);
    }

    if (order.status === 'delivered') {
      throw new CustomError('Cannot delete delivered order', 400);
    }

    await SupplyOrder.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Supply order deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/orders/:id/status - Update order status
router.patch('/:id/status', [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('status').isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, notes } = req.body;
    
    const order = await SupplyOrder.findById(req.params.id);
    if (!order) {
      throw new CustomError('Supply order not found', 404);
    }

    // Define valid status transitions
    const validTransitions: { [key: string]: string[] } = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[order.status].includes(status)) {
      throw new CustomError(`Invalid status transition from ${order.status} to ${status}`, 400);
    }

    const updateData: any = {
      status,
    };

    if (status === 'delivered') {
      updateData.actual_delivery = new Date();
      
      // Update inventory stock for delivered items
      for (const item of order.items) {
        const inventoryItem = await InventoryItem.findById(item.inventory_item_id);
        if (inventoryItem) {
          inventoryItem.currentStock += item.quantity;
          inventoryItem.lastUpdatedBy = req.headers['x-user-id'] as string || 'system';
          await inventoryItem.save();

          // Create stock movement record
          const movement = new StockMovement({
            inventory_item_id: item.inventory_item_id,
            item_name: item.productName,
            movement_type: 'in',
            quantity: item.quantity,
            reference_type: 'طلب شراء',
            reference_id: order.order_number,
            notes: `Order delivery: ${order.order_number}`,
            created_by: req.headers['x-user-id'] as string || 'system',
          });
          await movement.save();
        }
      }
    } else if (status === 'cancelled') {
      updateData.cancelled_at = new Date();
      updateData.cancelled_by = req.headers['x-user-id'] as string || 'system';
      if (notes) {
        updateData.cancellation_reason = notes;
      }
    }

    const updatedOrder = await SupplyOrder.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('items.inventory_item_id', 'name sku barcode');

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Order status updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/orders/:id/item/:itemIndex - Update individual order item quantity
router.patch('/:id/item/:itemIndex', [
  param('id').isMongoId().withMessage('Invalid order ID'),
  param('itemIndex').isInt({ min: 0 }).withMessage('Item index must be a non-negative integer'),
  body('receivedQuantity').isNumeric().withMessage('Received quantity is required and must be a number'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { receivedQuantity } = req.body;
    const itemIndex = parseInt(req.params.itemIndex);
    
    const order = await SupplyOrder.findById(req.params.id);
    if (!order) {
      throw new CustomError('Supply order not found', 404);
    }

    if (itemIndex >= order.items.length) {
      throw new CustomError('Invalid item index', 400);
    }

    const item = order.items[itemIndex];
    if (receivedQuantity > item.quantity) {
      throw new CustomError('Received quantity cannot exceed ordered quantity', 400);
    }

    // Update item status based on received quantity
    let itemStatus = 'pending';
    if (receivedQuantity === item.quantity) {
      itemStatus = 'complete';
    } else if (receivedQuantity > 0) {
      itemStatus = 'partial';
    }

    order.items[itemIndex].receivedQuantity = receivedQuantity;
    order.items[itemIndex].status = itemStatus;

    await order.save();

    res.json({
      success: true,
      data: order,
      message: 'Order item quantity updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/status/:status - Get orders by status
router.get('/status/:status', [
  param('status').isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await (SupplyOrder as SupplyOrderModel).getOrdersByStatus(req.params.status)
      .populate('items.inventory_item_id', 'name sku barcode');

    res.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/overdue - Get overdue orders
router.get('/overdue', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await (SupplyOrder as SupplyOrderModel).getOverdueOrders()
      .populate('items.inventory_item_id', 'name sku barcode');

    res.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/supplier/:supplierName - Get orders by supplier
router.get('/supplier/:supplierName', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await (SupplyOrder as SupplyOrderModel).getOrdersBySupplier(req.params.supplierName)
      .populate('items.inventory_item_id', 'name sku barcode');

    res.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/stats - Get order statistics
router.get('/stats', [
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

    const filter = {
      order_date: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    const totalOrders = await SupplyOrder.countDocuments(filter);
    
    const statusStats = await SupplyOrder.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total_amount' },
        },
      },
    ]);

    const supplierStats = await SupplyOrder.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$supplier_name',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total_amount' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const priorityStats = await SupplyOrder.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    const dailyOrders = await SupplyOrder.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$order_date' },
            month: { $month: '$order_date' },
            day: { $dayOfMonth: '$order_date' },
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$total_amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        statusStats,
        supplierStats,
        priorityStats,
        dailyOrders,
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

// GET /api/orders/export - Export orders to CSV
router.get('/export', [
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
  query('status').optional().isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const status = req.query.status as string;

    const filter: any = {};
    
    if (startDate || endDate) {
      filter.order_date = {};
      if (startDate) filter.order_date.$gte = startDate;
      if (endDate) filter.order_date.$lte = endDate;
    }
    
    if (status) {
      filter.status = status;
    }

    const orders = await SupplyOrder.find(filter)
      .populate('items.inventory_item_id', 'name sku barcode')
      .sort({ order_date: -1 })
      .lean();
    
    const fields = [
      'order_number',
      'supplier_name',
      'order_date',
      'expected_delivery',
      'status',
      'total_amount',
      'priority',
      'created_by',
    ];

    const parser = new AsyncParser({ fields });
    const csv = await parser.parse(orders).promise();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=supply_orders.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

export default router;

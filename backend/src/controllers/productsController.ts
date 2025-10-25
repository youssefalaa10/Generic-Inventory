import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Product from '../models/Product';

const validateRequest = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
    return false;
  }
  return true;
};

export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await Product.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: items });
  } catch (e) {
    return next(e);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!validateRequest(req, res)) return;
    const item = await Product.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    return res.json({ success: true, data: item });
  } catch (e) {
    return next(e);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!validateRequest(req, res)) return;
    const created = await Product.create(req.body);
    return res.status(201).json({ success: true, data: created });
  } catch (e: any) {
    if (e && (e.code === 11000 || e.name === 'MongoServerError') && e.keyPattern) {
      const field = Object.keys(e.keyPattern)[0] || 'field';
      return res.status(409).json({
        success: false,
        error: `Duplicate value for ${field}`,
        details: [{ msg: `A product with this ${field} already exists`, param: field, location: 'body' }],
      });
    }
    if (e && e.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: 'Validation failed', details: Object.values(e.errors).map((er: any) => ({ msg: er.message, param: er.path })) });
    }
    return next(e);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!validateRequest(req, res)) return;
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, error: 'Not found' });
    return res.json({ success: true, data: updated });
  } catch (e: any) {
    if (e && (e.code === 11000 || e.name === 'MongoServerError') && e.keyPattern) {
      const field = Object.keys(e.keyPattern)[0] || 'field';
      return res.status(409).json({
        success: false,
        error: `Duplicate value for ${field}`,
        details: [{ msg: `A product with this ${field} already exists`, param: field, location: 'body' }],
      });
    }
    if (e && e.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: 'Validation failed', details: Object.values(e.errors).map((er: any) => ({ msg: er.message, param: er.path })) });
    }
    return next(e);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!validateRequest(req, res)) return;
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Not found' });
    return res.json({ success: true, data: { id: req.params.id } });
  } catch (e) {
    return next(e);
  }
};

// POS: search products with pagination
export const searchProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = String(req.query.q || req.query.query || '').trim();
    const status = String(req.query.status || 'Active');
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status) filter.status = status;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ];
    }

    const projection = {
      name: 1,
      sku: 1,
      category: 1,
      unitPrice: 1,
      baseUnit: 1,
      hasExpiryDate: 1,
      trackInventory: 1,
      alertQuantity: 1,
      status: 1,
      image: 1,
      brand: 1,
    } as const;

    const [items, total] = await Promise.all([
      Product.find(filter, projection).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (e) {
    return next(e);
  }
};

// POS: lookup by sku or barcode
export const lookupProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sku = String(req.query.sku || '').trim();
    const barcode = String(req.query.barcode || '').trim();
    if (!sku && !barcode) {
      return res.status(400).json({ success: false, error: 'Provide sku or barcode' });
    }
    const filter: any = {};
    if (sku) filter.sku = sku;
    if (barcode) filter.barcode = barcode;

    const projection = {
      name: 1,
      sku: 1,
      category: 1,
      unitPrice: 1,
      baseUnit: 1,
      hasExpiryDate: 1,
      trackInventory: 1,
      alertQuantity: 1,
      status: 1,
      image: 1,
      brand: 1,
    } as const;

    const item = await Product.findOne(filter, projection).lean();
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    return res.json({ success: true, data: item });
  } catch (e) {
    return next(e);
  }
};

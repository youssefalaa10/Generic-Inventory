import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Customer from '../models/Customer';

const validateRequest = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
    return false;
  }
  return true;
};

export const listCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = String(req.query.q || '').trim();
    const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (projectId) filter.projectId = projectId;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Customer.countDocuments(filter),
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

export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!validateRequest(req, res)) return;
    const item = await Customer.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    return res.json({ success: true, data: item });
  } catch (e) {
    return next(e);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!validateRequest(req, res)) return;
    const payload = {
      ...req.body,
      addedBy: (req.headers['x-user-id'] as string) || 'System',
    };
    const created = await Customer.create(payload);
    return res.status(201).json({ success: true, data: created });
  } catch (e: any) {
    if (e && e.code === 11000) {
      const field = Object.keys(e.keyPattern || {})[0] || 'field';
      return res.status(409).json({ success: false, error: `Duplicate value for ${field}` });
    }
    if (e && e.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: 'Validation failed' });
    }
    return next(e);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!validateRequest(req, res)) return;
    const payload = {
      ...req.body,
      lastUpdatedBy: (req.headers['x-user-id'] as string) || 'System',
    };
    const updated = await Customer.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, error: 'Not found' });
    return res.json({ success: true, data: updated });
  } catch (e: any) {
    if (e && e.code === 11000) {
      const field = Object.keys(e.keyPattern || {})[0] || 'field';
      return res.status(409).json({ success: false, error: `Duplicate value for ${field}` });
    }
    if (e && e.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: 'Validation failed' });
    }
    return next(e);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!validateRequest(req, res)) return;
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Not found' });
    return res.json({ success: true, data: { id: req.params.id } });
  } catch (e) {
    return next(e);
  }
};



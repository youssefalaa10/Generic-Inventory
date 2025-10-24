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
  } catch (e) {
    return next(e);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!validateRequest(req, res)) return;
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, error: 'Not found' });
    return res.json({ success: true, data: updated });
  } catch (e) {
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

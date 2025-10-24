import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import InventoryVoucher from '../models/InventoryVoucher';

const router = Router();

// List all
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await InventoryVoucher.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: items });
  } catch (e) { next(e); }
});

// Get by id
router.get('/:id', [ param('id').isMongoId() ], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await InventoryVoucher.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: item });
  } catch (e) { next(e); }
});

// Create
router.post('/', [
  body('date').notEmpty().withMessage('date required'),
  body('type').isIn(['up','down']).withMessage('invalid type')
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const created = await InventoryVoucher.create({
      code: req.body.code,
      date: req.body.date,
      branchId: req.body.branchId,
      branchName: req.body.branchName,
      type: req.body.type,
      description: req.body.description,
      details: req.body.details,
      createdBy: req.body.createdBy,
      status: req.body.status || 'Draft',
      lines: req.body.lines || []
    });
    res.status(201).json({ success: true, data: created });
  } catch (e) { next(e); }
});

// Update
router.put('/:id', [ param('id').isMongoId() ], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await InventoryVoucher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: updated });
  } catch (e) { next(e); }
});

// Delete
router.delete('/:id', [ param('id').isMongoId() ], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await InventoryVoucher.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: { id: req.params.id } });
  } catch (e) { next(e); }
});

export default router;

import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import InventoryRequisition from '../models/InventoryRequisition';

const router = Router();

// List all
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await InventoryRequisition.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: items });
  } catch (e) { next(e); }
});

// Get by id
router.get('/:id', [ param('id').isMongoId() ], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await InventoryRequisition.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: item });
  } catch (e) { next(e); }
});

// Create
router.post('/', [
  body('date').notEmpty().withMessage('date required'),
  body('type').isIn(['Purchase','Transfer']).withMessage('invalid type'),
  body('items').isArray().withMessage('items must be array')
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const created = await InventoryRequisition.create({
      code: req.body.code,
      date: req.body.date,
      branchId: req.body.branchId,
      branchName: req.body.branchName,
      type: req.body.type,
      items: req.body.items,
      notes: req.body.notes,
      attachments: req.body.attachments,
      status: req.body.status || 'Draft'
    });
    res.status(201).json({ success: true, data: created });
  } catch (e) { next(e); }
});

// Update
router.put('/:id', [ param('id').isMongoId() ], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await InventoryRequisition.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: updated });
  } catch (e) { next(e); }
});

// Delete
router.delete('/:id', [ param('id').isMongoId() ], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await InventoryRequisition.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: { id: req.params.id } });
  } catch (e) { next(e); }
});

export default router;

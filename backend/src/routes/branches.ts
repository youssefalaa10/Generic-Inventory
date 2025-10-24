import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Branch, BranchDoc } from '../models/branch';
import { CustomError } from '../middleware/errorHandler';

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

// GET /api/branches - Get all branches with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('project').optional().isString().withMessage('Project must be a string'),
  query('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
  query('businessType').optional().isIn(['retail', 'wholesale', 'warehouse', 'office', 'factory', 'lab']).withMessage('Invalid business type'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || Number(process.env.DEFAULT_PAGE_SIZE) || 10;
    const skip = (page - 1) * limit;
    
    const search = req.query.search as string;
    const project = req.query.project as string;
    const status = req.query.status as string;
    const businessType = req.query.businessType as string;

    // Build filter object
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { project: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'contact.manager': { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (project) {
      filter.project = project;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (businessType) {
      filter.businessType = businessType;
    }

    const branches = await Branch.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalBranches = await Branch.countDocuments(filter);
    const totalPages = Math.ceil(totalBranches / limit);

    res.json({
      success: true,
      data: branches,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalBranches,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

// NOTE: Order matters. Keep specific routes BEFORE the dynamic '/:id' route.

// POST /api/branches - Create new branch
router.post('/', [
  body('name').notEmpty().withMessage('Branch name is required'),
  body('project').notEmpty().withMessage('Project is required'),
  body('code').optional().isString().withMessage('Code must be a string'),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
  body('businessType').optional().isIn(['retail', 'wholesale', 'warehouse', 'office', 'factory', 'lab']).withMessage('Invalid business type'),
  body('address.street').optional().isString().withMessage('Street must be a string'),
  body('address.city').optional().isString().withMessage('City must be a string'),
  body('address.state').optional().isString().withMessage('State must be a string'),
  body('address.postalCode').optional().isString().withMessage('Postal code must be a string'),
  body('address.country').optional().isString().withMessage('Country must be a string'),
  body('contact.phone').optional().isString().withMessage('Phone must be a string'),
  body('contact.email').optional().isEmail().withMessage('Invalid email format'),
  body('contact.manager').optional().isString().withMessage('Manager must be a string'),
  body('openingDate').optional().isISO8601().withMessage('Invalid opening date format'),
  body('closingDate').optional().isISO8601().withMessage('Invalid closing date format'),
  body('description').optional().isString().withMessage('Description must be a string'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const branchData = {
      ...req.body,
      createdBy: req.headers['x-user-id'] as string || 'system',
    };

    const branch = new Branch(branchData);
    await branch.save();

    res.status(201).json({
      success: true,
      data: branch,
      message: 'Branch created successfully',
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/branches/:id - Update branch
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid branch ID'),
  body('name').optional().notEmpty().withMessage('Branch name cannot be empty'),
  body('project').optional().notEmpty().withMessage('Project cannot be empty'),
  body('code').optional().isString().withMessage('Code must be a string'),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
  body('businessType').optional().isIn(['retail', 'wholesale', 'warehouse', 'office', 'factory', 'lab']).withMessage('Invalid business type'),
  body('openingDate').optional().isISO8601().withMessage('Invalid opening date format'),
  body('closingDate').optional().isISO8601().withMessage('Invalid closing date format'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updateData = {
      ...req.body,
      lastUpdatedBy: req.headers['x-user-id'] as string || 'system',
    };

    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!branch) {
      throw new CustomError('Branch not found', 404);
    }

    res.json({
      success: true,
      data: branch,
      message: 'Branch updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/branches/:id - Delete branch
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid branch ID'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const branch = await Branch.findById(req.params.id);
    
    if (!branch) {
      throw new CustomError('Branch not found', 404);
    }

    // Check if branch has active status
    if (branch.status === 'active') {
      throw new CustomError('Cannot delete active branch. Please deactivate it first.', 400);
    }

    await Branch.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Branch deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/branches/:id/status - Update branch status
router.patch('/:id/status', [
  param('id').isMongoId().withMessage('Invalid branch ID'),
  body('status').isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    
    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        lastUpdatedBy: req.headers['x-user-id'] as string || 'system',
      },
      { new: true }
    );

    if (!branch) {
      throw new CustomError('Branch not found', 404);
    }

    res.json({
      success: true,
      data: branch,
      message: `Branch status updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/branches/project/:project - Get branches by project
router.get('/project/:project', [
  param('project').notEmpty().withMessage('Project is required'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const branches = await Branch.find({ project: req.params.project }).sort({ createdAt: -1 }).lean();

    res.json({
      success: true,
      data: branches,
      count: branches.length,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/branches/active - Get active branches
router.get('/active', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const branches = await Branch.find({ status: 'active' }).sort({ createdAt: -1 }).lean();

    res.json({
      success: true,
      data: branches,
      count: branches.length,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/branches/search - Search branches
router.get('/search', [
  query('q').notEmpty().withMessage('Search query is required'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string;
    const branches = await Branch.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { project: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { 'contact.manager': { $regex: query, $options: 'i' } },
        { code: { $regex: query, $options: 'i' } },
      ],
    }).sort({ createdAt: -1 }).lean();

    res.json({
      success: true,
      data: branches,
      count: branches.length,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/branches/stats - Get branch statistics
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalBranches = await Branch.countDocuments();
    const activeBranches = await Branch.countDocuments({ status: 'active' });
    const inactiveBranches = await Branch.countDocuments({ status: 'inactive' });
    const suspendedBranches = await Branch.countDocuments({ status: 'suspended' });
    
    const projectStats = await Branch.aggregate([
      {
        $group: {
          _id: '$project',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          }
        }
      }
    ]);

    const businessTypeStats = await Branch.aggregate([
      {
        $group: {
          _id: '$businessType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalBranches,
        activeBranches,
        inactiveBranches,
        suspendedBranches,
        projectStats,
        businessTypeStats,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/branches/:id - Get single branch (placed AFTER specific routes)
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid branch ID'),
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      throw new CustomError('Branch not found', 404);
    }

    res.json({
      success: true,
      data: branch,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

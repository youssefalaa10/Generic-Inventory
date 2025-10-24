import mongoose, { Schema, InferSchemaType } from 'mongoose';

const StockMovementSchema = new Schema({
  inventory_item_id: {
    type: Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: [true, 'Inventory item ID is required']
  },
  item_name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [200, 'Item name cannot exceed 200 characters']
  },
  movement_type: {
    type: String,
    enum: {
      values: ['in', 'out', 'adjustment'],
      message: 'Movement type must be in, out, or adjustment'
    },
    required: [true, 'Movement type is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  reference_type: {
    type: String,
    default: '',
    trim: true,
    maxlength: [100, 'Reference type cannot exceed 100 characters']
  },
  notes: {
    type: String,
    default: '',
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  // Additional fields for enhanced tracking
  reference_id: {
    type: String,
    trim: true,
    maxlength: [100, 'Reference ID cannot exceed 100 characters']
  },
  reference_number: {
    type: String,
    trim: true,
    maxlength: [100, 'Reference number cannot exceed 100 characters']
  },
  unit_cost: {
    type: Number,
    min: [0, 'Unit cost cannot be negative']
  },
  total_cost: {
    type: Number,
    min: [0, 'Total cost cannot be negative']
  },
  location_from: {
    type: String,
    trim: true,
    maxlength: [100, 'Location from cannot exceed 100 characters']
  },
  location_to: {
    type: String,
    trim: true,
    maxlength: [100, 'Location to cannot exceed 100 characters']
  },
  batch_number: {
    type: String,
    trim: true,
    maxlength: [50, 'Batch number cannot exceed 50 characters']
  },
  serial_number: {
    type: String,
    trim: true,
    maxlength: [50, 'Serial number cannot exceed 50 characters']
  },
  expiry_date: {
    type: Date
  },
  // Audit fields
  created_by: {
    type: String,
    trim: true
  },
  approved_by: {
    type: String,
    trim: true
  },
  approved_at: {
    type: Date
  },
  created_at: {
    type: Date,
    default: () => new Date()
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
StockMovementSchema.index({ inventory_item_id: 1, created_at: -1 });
StockMovementSchema.index({ movement_type: 1 });
StockMovementSchema.index({ reference_type: 1 });
StockMovementSchema.index({ created_at: -1 });
StockMovementSchema.index({ reference_id: 1 });

// Virtual for formatted date
StockMovementSchema.virtual('formatted_date').get(function() {
  return this.created_at.toLocaleDateString('ar-EG');
});

// Virtual for movement direction
StockMovementSchema.virtual('direction').get(function() {
  return this.movement_type === 'in' ? 'إضافة' :
         this.movement_type === 'out' ? 'إزالة' : 'تعديل';
});

// Pre-save middleware to validate movement
StockMovementSchema.pre('save', function(next) {
  if (this.quantity <= 0) {
    return next(new Error('Quantity must be greater than 0'));
  }
  next();
});

// Static method to get movements by item
StockMovementSchema.statics.getMovementsByItem = function(itemId: string, limit = 50) {
  return this.find({ inventory_item_id: itemId })
    .sort({ created_at: -1 })
    .limit(limit)
    .populate('inventory_item_id', 'name sku barcode');
};

// Static method to get movements by date range
StockMovementSchema.statics.getMovementsByDateRange = function(startDate: Date, endDate: Date) {
  return this.find({
    created_at: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ created_at: -1 });
};

// Static method to get low stock movements
StockMovementSchema.statics.getLowStockMovements = function() {
  return this.aggregate([
    {
      $lookup: {
        from: 'inventoryitems',
        localField: 'inventory_item_id',
        foreignField: '_id',
        as: 'item'
      }
    },
    {
      $unwind: '$item'
    },
    {
      $match: {
        'item.currentStock': { $lte: '$item.minimumStock' }
      }
    },
    {
      $sort: { created_at: -1 }
    }
  ]);
};

export type StockMovementDoc = InferSchemaType<typeof StockMovementSchema> & {
  _id: mongoose.Types.ObjectId;
  formatted_date: string;
  direction: string;
};

export const StockMovement = mongoose.models.StockMovement || mongoose.model('StockMovement', StockMovementSchema);

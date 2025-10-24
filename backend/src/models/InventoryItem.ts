import mongoose, { Schema, InferSchemaType } from 'mongoose';

const InventoryItemSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [200, 'Item name cannot exceed 200 characters']
  },
  type: {
    type: String,
    default: 'supplies',
    enum: {
      values: ['packaging', 'supplies', 'fixtures', 'maintenance', 'security', 'marketing'],
      message: 'Invalid item type'
    }
  },
  currentStock: {
    type: Number,
    default: 0,
    min: [0, 'Current stock cannot be negative']
  },
  minimumStock: {
    type: Number,
    default: 0,
    min: [0, 'Minimum stock cannot be negative']
  },
  unit: {
    type: String,
    default: 'قطعة',
    required: [true, 'Unit is required'],
    trim: true
  },
  costPerUnit: {
    type: Number,
    default: 0,
    min: [0, 'Cost per unit cannot be negative']
  },
  location: {
    type: String,
    default: '',
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  barcode: {
    type: String,
    default: '',
    trim: true,
    unique: true,
    sparse: true, // Allow multiple null values
    maxlength: [50, 'Barcode cannot exceed 50 characters']
  },
  sku: {
    type: String,
    trim: true,
    unique: true,
    sparse: true, // Allow multiple null values
    maxlength: [50, 'SKU cannot exceed 50 characters']
  },
  locked: {
    type: Boolean,
    default: false
  },
  // Additional fields for enhanced functionality
  category: {
    type: String,
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters']
  },
  supplier: {
    type: String,
    trim: true,
    maxlength: [200, 'Supplier name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 }
  },
  expiryDate: {
    type: Date
  },
  batchNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Batch number cannot exceed 50 characters']
  },
  serialNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Serial number cannot exceed 50 characters']
  },
  manufacturer: {
    type: String,
    trim: true,
    maxlength: [200, 'Manufacturer name cannot exceed 200 characters']
  },
  originCountry: {
    type: String,
    trim: true,
    maxlength: [100, 'Origin country cannot exceed 100 characters']
  },
  manufactureDate: {
    type: Date
  },
  currentStatus: {
    type: String,
    default: 'مخزون',
    enum: {
      values: ['مخزون', 'مباع', 'مفقود', 'تالف', 'منتهي الصلاحية'],
      message: 'Invalid current status'
    }
  },
  transportMode: {
    type: String,
    trim: true,
    maxlength: [100, 'Transport mode cannot exceed 100 characters']
  },
  // Audit fields
  createdBy: {
    type: String,
    trim: true
  },
  lastUpdatedBy: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
InventoryItemSchema.index({ name: 'text', description: 'text' });
InventoryItemSchema.index({ type: 1 });
InventoryItemSchema.index({ currentStock: 1 });
InventoryItemSchema.index({ minimumStock: 1 });
InventoryItemSchema.index({ locked: 1 });
InventoryItemSchema.index({ createdAt: -1 });

// Virtual for low stock status
InventoryItemSchema.virtual('isLowStock').get(function() {
  return this.currentStock <= this.minimumStock;
});

// Virtual for total value
InventoryItemSchema.virtual('totalValue').get(function() {
  return this.currentStock * this.costPerUnit;
});

// Pre-save middleware to generate SKU if not provided
InventoryItemSchema.pre('save', function(next) {
  if (!this.sku && this.isNew) {
    this.sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  next();
});

// Pre-save middleware to validate stock levels
InventoryItemSchema.pre('save', function(next) {
  if (this.currentStock < 0) {
    return next(new Error('Current stock cannot be negative'));
  }
  if (this.minimumStock < 0) {
    return next(new Error('Minimum stock cannot be negative'));
  }
  next();
});

export type InventoryItemDoc = InferSchemaType<typeof InventoryItemSchema> & {
  _id: mongoose.Types.ObjectId;
  isLowStock: boolean;
  totalValue: number;
};

export const InventoryItem = mongoose.models.InventoryItem || mongoose.model('InventoryItem', InventoryItemSchema);

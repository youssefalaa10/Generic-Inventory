import mongoose, { Schema, InferSchemaType } from 'mongoose';

const OrderItemSchema = new Schema({
  inventory_item_id: {
    type: Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: [true, 'Inventory item ID is required']
  },
  sku: {
    type: String,
    trim: true,
    maxlength: [50, 'SKU cannot exceed 50 characters']
  },
  gtin: {
    type: String,
    trim: true,
    maxlength: [50, 'GTIN cannot exceed 50 characters']
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    trim: true,
    maxlength: [20, 'Unit cannot exceed 20 characters']
  },
  unitPrice: {
    type: Number,
    min: [0, 'Unit price cannot be negative']
  },
  totalPrice: {
    type: Number,
    min: [0, 'Total price cannot be negative']
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
  receivedQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Received quantity cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'partial', 'complete', 'cancelled'],
      message: 'Invalid item status'
    },
    default: 'pending'
  }
}, { _id: false });

const SupplyOrderSchema = new Schema({
  order_number: {
    type: String,
    required: [true, 'Order number is required'],
    trim: true,
    maxlength: [50, 'Order number cannot exceed 50 characters']
  },
  supplier_name: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true,
    maxlength: [200, 'Supplier name cannot exceed 200 characters']
  },
  supplier_id: {
    type: String,
    trim: true,
    maxlength: [100, 'Supplier ID cannot exceed 100 characters']
  },
  order_date: {
    type: Date,
    required: [true, 'Order date is required'],
    default: () => new Date()
  },
  expected_delivery: {
    type: Date,
    required: [true, 'Expected delivery date is required']
  },
  actual_delivery: {
    type: Date
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      message: 'Invalid order status'
    },
    default: 'pending'
  },
  total_amount: {
    type: Number,
    default: 0,
    min: [0, 'Total amount cannot be negative']
  },
  items: {
    type: [OrderItemSchema],
    default: [],
    validate: {
      validator: function(items: any[]) {
        return items.length > 0;
      },
      message: 'Order must have at least one item'
    }
  },
  notes: {
    type: String,
    default: '',
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },

  // Additional fields for enhanced functionality
  priority: {
    type: String,
    enum: {
      values: ['low', 'normal', 'high', 'urgent'],
      message: 'Invalid priority level'
    },
    default: 'normal'
  },
  payment_terms: {
    type: String,
    trim: true,
    maxlength: [200, 'Payment terms cannot exceed 200 characters']
  },
  shipping_method: {
    type: String,
    trim: true,
    maxlength: [100, 'Shipping method cannot exceed 100 characters']
  },
  tracking_number: {
    type: String,
    trim: true,
    maxlength: [100, 'Tracking number cannot exceed 100 characters']
  },
  delivery_address: {
    street: { type: String, trim: true, maxlength: [200, 'Street cannot exceed 200 characters'] },
    city: { type: String, trim: true, maxlength: [100, 'City cannot exceed 100 characters'] },
    state: { type: String, trim: true, maxlength: [100, 'State cannot exceed 100 characters'] },
    postalCode: { type: String, trim: true, maxlength: [20, 'Postal code cannot exceed 20 characters'] },
    country: { type: String, trim: true, maxlength: [100, 'Country cannot exceed 100 characters'] }
  },

  // Audit fields
  created_by: {
    type: String,
    trim: true,
    maxlength: [100, 'Created by cannot exceed 100 characters']
  },
  approved_by: {
    type: String,
    trim: true,
    maxlength: [100, 'Approved by cannot exceed 100 characters']
  },
  approved_at: {
    type: Date
  },
  cancelled_by: {
    type: String,
    trim: true,
    maxlength: [100, 'Cancelled by cannot exceed 100 characters']
  },
  cancelled_at: {
    type: Date
  },
  cancellation_reason: {
    type: String,
    trim: true,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
SupplyOrderSchema.index({ order_number: 1 });
SupplyOrderSchema.index({ supplier_name: 1 });
SupplyOrderSchema.index({ status: 1 });
SupplyOrderSchema.index({ order_date: -1 });
SupplyOrderSchema.index({ expected_delivery: 1 });
SupplyOrderSchema.index({ createdAt: -1 });

// Virtual for order summary
SupplyOrderSchema.virtual('summary').get(function() {
  return `${this.order_number} - ${this.supplier_name} (${this.items.length} items)`;
});

// Virtual for days until delivery
SupplyOrderSchema.virtual('daysUntilDelivery').get(function() {
  if (!this.expected_delivery) return null;
  const today = new Date();
  const delivery = new Date(this.expected_delivery);
  const diffTime = delivery.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for completion percentage
SupplyOrderSchema.virtual('completionPercentage').get(function() {
  if (this.items.length === 0) return 0;
  const totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
  const receivedQuantity = this.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
  return Math.round((receivedQuantity / totalQuantity) * 100);
});

// Pre-save middleware to generate order number if not provided
SupplyOrderSchema.pre('save', function(next) {
  if (!this.order_number && this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.order_number = `ORD-${year}${month}${day}-${random}`;
  }
  next();
});

// Pre-save middleware to calculate total amount
SupplyOrderSchema.pre('save', function(next) {
  this.total_amount = this.items.reduce((sum, item) => {
    return sum + (item.quantity * (item.unitPrice || 0));
  }, 0);
  next();
});

// Static method to get orders by status
SupplyOrderSchema.statics.getOrdersByStatus = function(status: string) {
  return this.find({ status }).sort({ order_date: -1 });
};

// Static method to get overdue orders
SupplyOrderSchema.statics.getOverdueOrders = function() {
  const today = new Date();
  return this.find({
    expected_delivery: { $lt: today },
    status: { $nin: ['delivered', 'cancelled'] }
  }).sort({ expected_delivery: 1 });
};

// Static method to get orders by supplier
SupplyOrderSchema.statics.getOrdersBySupplier = function(supplierName: string) {
  return this.find({ supplier_name: supplierName }).sort({ order_date: -1 });
};

export type SupplyOrderDoc = InferSchemaType<typeof SupplyOrderSchema> & {
  _id: mongoose.Types.ObjectId;
  summary: string;
  daysUntilDelivery: number | null;
  completionPercentage: number;
};

export interface SupplyOrderModel extends mongoose.Model<SupplyOrderDoc> {
  getOrdersByStatus(status: string): mongoose.Query<any[], SupplyOrderDoc>;
  getOverdueOrders(): mongoose.Query<any[], SupplyOrderDoc>;
  getOrdersBySupplier(supplierName: string): mongoose.Query<any[], SupplyOrderDoc>;
}

export const SupplyOrder = mongoose.models.SupplyOrder || mongoose.model<SupplyOrderDoc, SupplyOrderModel>('SupplyOrder', SupplyOrderSchema);

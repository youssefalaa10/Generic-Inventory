import mongoose, { Schema, InferSchemaType } from 'mongoose';

const SupplyChainSchema = new Schema({
  // Time field
  الوقت: {
    type: Date,
    default: () => new Date()
  },
  
  // ID field
  المعرف: {
    type: Number,
    required: [true, 'المعرف مطلوب']
  },
  
  // SKU field
  رمز_SKU: {
    type: String,
    trim: true,
    maxlength: [50, 'رمز SKU لا يمكن أن يتجاوز 50 حرف']
  },
  
  // GTIN field
  رمز_GTin: {
    type: String,
    trim: true,
    maxlength: [50, 'رمز GTIN لا يمكن أن يتجاوز 50 حرف']
  },
  
  // Batch number
  رقم_الدفعة: {
    type: String,
    trim: true,
    maxlength: [50, 'رقم الدفعة لا يمكن أن يتجاوز 50 حرف']
  },
  
  // Serial number
  الرقم_التسلسلي: {
    type: String,
    trim: true,
    maxlength: [50, 'الرقم التسلسلي لا يمكن أن يتجاوز 50 حرف']
  },
  
  // Product name
  اسم_المنتج: {
    type: String,
    required: [true, 'اسم المنتج مطلوب'],
    trim: true,
    maxlength: [200, 'اسم المنتج لا يمكن أن يتجاوز 200 حرف']
  },
  
  // Quantity
  الكمية: {
    type: Number,
    required: [true, 'الكمية مطلوبة'],
    min: [0, 'الكمية لا يمكن أن تكون سالبة']
  },
  
  // Unit
  الوحدة: {
    type: String,
    default: 'قطعة',
    trim: true,
    maxlength: [20, 'الوحدة لا يمكن أن تتجاوز 20 حرف']
  },
  
  // Manufacturer
  الشركة_المصنعة: {
    type: String,
    trim: true,
    maxlength: [200, 'اسم الشركة المصنعة لا يمكن أن يتجاوز 200 حرف']
  },
  
  // Origin country
  بلد_المنشأ: {
    type: String,
    trim: true,
    maxlength: [100, 'بلد المنشأ لا يمكن أن يتجاوز 100 حرف']
  },
  
  // Manufacture date
  تاريخ_التصنيع: {
    type: String,
    trim: true,
    maxlength: [20, 'تاريخ التصنيع لا يمكن أن يتجاوز 20 حرف']
  },
  
  // Expiry date
  تاريخ_الانتهاء: {
    type: String,
    trim: true,
    maxlength: [20, 'تاريخ الانتهاء لا يمكن أن يتجاوز 20 حرف']
  },
  
  // Current status
  الحالة_الحالية: {
    type: String,
    default: 'مخزون',
    enum: {
      values: ['مخزون', 'مباع', 'مفقود', 'تالف', 'منتهي الصلاحية', 'في النقل', 'مستلم'],
      message: 'حالة غير صالحة'
    }
  },
  
  // Transport mode
  وسيلة_النقل: {
    type: String,
    trim: true,
    maxlength: [100, 'وسيلة النقل لا يمكن أن تتجاوز 100 حرف']
  },
  
  // Additional metadata
  scan_session_name: {
    type: String,
    trim: true,
    maxlength: [100, 'اسم جلسة المسح لا يمكن أن يتجاوز 100 حرف']
  },
  device_name: {
    type: String,
    trim: true,
    maxlength: [100, 'اسم الجهاز لا يمكن أن يتجاوز 100 حرف']
  },
  timestamp: {
    type: String,
    trim: true
  },
  date_time: {
    type: String,
    trim: true
  },
  barcode: {
    type: String,
    trim: true,
    maxlength: [100, 'الباركود لا يمكن أن يتجاوز 100 حرف']
  },
  text: {
    type: String,
    trim: true,
    maxlength: [1000, 'النص لا يمكن أن يتجاوز 1000 حرف']
  },
  number: {
    type: Number
  },
  
  // Processing status
  processingStatus: {
    type: String,
    enum: {
      values: ['pending', 'processed', 'failed', 'ignored'],
      message: 'حالة المعالجة غير صالحة'
    },
    default: 'pending'
  },
  
  // Audit fields
  createdBy: {
    type: String,
    trim: true,
    maxlength: [100, 'اسم المنشئ لا يمكن أن يتجاوز 100 حرف']
  },
  sessionId: {
    type: String,
    trim: true,
    maxlength: [100, 'معرف الجلسة لا يمكن أن يتجاوز 100 حرف']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
SupplyChainSchema.index({ المعرف: 1 });
SupplyChainSchema.index({ رمز_SKU: 1 });
SupplyChainSchema.index({ رمز_GTin: 1 });
SupplyChainSchema.index({ اسم_المنتج: 'text' });
SupplyChainSchema.index({ الحالة_الحالية: 1 });
SupplyChainSchema.index({ الوقت: -1 });
SupplyChainSchema.index({ createdAt: -1 });

// Virtual for formatted date
SupplyChainSchema.virtual('formatted_date').get(function() {
  return this.الوقت.toLocaleDateString('ar-EG');
});

// Virtual for product summary
SupplyChainSchema.virtual('summary').get(function() {
  return `${this.اسم_المنتج} (${this.رمز_SKU || this.رمز_GTin || this.المعرف})`;
});

// Pre-save middleware to validate data
SupplyChainSchema.pre('save', function(next) {
  if (!this.رمز_SKU && !this.رمز_GTin && !this.barcode) {
    return next(new Error('يجب أن يحتوي المنتج على رمز SKU أو GTIN أو باركود'));
  }
  next();
});

// Static method to get items by status
SupplyChainSchema.statics.getByStatus = function(status: string) {
  return this.find({ الحالة_الحالية: status }).sort({ الوقت: -1 });
};

// Static method to get items by date range
SupplyChainSchema.statics.getByDateRange = function(startDate: Date, endDate: Date) {
  return this.find({
    الوقت: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ الوقت: -1 });
};

// Static method to get items by product
SupplyChainSchema.statics.getByProduct = function(skuOrGtin: string) {
  return this.find({
    $or: [
      { رمز_SKU: skuOrGtin },
      { رمز_GTin: skuOrGtin }
    ]
  }).sort({ الوقت: -1 });
};

export type SupplyChainDoc = InferSchemaType<typeof SupplyChainSchema> & {
  _id: mongoose.Types.ObjectId;
  formatted_date: string;
  summary: string;
};

export interface SupplyChainModel extends mongoose.Model<SupplyChainDoc> {
  getByStatus(status: string): mongoose.Query<any[], SupplyChainDoc>;
  getByDateRange(startDate: Date, endDate: Date): mongoose.Query<any[], SupplyChainDoc>;
  getByProduct(skuOrGtin: string): mongoose.Query<any[], SupplyChainDoc>;
}

export const SupplyChain = mongoose.models.SupplyChain || mongoose.model<SupplyChainDoc, SupplyChainModel>('SupplyChain', SupplyChainSchema);

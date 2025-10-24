import mongoose, { Schema, InferSchemaType } from 'mongoose';

const ScanSchema = new Schema({
  // Basic scan data
  barcode: {
    type: String,
    trim: true,
    maxlength: [100, 'Barcode cannot exceed 100 characters']
  },
  text: {
    type: String,
    trim: true,
    maxlength: [1000, 'Text cannot exceed 1000 characters']
  },
  raw: {
    type: Schema.Types.Mixed
  },
  receivedAt: {
    type: Date,
    default: () => new Date()
  },

  // Parsed QR/Supply Chain data
  parsed: {
    id: {
      type: Number,
      min: [0, 'ID cannot be negative']
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
    productName: {
      type: String,
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    quantity: {
      type: Number,
      min: [0, 'Quantity cannot be negative']
    },
    unit: {
      type: String,
      trim: true,
      maxlength: [20, 'Unit cannot exceed 20 characters']
    },
    manufacturer: {
      type: String,
      trim: true,
      maxlength: [200, 'Manufacturer cannot exceed 200 characters']
    },
    originCountry: {
      type: String,
      trim: true,
      maxlength: [100, 'Origin country cannot exceed 100 characters']
    },
    manufactureDate: {
      type: String,
      trim: true,
      maxlength: [20, 'Manufacture date cannot exceed 20 characters']
    },
    expiryDate: {
      type: String,
      trim: true,
      maxlength: [20, 'Expiry date cannot exceed 20 characters']
    },
    currentStatus: {
      type: String,
      trim: true,
      maxlength: [50, 'Current status cannot exceed 50 characters']
    },
    transportMode: {
      type: String,
      trim: true,
      maxlength: [100, 'Transport mode cannot exceed 100 characters']
    }
  },

  // Additional metadata
  scanType: {
    type: String,
    enum: {
      values: ['barcode', 'qr', 'manual', 'camera'],
      message: 'Invalid scan type'
    },
    default: 'qr'
  },
  deviceInfo: {
    deviceName: {
      type: String,
      trim: true,
      maxlength: [100, 'Device name cannot exceed 100 characters']
    },
    deviceType: {
      type: String,
      trim: true,
      maxlength: [50, 'Device type cannot exceed 50 characters']
    },
    appVersion: {
      type: String,
      trim: true,
      maxlength: [20, 'App version cannot exceed 20 characters']
    }
  },
  location: {
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    }
  },
  processingStatus: {
    type: String,
    enum: {
      values: ['pending', 'processed', 'failed', 'ignored'],
      message: 'Invalid processing status'
    },
    default: 'pending'
  },
  processingError: {
    type: String,
    trim: true,
    maxlength: [500, 'Processing error cannot exceed 500 characters']
  },
  processedAt: {
    type: Date
  },

  // Audit fields
  createdBy: {
    type: String,
    trim: true,
    maxlength: [100, 'Created by cannot exceed 100 characters']
  },
  sessionId: {
    type: String,
    trim: true,
    maxlength: [100, 'Session ID cannot exceed 100 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
ScanSchema.index({ receivedAt: -1 });
ScanSchema.index({ 'parsed.sku': 1 });
ScanSchema.index({ 'parsed.gtin': 1 });
ScanSchema.index({ 'parsed.productName': 'text' });
ScanSchema.index({ scanType: 1 });
ScanSchema.index({ processingStatus: 1 });
ScanSchema.index({ sessionId: 1 });

// Virtual for formatted date
ScanSchema.virtual('formatted_date').get(function() {
  return this.receivedAt.toLocaleDateString('ar-EG');
});

// Virtual for scan summary
ScanSchema.virtual('summary').get(function() {
  if (this.parsed?.productName) {
    return `${this.parsed.productName} (${this.parsed.sku || this.parsed.gtin || 'No ID'})`;
  }
  return this.barcode || this.text || 'Unknown scan';
});

// Pre-save middleware to validate scan data
ScanSchema.pre('save', function(next) {
  if (!this.barcode && !this.text && !this.raw) {
    return next(new Error('Scan must have at least barcode, text, or raw data'));
  }
  next();
});

// Static method to get scans by date range
ScanSchema.statics.getScansByDateRange = function(startDate: Date, endDate: Date) {
  return this.find({
    receivedAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ receivedAt: -1 });
};

// Static method to get scans by product
ScanSchema.statics.getScansByProduct = function(skuOrGtin: string) {
  return this.find({
    $or: [
      { 'parsed.sku': skuOrGtin },
      { 'parsed.gtin': skuOrGtin }
    ]
  }).sort({ receivedAt: -1 });
};

// Static method to get pending scans
ScanSchema.statics.getPendingScans = function() {
  return this.find({ processingStatus: 'pending' })
    .sort({ receivedAt: 1 });
};

// Static method to mark scan as processed
ScanSchema.statics.markAsProcessed = function(scanId: string, error?: string) {
  const updateData: any = {
    processedAt: new Date()
  };

  if (error) {
    updateData.processingStatus = 'failed';
    updateData.processingError = error;
  } else {
    updateData.processingStatus = 'processed';
  }

  return this.findByIdAndUpdate(scanId, updateData, { new: true });
};

export type ScanDoc = InferSchemaType<typeof ScanSchema> & {
  _id: mongoose.Types.ObjectId;
  formatted_date: string;
  summary: string;
};

export interface ScanModel extends mongoose.Model<ScanDoc> {
  getScansByDateRange(startDate: Date, endDate: Date): mongoose.Query<any[], ScanDoc>;
  getScansByProduct(skuOrGtin: string): mongoose.Query<any[], ScanDoc>;
  getPendingScans(): mongoose.Query<any[], ScanDoc>;
  markAsProcessed(scanId: string, error?: string): mongoose.Query<ScanDoc | null, ScanDoc>;
}

export const Scan = mongoose.models.Scan || mongoose.model<ScanDoc, ScanModel>('Scan', ScanSchema);

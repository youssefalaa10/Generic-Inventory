import mongoose, { Schema, InferSchemaType } from 'mongoose';

const BranchSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Branch name is required'],
    trim: true,
    maxlength: [200, 'Branch name cannot exceed 200 characters']
  },
  project: {
    type: String,
    required: [true, 'Project is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  code: {
    type: String,
    trim: true,
    unique: true,
    sparse: true, // Allow multiple null values
    maxlength: [20, 'Branch code cannot exceed 20 characters']
  },
  address: {
    street: { type: String, trim: true, maxlength: [200, 'Street cannot exceed 200 characters'] },
    city: { type: String, trim: true, maxlength: [100, 'City cannot exceed 100 characters'] },
    state: { type: String, trim: true, maxlength: [100, 'State cannot exceed 100 characters'] },
    postalCode: { type: String, trim: true, maxlength: [20, 'Postal code cannot exceed 20 characters'] },
    country: { type: String, trim: true, maxlength: [100, 'Country cannot exceed 100 characters'] }
  },
  contact: {
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [100, 'Email cannot exceed 100 characters']
    },
    manager: {
      type: String,
      trim: true,
      maxlength: [100, 'Manager name cannot exceed 100 characters']
    }
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'suspended'],
      message: 'Invalid branch status'
    },
    default: 'active'
  },
  openingDate: {
    type: Date,
    default: () => new Date()
  },
  closingDate: {
    type: Date
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  // Business information
  businessType: {
    type: String,
    enum: {
      values: ['retail', 'wholesale', 'warehouse', 'office', 'factory', 'lab'],
      message: 'Invalid business type'
    },
    default: 'retail'
  },
  capacity: {
    maxEmployees: { type: Number, min: 0 },
    maxInventory: { type: Number, min: 0 },
    maxCustomers: { type: Number, min: 0 }
  },
  // Financial information
  budget: {
    monthly: { type: Number, min: 0 },
    annual: { type: Number, min: 0 }
  },
  // Operating hours
  operatingHours: {
    monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    sunday: { open: String, close: String, isOpen: { type: Boolean, default: true } }
  },
  // Audit fields
  createdBy: {
    type: String,
    trim: true,
    maxlength: [100, 'Created by cannot exceed 100 characters']
  },
  lastUpdatedBy: {
    type: String,
    trim: true,
    maxlength: [100, 'Last updated by cannot exceed 100 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
BranchSchema.index({ name: 'text', description: 'text' });
BranchSchema.index({ project: 1 });
BranchSchema.index({ status: 1 });
BranchSchema.index({ code: 1 });
BranchSchema.index({ 'contact.email': 1 });
BranchSchema.index({ createdAt: -1 });

// Virtual for full address
BranchSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  if (!addr) return '';
  
  const parts = [];
  if (addr.street) parts.push(addr.street);
  if (addr.city) parts.push(addr.city);
  if (addr.state) parts.push(addr.state);
  if (addr.postalCode) parts.push(addr.postalCode);
  if (addr.country) parts.push(addr.country);
  
  return parts.join(', ');
});

// Virtual for branch summary
BranchSchema.virtual('summary').get(function() {
  return `${this.name} - ${this.project}`;
});

// Virtual for is operational
BranchSchema.virtual('isOperational').get(function() {
  return this.status === 'active' && !this.closingDate;
});

// Pre-save middleware to generate branch code if not provided
BranchSchema.pre('save', function(next) {
  if (!this.code && this.isNew) {
    const projectPrefix = this.project.substring(0, 3).toUpperCase();
    const randomSuffix = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.code = `${projectPrefix}-${randomSuffix}`;
  }
  next();
});

// Pre-save middleware to validate dates
BranchSchema.pre('save', function(next) {
  if (this.closingDate && this.openingDate && this.closingDate < this.openingDate) {
    return next(new Error('Closing date cannot be before opening date'));
  }
  next();
});

// Static method to get branches by project
BranchSchema.statics.getBranchesByProject = function(project: string) {
  return this.find({ project }).sort({ name: 1 });
};

// Static method to get active branches
BranchSchema.statics.getActiveBranches = function() {
  return this.find({ status: 'active' }).sort({ name: 1 });
};

// Static method to get branches by status
BranchSchema.statics.getBranchesByStatus = function(status: string) {
  return this.find({ status }).sort({ name: 1 });
};

// Static method to search branches
BranchSchema.statics.searchBranches = function(query: string) {
  return this.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { project: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { 'contact.manager': { $regex: query, $options: 'i' } }
    ]
  }).sort({ name: 1 });
};

export type BranchDoc = InferSchemaType<typeof BranchSchema> & {
  _id: mongoose.Types.ObjectId;
  fullAddress: string;
  summary: string;
  isOperational: boolean;
};

export interface BranchModel extends mongoose.Model<BranchDoc> {
  getBranchesByProject(project: string): mongoose.Query<any[], BranchDoc>;
  getActiveBranches(): mongoose.Query<any[], BranchDoc>;
  getBranchesByStatus(status: string): mongoose.Query<any[], BranchDoc>;
  searchBranches(query: string): mongoose.Query<any[], BranchDoc>;
}

export const Branch = mongoose.models.Branch || mongoose.model<BranchDoc, BranchModel>('Branch', BranchSchema);

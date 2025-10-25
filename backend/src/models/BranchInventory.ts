import mongoose, { Schema, InferSchemaType } from 'mongoose';

const BranchInventorySchema = new Schema({
  branchId: { type: Number, required: true, index: true },
  productId: { type: Number, required: true, index: true },
  quantity: { type: Number, required: true, min: [0, 'Quantity cannot be negative'], default: 0 },
  minStock: { type: Number, required: true, min: [0, 'Minimum stock cannot be negative'], default: 0 },
  lotNumber: { type: String, trim: true, maxlength: [50, 'Lot number cannot exceed 50 characters'] },
  expiryDate: { type: Date },
  // Audit
  createdBy: { type: String, trim: true },
  lastUpdatedBy: { type: String, trim: true },
}, {
  timestamps: true,
});

// Prevent duplicate per-branch per-product per-lot
BranchInventorySchema.index({ branchId: 1, productId: 1, lotNumber: 1 }, { unique: true, sparse: true });
BranchInventorySchema.index({ expiryDate: 1 });

// Business validation
BranchInventorySchema.pre('save', function(next) {
  if (this.minStock > this.quantity) {
    // allow temporarily but could warn; we'll enforce via route validation when both provided on create/update
  }
  next();
});

export type BranchInventoryDoc = InferSchemaType<typeof BranchInventorySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const BranchInventory = mongoose.models.BranchInventory || mongoose.model('BranchInventory', BranchInventorySchema);

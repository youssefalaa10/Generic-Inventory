import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number;
  branchId?: number;
  projectId?: number;
  addedBy?: string;
  lastUpdatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true, maxlength: 150 },
  address: { type: String, trim: true, maxlength: 200 },
  balance: { type: Number, default: 0 },
  branchId: { type: Number },
  projectId: { type: Number },
  addedBy: { type: String, trim: true },
  lastUpdatedBy: { type: String, trim: true },
}, { timestamps: true });

// Indexes and constraints
CustomerSchema.index({ phone: 1 }, { unique: true });
CustomerSchema.index({ email: 1 }, { unique: true, sparse: true });
CustomerSchema.index({ name: 'text', phone: 'text', email: 'text' });

export default mongoose.model<ICustomer>('Customer', CustomerSchema);



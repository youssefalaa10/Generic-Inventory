import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryVoucherLine { productId: number; quantity: number; }

export interface IInventoryVoucher extends Document {
  code?: string;
  date: Date;
  branchId?: string;
  branchName?: string;
  type: 'up' | 'down';
  description?: string;
  details?: string;
  createdBy?: string;
  status?: 'Draft' | 'Approved' | 'Cancelled';
  lines?: IInventoryVoucherLine[];
  createdAt: Date;
  updatedAt: Date;
}

const InventoryVoucherLineSchema = new Schema<IInventoryVoucherLine>({
  productId: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 0 },
}, { _id: false });

const InventoryVoucherSchema = new Schema<IInventoryVoucher>({
  code: { type: String },
  date: { type: Date, required: true },
  branchId: { type: String },
  branchName: { type: String },
  type: { type: String, enum: ['up', 'down'], required: true },
  description: { type: String },
  details: { type: String },
  createdBy: { type: String },
  status: { type: String, enum: ['Draft', 'Approved', 'Cancelled'], default: 'Draft' },
  lines: { type: [InventoryVoucherLineSchema], default: [] },
}, { timestamps: true });

export default mongoose.model<IInventoryVoucher>('InventoryVoucher', InventoryVoucherSchema);

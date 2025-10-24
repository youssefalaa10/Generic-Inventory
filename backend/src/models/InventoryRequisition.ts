import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryRequisitionItem {
  productId: number;
  quantity: number;
}

export interface IInventoryRequisition extends Document {
  code?: string;
  date: Date;
  branchId?: string;
  branchName?: string;
  type: 'Purchase' | 'Transfer';
  items: IInventoryRequisitionItem[];
  notes?: string;
  attachments?: any[];
  status?: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

const InventoryRequisitionItemSchema = new Schema<IInventoryRequisitionItem>({
  productId: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 0 },
}, { _id: false });

const InventoryRequisitionSchema = new Schema<IInventoryRequisition>({
  code: { type: String },
  date: { type: Date, required: true },
  branchId: { type: String },
  branchName: { type: String },
  type: { type: String, enum: ['Purchase', 'Transfer'], required: true },
  items: { type: [InventoryRequisitionItemSchema], default: [] },
  notes: { type: String },
  attachments: { type: Array, default: [] },
  status: { type: String, enum: ['Draft', 'Pending', 'Approved', 'Rejected'], default: 'Draft' },
}, { timestamps: true });

export default mongoose.model<IInventoryRequisition>('InventoryRequisition', InventoryRequisitionSchema);

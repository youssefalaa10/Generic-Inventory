import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku: string;
  category: string;
  baseUnit: 'pcs' | 'g' | 'ml';
  unitPrice?: number;
  purchasePrice?: number;
  description?: string;
  brand?: string;
  isTaxable?: boolean;
  lowestSellingPrice?: number;
  discountPercent?: number;
  hasExpiryDate?: boolean;
  trackInventory?: boolean;
  alertQuantity?: number;
  status?: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  baseUnit: { type: String, enum: ['pcs', 'g', 'ml'], required: true },
  unitPrice: { type: Number, default: 0 },
  purchasePrice: { type: Number, default: 0 },
  description: { type: String },
  brand: { type: String },
  isTaxable: { type: Boolean, default: false },
  lowestSellingPrice: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
  hasExpiryDate: { type: Boolean, default: false },
  trackInventory: { type: Boolean, default: true },
  alertQuantity: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', ProductSchema);

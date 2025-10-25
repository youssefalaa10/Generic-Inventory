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
  // Frontend-aligned optional fields
  productLine?: string;
  fragranceNotes?: { top?: string; middle?: string; base?: string };
  components?: { productId: number; quantity: number }[];
  barcode?: string;
  density?: number;
  unitTemplate?: string;
  taxId?: number;
  trackingType?: 'None' | 'Quantity';
  internalNotes?: string;
  tags?: string;
  supplierProductCode?: string;
  image?: string;
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
  productLine: { type: String },
  fragranceNotes: { top: String, middle: String, base: String },
  components: [{ productId: Number, quantity: Number }],
  barcode: { type: String, index: true },
  density: { type: Number },
  unitTemplate: { type: String },
  taxId: { type: Number },
  trackingType: { type: String, enum: ['None', 'Quantity'], default: 'Quantity' },
  internalNotes: { type: String },
  tags: { type: String },
  supplierProductCode: { type: String },
  image: { type: String },
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', ProductSchema);

import React from 'react';
import { Sale, Product } from '../types';

interface StickerTemplateProps {
  sale: Sale;
  products: Product[];
}

const StickerTemplate: React.FC<StickerTemplateProps> = ({ sale, products }) => {
  // Filter for composite products that have been sold
  const itemsToPrint = sale.items.filter(item => {
    const product = products.find(p => p.id === item.productId);
    return product?.components && product.components.length > 0;
  });

  // Create an array of stickers, one for each quantity of each composite item
  const stickers = itemsToPrint.flatMap(item => 
    Array.from({ length: item.quantity }, (_, i) => ({
      id: `${item.id}-${i}`,
      name: item.productName
    }))
  );

  if (stickers.length === 0) {
      return (
          <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Tajawal, sans-serif' }}>
              <h2>لا توجد ملصقات للطباعة</h2>
              <p>هذه العملية لا تحتوي على منتجات مركبة تتطلب ملصقات.</p>
          </div>
      );
  }

  return (
    <div className="sticker-sheet">
      {stickers.map(sticker => (
        <div key={sticker.id} className="sticker">
          <h3>{sticker.name}</h3>
        </div>
      ))}
    </div>
  );
};

export default StickerTemplate;

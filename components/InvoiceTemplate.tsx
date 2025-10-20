import React from 'react';
import { Sale } from '../types';

interface InvoiceTemplateProps {
  sale: Sale;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ sale }) => {
  const subtotal = sale.items.reduce((acc, item) => acc + item.total, 0);
  const tax = 0; // Assuming 0 tax as per POS calculation
  const total = subtotal + tax;
  
  const company = {
      name: "شركة العطور العربية (Arabiva)",
      address: "مجمع الأفنيوز، الكويت",
      phone: "+965 1234 5678"
  };

  return (
    <div className="invoice-container">
      <div className="invoice-header">
        <div>
          <h1 style={{ margin: 0, color: '#333' }}>فاتورة ضريبية</h1>
          <p><strong>رقم الفاتورة:</strong> {sale.invoiceNumber || `INV-${sale.id}`}</p>
          <p><strong>التاريخ:</strong> {new Date(sale.date).toLocaleDateString('ar-EG')}</p>
        </div>
        <div>
          <h2 style={{ margin: '0 0 5px 0' }}>{company.name}</h2>
          <p style={{ margin: '0', fontSize: '12px' }}>{company.address}</p>
          <p style={{ margin: '0', fontSize: '12px' }}>{company.phone}</p>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', marginBottom: '20px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
         <h3 style={{ fontSize: '14px' }}>فاتورة إلى:</h3>
         <p>{sale.customerName}</p>
      </div>

      <table className="invoice-table">
        <thead>
          <tr>
            <th>#</th>
            <th>المنتج</th>
            <th>الكمية</th>
            <th>سعر الوحدة</th>
            <th>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.productName}</td>
              <td>{item.quantity}</td>
              <td>{item.unitPrice.toFixed(2)} د.ك</td>
              <td>{item.total.toFixed(2)} د.ك</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-totals">
        <table style={{ width: '100%' }}>
            <tbody>
                <tr><td>المجموع الفرعي:</td><td>{subtotal.toFixed(2)} د.ك</td></tr>
                <tr><td>الضريبة (0%):</td><td>{tax.toFixed(2)} د.ك</td></tr>
                <tr style={{fontWeight: 'bold', fontSize: '1.2em'}}><td>الإجمالي:</td><td>{total.toFixed(2)} د.ك</td></tr>
            </tbody>
        </table>
      </div>

      <div style={{ marginTop: '30mm', paddingTop: '10mm', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '12px' }}>
        <p>شكراً لتعاملكم معنا!</p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
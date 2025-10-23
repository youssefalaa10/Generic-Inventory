import React from 'react';
import { RenewableItem } from '../types';

interface LicensePrintTemplateProps {
  item: RenewableItem;
}

const LicensePrintTemplate: React.FC<LicensePrintTemplateProps> = ({ item }) => {
  const company = {
      name: "شركة العطور العربية (Arabiva)",
      address: "مجمع الأفنيوز، الكويت",
  };
  
  const categoryTranslations: { [key: string]: string } = {
    'License': 'رخصة',
    'Vehicle': 'مركبة',
    'Permit': 'تصريح',
    'Subscription': 'اشتراك',
    'Other': 'أخرى'
  };

  return (
    <div className="invoice-container" style={{ fontFamily: 'Tajawal, sans-serif' }}>
      <div className="invoice-header">
        <div>
          <h1 style={{ margin: 0, color: '#333' }}>تفاصيل عنصر للمتابعة</h1>
          <p><strong>تاريخ الطباعة:</strong> {new Date().toLocaleDateString('ar-EG')}</p>
        </div>
        <div>
          <h2 style={{ margin: '0 0 5px 0' }}>{company.name}</h2>
          <p style={{ margin: '0', fontSize: '12px' }}>{company.address}</p>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', borderTop: '2px solid #333', paddingTop: '20px', fontSize: '14pt', lineHeight: 1.8 }}>
        <p><strong>الفئة:</strong> {categoryTranslations[item.category] || item.category}</p>
        <p><strong>اسم العنصر:</strong> {item.name}</p>
        <p><strong>المُعرّف (الرقم):</strong> {item.identifier}</p>
        <p><strong>تاريخ الإصدار:</strong> {new Date(item.issueDate).toLocaleDateString('ar-EG')}</p>
        <p style={{ fontWeight: 'bold' }}><strong>تاريخ الانتهاء:</strong> {new Date(item.expiryDate).toLocaleDateString('ar-EG')}</p>
      </div>

      <div style={{ marginTop: '30mm', paddingTop: '10mm', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '12px' }}>
        <p>مستند داخلي - نظام الإدارة المالية</p>
      </div>
    </div>
  );
};

export default LicensePrintTemplate;
import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { XIcon } from './Icon';
import {
    Stepper,
    StepperIndicator,
    StepperItem,
    StepperSeparator,
    StepperTrigger
} from './ui/stepper';

// Simple Check Icon component
const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// Mock data for materials and packaging options
const MATERIALS = [
  { id: 1, name: 'بلاستيك', nameEn: 'Plastic', price: 0 },
  { id: 2, name: 'زجاج', nameEn: 'Glass', price: 2 },
  { id: 3, name: 'معدن', nameEn: 'Metal', price: 3 },
  { id: 4, name: 'ورق مقوى', nameEn: 'Cardboard', price: 1 }
];

const PACKAGING_OPTIONS = [
  { id: 1, name: 'زجاجة', nameEn: 'Bottle', price: 1 },
  { id: 2, name: 'صندوق', nameEn: 'Box', price: 1.5 },
  { id: 3, name: 'علبة', nameEn: 'Can', price: 0.5 },
  { id: 4, name: 'كيس', nameEn: 'Bag', price: 0.3 }
];

interface ProductConfigModalProps {
  product: Product & { stock: number };
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (config: CartItemConfig) => void;
}

export interface CartItemConfig {
  product: Product & { stock: number };
  quantity: number;
  material: typeof MATERIALS[0] | null;
  packaging: typeof PACKAGING_OPTIONS[0] | null;
  totalPrice: number;
}

const ProductConfigModal: React.FC<ProductConfigModalProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart 
}) => {
  // Current step (1-4)
  const [currentStep, setCurrentStep] = useState(1);
  
  // Configuration state
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedMaterial, setSelectedMaterial] = useState<typeof MATERIALS[0] | null>(null);
  const [selectedPackaging, setSelectedPackaging] = useState<typeof PACKAGING_OPTIONS[0] | null>(null);

  // Calculate total price dynamically
  const calculateTotalPrice = () => {
    const basePrice = product.unitPrice * quantity;
    const materialPrice = selectedMaterial ? selectedMaterial.price * quantity : 0;
    const packagingPrice = selectedPackaging ? selectedPackaging.price * quantity : 0;
    return basePrice + materialPrice + packagingPrice;
  };

  const totalPrice = calculateTotalPrice();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setQuantity(1);
      setSelectedMaterial(null);
      setSelectedPackaging(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Step titles in Arabic
  const steps = [
    { number: 1, title: 'إدخال الكمية', titleEn: 'Enter Quantity' },
    { number: 2, title: 'اختيار الخامة', titleEn: 'Select Material' },
    { number: 3, title: 'التعبئة والتغليف', titleEn: 'Packaging' },
    { number: 4, title: 'نظرة عامة', titleEn: 'Overview' }
  ];

  // Handle next button
  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle previous button
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    const config: CartItemConfig = {
      product,
      quantity,
      material: selectedMaterial,
      packaging: selectedPackaging,
      totalPrice
    };
    onAddToCart(config);
    onClose();
  };

  // Validation for each step
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return quantity > 0 && quantity <= product.stock;
      case 2:
        return selectedMaterial !== null;
      case 3:
        return selectedPackaging !== null;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div 
      className="modal-backdrop" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div 
        className="modal-content glass-pane" 
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '800px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          background: 'var(--surface-bg)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Modal Header */}
        <div 
          className="modal-header" 
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--surface-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
              تكوين المنتج
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
              {product.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              color: 'var(--text-secondary)'
            }}
          >
            <XIcon style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        {/* Stepper */}
        <div style={{ padding: '2rem 1.5rem 1rem 1.5rem' }}>
          <Stepper value={currentStep}>
            {steps.map((step, index) => (
              <StepperItem 
                key={step.number} 
                step={step.number} 
                className={index < steps.length - 1 ? 'not-last:flex-1' : ''}
              >
                <StepperTrigger>
                  <StepperIndicator asChild>
                    {step.number}
                  </StepperIndicator>
                </StepperTrigger>
                {index < steps.length - 1 && <StepperSeparator />}
              </StepperItem>
            ))}
          </Stepper>
          
          {/* Current step title */}
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--primary-color)' }}>
              {steps[currentStep - 1].title}
            </h3>
          </div>
        </div>

        {/* Modal Body - Step Content */}
        <div 
          className="modal-body" 
          style={{ 
            padding: '1.5rem',
            minHeight: '300px'
          }}
        >
          {/* Step 1: إدخال الكمية (Enter Quantity) */}
          {currentStep === 1 && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                المخزون المتاح: {product.stock} {product.baseUnit !== 'pcs' ? product.baseUnit : 'قطعة'}
              </p>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="btn btn-ghost"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    fontSize: '1.5rem'
                  }}
                >
                  -
                </button>
                
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.min(Math.max(1, val), product.stock));
                  }}
                  className="form-input"
                  style={{
                    width: '120px',
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    padding: '0.75rem'
                  }}
                  min={1}
                  max={product.stock}
                />
                
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="btn btn-ghost"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    fontSize: '1.5rem'
                  }}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>

              <div style={{
                padding: '1rem',
                background: 'var(--highlight-hover)',
                borderRadius: '8px',
                marginTop: '2rem'
              }}>
                <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.125rem' }}>
                  السعر الأساسي: {(product.unitPrice * quantity).toFixed(2)} د.ك
                </p>
              </div>
            </div>
          )}

          {/* Step 2: اختيار الخامة (Select Material) */}
          {currentStep === 2 && (
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', textAlign: 'center' }}>
                اختر المادة المفضلة للمنتج
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem'
              }}>
                {MATERIALS.map((material) => (
                  <div
                    key={material.id}
                    onClick={() => setSelectedMaterial(material)}
                    style={{
                      padding: '1.5rem',
                      border: `2px solid ${selectedMaterial?.id === material.id ? 'var(--primary-color)' : 'var(--surface-border)'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      background: selectedMaterial?.id === material.id ? 'var(--highlight-hover)' : 'transparent',
                      position: 'relative'
                    }}
                  >
                    {selectedMaterial?.id === material.id && (
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: 'var(--primary-color)',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CheckIcon style={{ width: '14px', height: '14px', color: 'white' }} />
                      </div>
                    )}
                    
                    <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{material.name}</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {material.price > 0 ? `+${material.price.toFixed(2)} د.ك` : 'مجاناً'}
                    </p>
                  </div>
                ))}
              </div>

              {selectedMaterial && (
                <div style={{
                  padding: '1rem',
                  background: 'var(--highlight-hover)',
                  borderRadius: '8px',
                  marginTop: '1.5rem',
                  textAlign: 'center'
                }}>
                  <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    السعر الإجمالي: {totalPrice.toFixed(2)} د.ك
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: التعبئة والتغليف (Packaging) */}
          {currentStep === 3 && (
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', textAlign: 'center' }}>
                اختر نوع التغليف المناسب
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem'
              }}>
                {PACKAGING_OPTIONS.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackaging(pkg)}
                    style={{
                      padding: '1.5rem',
                      border: `2px solid ${selectedPackaging?.id === pkg.id ? 'var(--primary-color)' : 'var(--surface-border)'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      background: selectedPackaging?.id === pkg.id ? 'var(--highlight-hover)' : 'transparent',
                      position: 'relative'
                    }}
                  >
                    {selectedPackaging?.id === pkg.id && (
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: 'var(--primary-color)',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CheckIcon style={{ width: '14px', height: '14px', color: 'white' }} />
                      </div>
                    )}
                    
                    <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{pkg.name}</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {pkg.price > 0 ? `+${pkg.price.toFixed(2)} د.ك` : 'مجاناً'}
                    </p>
                  </div>
                ))}
              </div>

              {selectedPackaging && (
                <div style={{
                  padding: '1rem',
                  background: 'var(--highlight-hover)',
                  borderRadius: '8px',
                  marginTop: '1.5rem',
                  textAlign: 'center'
                }}>
                  <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    السعر الإجمالي: {totalPrice.toFixed(2)} د.ك
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: نظرة عامة وإضافة للسلة (Overview & Add to Cart) */}
          {currentStep === 4 && (
            <div>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: 600, 
                marginBottom: '1.5rem',
                textAlign: 'center',
                color: 'var(--primary-color)'
              }}>
                ملخص التكوين
              </h3>

              <div style={{
                background: 'var(--surface-bg)',
                border: '1px solid var(--surface-border)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>المنتج</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>{product.name}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {product.unitPrice.toFixed(2)} د.ك × {quantity} = {(product.unitPrice * quantity).toFixed(2)} د.ك
                  </p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>الخامة</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {selectedMaterial?.name || 'غير محدد'}
                    {selectedMaterial && selectedMaterial.price > 0 && (
                      <span> (+{(selectedMaterial.price * quantity).toFixed(2)} د.ك)</span>
                    )}
                  </p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>التغليف</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {selectedPackaging?.name || 'غير محدد'}
                    {selectedPackaging && selectedPackaging.price > 0 && (
                      <span> (+{(selectedPackaging.price * quantity).toFixed(2)} د.ك)</span>
                    )}
                  </p>
                </div>
              </div>

              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                borderRadius: '12px',
                textAlign: 'center',
                color: 'white'
              }}>
                <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', opacity: 0.9 }}>
                  السعر الإجمالي
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 700 }}>
                  {totalPrice.toFixed(2)} د.ك
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer - Navigation Buttons */}
        <div 
          className="modal-footer" 
          style={{ 
            padding: '1.5rem',
            borderTop: '1px solid var(--surface-border)',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <button 
            onClick={handlePrevious}
            className="btn btn-ghost"
            disabled={currentStep === 1}
            style={{ flex: 1 }}
          >
            السابق
          </button>

          {currentStep < 4 ? (
            <button 
              onClick={handleNext}
              className="btn btn-primary"
              disabled={!isStepValid()}
              style={{ flex: 1 }}
            >
              التالي
            </button>
          ) : (
            <button 
              onClick={handleAddToCart}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              إضافة للسلة
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductConfigModal;


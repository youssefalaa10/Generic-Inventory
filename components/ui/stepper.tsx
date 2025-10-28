import React, { createContext, useContext, useState } from 'react';

// Context for managing stepper state
interface StepperContextType {
  currentStep: number;
  setStep: (step: number) => void;
}

const StepperContext = createContext<StepperContextType | undefined>(undefined);

const useStepper = () => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error('useStepper must be used within a Stepper');
  }
  return context;
};

interface StepperProps {
  defaultValue?: number;
  value?: number;
  onValueChange?: (step: number) => void;
  children: React.ReactNode;
}

export const Stepper: React.FC<StepperProps> = ({ 
  defaultValue = 1, 
  value,
  onValueChange,
  children 
}) => {
  const [currentStep, setCurrentStep] = useState(defaultValue);
  
  const isControlled = value !== undefined;
  const step = isControlled ? value : currentStep;

  const handleSetStep = (newStep: number) => {
    if (!isControlled) {
      setCurrentStep(newStep);
    }
    onValueChange?.(newStep);
  };

  return (
    <StepperContext.Provider value={{ currentStep: step, setStep: handleSetStep }}>
      <div className="stepper-container" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        width: '100%',
        gap: '0.5rem'
      }}>
        {children}
      </div>
    </StepperContext.Provider>
  );
};

interface StepperItemProps {
  step: number;
  children: React.ReactNode;
  className?: string;
}

export const StepperItem: React.FC<StepperItemProps> = ({ step, children, className = '' }) => {
  return (
    <div 
      className={`stepper-item ${className}`} 
      style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '0.5rem'
      }}
      data-step={step}
    >
      {children}
    </div>
  );
};

interface StepperTriggerProps {
  children: React.ReactNode;
}

export const StepperTrigger: React.FC<StepperTriggerProps> = ({ children }) => {
  return (
    <button
      type="button"
      className="stepper-trigger"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0
      }}
    >
      {children}
    </button>
  );
};

interface StepperIndicatorProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const StepperIndicator: React.FC<StepperIndicatorProps> = ({ children, asChild }) => {
  const { currentStep } = useStepper();
  const parentStep = parseInt(
    (children as any)?.props?.['data-step'] || 
    (typeof children === 'number' ? String(children) : '1')
  );
  
  const step = typeof children === 'number' ? children : parentStep;
  const isActive = currentStep >= step;
  const isCurrent = currentStep === step;

  return (
    <div
      className={`stepper-indicator ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: '0.875rem',
        transition: 'all 0.3s ease',
        background: isActive ? 'var(--primary-color)' : 'var(--surface-border)',
        color: isActive ? 'white' : 'var(--text-secondary)',
        border: isCurrent ? '2px solid var(--primary-color)' : '2px solid transparent',
        boxShadow: isCurrent ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none'
      }}
    >
      {children}
    </div>
  );
};

export const StepperSeparator: React.FC = () => {
  return (
    <div
      className="stepper-separator"
      style={{
        flex: 1,
        height: '2px',
        background: 'var(--surface-border)',
        margin: '0 0.5rem'
      }}
    />
  );
};

export { useStepper };


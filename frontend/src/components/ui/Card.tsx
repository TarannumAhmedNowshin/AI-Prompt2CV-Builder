import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  onClose?: () => void;
  variant?: 'default' | 'elevated' | 'bordered';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  title,
  subtitle,
  onClose,
  variant = 'default'
}) => {
  const variantStyles = {
    default: 'bg-white shadow-sm border border-slate-200',
    elevated: 'bg-white shadow-md border border-slate-100',
    bordered: 'bg-white border-2 border-slate-200',
  };

  return (
    <div className={`rounded-2xl overflow-hidden ${variantStyles[variant]} ${className}`}>
      {(title || onClose) && (
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-150"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;

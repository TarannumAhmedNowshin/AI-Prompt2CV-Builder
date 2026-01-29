import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  onClose?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  title,
  subtitle,
  onClose 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      {(title || onClose) && (
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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

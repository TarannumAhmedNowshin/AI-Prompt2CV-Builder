'use client';

import React, { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp, Pencil, Plus, GripVertical, Eye, EyeOff, Trash2 } from 'lucide-react';

interface CVSectionProps {
  icon: ReactNode;
  title: string;
  isOpen?: boolean;
  onToggle?: () => void;
  onEditHeading?: () => void;
  onAddEntry?: () => void;
  children: ReactNode;
  className?: string;
}

export default function CVSection({
  icon,
  title,
  isOpen = false,
  onToggle,
  onEditHeading,
  onAddEntry,
  children,
  className = '',
}: CVSectionProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Section Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <button
          onClick={onToggle}
          className="flex items-center gap-3 flex-1 text-left"
        >
          <span className="text-gray-700">{icon}</span>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </button>
        
        <div className="flex items-center gap-2">
          {isOpen && onEditHeading && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditHeading();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-white transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Heading
            </button>
          )}
          <button onClick={onToggle} className="p-1 text-gray-500 hover:text-gray-700">
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Section Content */}
      {isOpen && (
        <div className="px-5 pb-5">
          {children}
          
          {/* Add Entry Button */}
          {onAddEntry && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={onAddEntry}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-white transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Entry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Entry Item Component
interface EntryItemProps {
  title: string;
  subtitle?: string;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  onClick?: () => void;
  onDragStart?: () => void;
}

export function EntryItem({
  title,
  subtitle,
  isVisible = true,
  onToggleVisibility,
  onClick,
  onDragStart,
}: EntryItemProps) {
  return (
    <div 
      className={`flex items-center gap-3 px-3 py-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer ${
        !isVisible ? 'opacity-60' : ''
      }`}
      onClick={onClick}
    >
      <button 
        className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
        onMouseDown={onDragStart}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-5 w-5" />
      </button>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">
          <span className="font-semibold">{title}</span>
          {subtitle && <span className="text-gray-600">, {subtitle}</span>}
        </p>
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility?.();
        }}
        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
      >
        {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>
    </div>
  );
}

// Edit Modal Component
interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onGetTips?: () => void;
  onToggleVisibility?: () => void;
  onDelete?: () => void;
  isVisible?: boolean;
  children: ReactNode;
}

export function EditModal({
  isOpen,
  onClose,
  title,
  onGetTips,
  onToggleVisibility,
  onDelete,
  isVisible = true,
  children,
}: EditModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <div className="flex items-center gap-2">
            {onGetTips && (
              <button
                onClick={onGetTips}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
              >
                <span className="text-yellow-500">💡</span>
                Get Tips
              </button>
            )}
            {onToggleVisibility && (
              <button
                onClick={onToggleVisibility}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                {isVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {children}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-800 transition-colors flex items-center justify-center gap-2"
          >
            <span>✓</span> Done
          </button>
        </div>
      </div>
    </div>
  );
}

// Heading Edit Modal
interface HeadingEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  value: string;
  onChange: (value: string) => void;
}

export function HeadingEditModal({
  isOpen,
  onClose,
  title,
  value,
  onChange,
}: HeadingEditModalProps) {
  const [localValue, setLocalValue] = useState(value);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="px-6 py-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Section Heading
          </label>
          <input
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onChange(localValue);
              onClose();
            }}
            className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-800 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

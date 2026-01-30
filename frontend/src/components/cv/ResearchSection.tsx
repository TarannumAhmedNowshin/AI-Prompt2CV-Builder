'use client';

import React, { useState } from 'react';
import { BookOpen, GripVertical, Eye, EyeOff, Trash2, X, LinkIcon } from 'lucide-react';
import CVSection from './CVSection';
import { HeadingEditModal } from './CVSection';

export interface ResearchEntry {
  id: string;
  title: string;
  publisher?: string;
  authors?: string;
  date: string;
  link?: string;
  description: string;
  isVisible: boolean;
}

interface ResearchSectionProps {
  entries: ResearchEntry[];
  sectionTitle: string;
  onEntriesChange: (entries: ResearchEntry[]) => void;
  onTitleChange: (title: string) => void;
}

export default function ResearchSection({
  entries,
  sectionTitle,
  onEntriesChange,
  onTitleChange,
}: ResearchSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ResearchEntry | null>(null);
  const [isEditingHeading, setIsEditingHeading] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleAddEntry = () => {
    const newEntry: ResearchEntry = {
      id: Date.now().toString(),
      title: '',
      date: '',
      description: '',
      isVisible: true,
    };
    onEntriesChange([...entries, newEntry]);
    setEditingEntry(newEntry);
  };

  const handleUpdateEntry = (updatedEntry: ResearchEntry) => {
    onEntriesChange(
      entries.map((entry) =>
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
    );
  };

  const handleDeleteEntry = (id: string) => {
    onEntriesChange(entries.filter((entry) => entry.id !== id));
    setEditingEntry(null);
  };

  const handleToggleVisibility = (id: string) => {
    onEntriesChange(
      entries.map((entry) =>
        entry.id === id ? { ...entry, isVisible: !entry.isVisible } : entry
      )
    );
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    
    const draggedIndex = entries.findIndex((e) => e.id === draggedId);
    const targetIndex = entries.findIndex((e) => e.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const newEntries = [...entries];
    const [draggedEntry] = newEntries.splice(draggedIndex, 1);
    newEntries.splice(targetIndex, 0, draggedEntry);
    
    onEntriesChange(newEntries);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  return (
    <>
      <CVSection
        icon={<BookOpen className="h-5 w-5" />}
        title={sectionTitle}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        onEditHeading={() => setIsEditingHeading(true)}
        onAddEntry={handleAddEntry}
      >
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              draggable
              onDragStart={() => handleDragStart(entry.id)}
              onDragOver={(e) => handleDragOver(e, entry.id)}
              onDragEnd={handleDragEnd}
              onClick={() => setEditingEntry(entry)}
              className={`flex items-center gap-3 px-3 py-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer ${
                !entry.isVisible ? 'opacity-60' : ''
              } ${draggedId === entry.id ? 'opacity-50' : ''}`}
            >
              <button
                className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-5 w-5" />
              </button>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  <span className="font-semibold">{entry.title || 'Publication Title'}</span>
                  {entry.publisher && <span className="text-gray-600">, {entry.publisher}</span>}
                </p>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleVisibility(entry.id);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              >
                {entry.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>
          ))}

          {entries.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No research or publications added yet. Click "Add Entry" to get started.
            </p>
          )}
        </div>
      </CVSection>

      {/* Heading Edit Modal */}
      <HeadingEditModal
        isOpen={isEditingHeading}
        onClose={() => setIsEditingHeading(false)}
        title="Edit Section Heading"
        value={sectionTitle}
        onChange={onTitleChange}
      />

      {/* Entry Edit Modal */}
      {editingEntry && (
        <ResearchEditModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={(entry) => {
            handleUpdateEntry(entry);
            setEditingEntry(null);
          }}
          onDelete={() => handleDeleteEntry(editingEntry.id)}
          onToggleVisibility={() => {
            handleToggleVisibility(editingEntry.id);
            setEditingEntry({ ...editingEntry, isVisible: !editingEntry.isVisible });
          }}
        />
      )}
    </>
  );
}

// Research Edit Modal
interface ResearchEditModalProps {
  entry: ResearchEntry;
  onClose: () => void;
  onSave: (entry: ResearchEntry) => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
}

function ResearchEditModal({
  entry,
  onClose,
  onSave,
  onDelete,
  onToggleVisibility,
}: ResearchEditModalProps) {
  const [editData, setEditData] = useState(entry);
  const [showLink, setShowLink] = useState(!!entry.link);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Edit Entry</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleVisibility}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              {editData.isVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Title
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                placeholder="Publication or Research Title"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => setShowLink(!showLink)}
                className={`px-3 py-2.5 border rounded-lg transition-colors flex items-center gap-1 ${
                  showLink 
                    ? 'border-blue-500 text-blue-600 bg-blue-50' 
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <LinkIcon className="h-4 w-4" />
                Link
              </button>
            </div>
          </div>

          {showLink && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Publication Link
              </label>
              <input
                type="url"
                value={editData.link || ''}
                onChange={(e) => setEditData({ ...editData, link: e.target.value })}
                placeholder="https://doi.org/..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Publisher / Journal
            </label>
            <input
              type="text"
              value={editData.publisher || ''}
              onChange={(e) => setEditData({ ...editData, publisher: e.target.value })}
              placeholder="e.g., IEEE, Nature, arXiv"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Authors
            </label>
            <input
              type="text"
              value={editData.authors || ''}
              onChange={(e) => setEditData({ ...editData, authors: e.target.value })}
              placeholder="e.g., John Doe, Jane Smith, et al."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date
            </label>
            <div className="relative">
              <input
                type="text"
                value={editData.date}
                onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                placeholder="MM/YYYY"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {editData.date && (
                <button
                  onClick={() => setEditData({ ...editData, date: '' })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              placeholder="Brief description of the research or publication..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={() => onSave(editData)}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-800 transition-colors flex items-center justify-center gap-2"
          >
            <span>✓</span> Done
          </button>
        </div>
      </div>
    </div>
  );
}

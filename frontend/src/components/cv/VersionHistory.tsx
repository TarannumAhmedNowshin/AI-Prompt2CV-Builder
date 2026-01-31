'use client';

import React, { useState, useEffect } from 'react';
import { History, Clock, RotateCcw, Eye, X, ChevronRight, Check, Trash2, Save, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';

interface CVVersion {
  id: number;
  version_number: number;
  version_name: string | null;
  change_summary: string | null;
  created_at: string;
}

interface CVVersionDetail extends CVVersion {
  cv_id: number;
  title: string;
  template: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
  experience: string | null;
  education: string | null;
  skills: string | null;
  ai_prompt: string | null;
}

interface VersionHistoryProps {
  cvId: string | number;
  isOpen: boolean;
  onClose: () => void;
  onRestore: () => void; // Callback to refresh CV data after restore
}

export default function VersionHistory({ cvId, isOpen, onClose, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<CVVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<CVVersionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isSavingVersion, setIsSavingVersion] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [changeSummary, setChangeSummary] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchVersions();
    }
  }, [isOpen, cvId]);

  const fetchVersions = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/api/cv/${cvId}/versions`);
      setVersions(response.data);
    } catch (error) {
      console.error('Error fetching versions:', error);
      toast.error('Failed to load version history');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVersionDetail = async (versionId: number) => {
    try {
      const response = await apiClient.get(`/api/cv/${cvId}/versions/${versionId}`);
      setSelectedVersion(response.data);
    } catch (error) {
      console.error('Error fetching version detail:', error);
      toast.error('Failed to load version details');
    }
  };

  const handleRestore = async (versionId: number) => {
    if (!confirm('Are you sure you want to restore this version? Your current changes will be saved as a new version first.')) {
      return;
    }

    setIsRestoring(true);
    try {
      const response = await apiClient.post(`/api/cv/${cvId}/versions/${versionId}/restore`);
      toast.success(response.data.message);
      onRestore(); // Refresh the CV data
      onClose();
    } catch (error) {
      console.error('Error restoring version:', error);
      toast.error('Failed to restore version');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteVersion = async (versionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this version? This cannot be undone.')) {
      return;
    }

    try {
      await apiClient.delete(`/api/cv/${cvId}/versions/${versionId}`);
      toast.success('Version deleted');
      fetchVersions();
      if (selectedVersion?.id === versionId) {
        setSelectedVersion(null);
      }
    } catch (error) {
      console.error('Error deleting version:', error);
      toast.error('Failed to delete version');
    }
  };

  const handleSaveNamedVersion = async () => {
    setIsSavingVersion(true);
    try {
      await apiClient.post(`/api/cv/${cvId}/versions`, {
        version_name: versionName || null,
        change_summary: changeSummary || null,
      });
      toast.success('Version saved successfully');
      setShowSaveModal(false);
      setVersionName('');
      setChangeSummary('');
      fetchVersions();
    } catch (error) {
      console.error('Error saving version:', error);
      toast.error('Failed to save version');
    } finally {
      setIsSavingVersion(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(dateString);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Version History</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-1"
            >
              <Save className="h-4 w-4" />
              Save Version
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Version List */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : versions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No versions yet</p>
                <p className="text-sm mt-1">Versions are created automatically when you save changes</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    onClick={() => fetchVersionDetail(version.id)}
                    className={`p-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                      selectedVersion?.id === version.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                            v{version.version_number}
                          </span>
                          {version.version_name && (
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {version.version_name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {getRelativeTime(version.created_at)}
                        </p>
                        {version.change_summary && (
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {version.change_summary}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleDeleteVersion(version.id, e)}
                        className="p-1 hover:bg-red-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete version"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Version Preview */}
          <div className="w-1/2 overflow-y-auto bg-gray-50">
            {selectedVersion ? (
              <div className="p-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      Version {selectedVersion.version_number}
                    </h3>
                    <Button
                      size="sm"
                      onClick={() => handleRestore(selectedVersion.id)}
                      isLoading={isRestoring}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Restore
                    </Button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-500">
                      <Clock className="h-3.5 w-3.5 inline mr-1" />
                      {formatDate(selectedVersion.created_at)}
                    </p>
                    {selectedVersion.version_name && (
                      <p className="text-gray-700 font-medium">{selectedVersion.version_name}</p>
                    )}
                    {selectedVersion.change_summary && (
                      <p className="text-gray-600">{selectedVersion.change_summary}</p>
                    )}
                  </div>
                </div>

                {/* Preview Content */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Content Preview</h4>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Title</label>
                    <p className="text-gray-900">{selectedVersion.title || '-'}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Template</label>
                    <p className="text-gray-900 capitalize">{selectedVersion.template || '-'}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Name</label>
                    <p className="text-gray-900">{selectedVersion.full_name || '-'}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                    <p className="text-gray-900">{selectedVersion.email || '-'}</p>
                  </div>
                  
                  {selectedVersion.summary && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Summary</label>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap line-clamp-4">
                        {selectedVersion.summary}
                      </p>
                    </div>
                  )}
                  
                  {selectedVersion.skills && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Skills</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedVersion.skills.split(',').slice(0, 5).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                        {selectedVersion.skills.split(',').length > 5 && (
                          <span className="px-2 py-0.5 text-gray-500 text-xs">
                            +{selectedVersion.skills.split(',').length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Eye className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Select a version to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>
              Versions are created automatically when you save changes. 
              Restoring a version will save your current work first.
            </p>
          </div>
        </div>
      </div>

      {/* Save Named Version Modal */}
      {showSaveModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setShowSaveModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-[70] p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Named Version</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version Name (optional)
                </label>
                <input
                  type="text"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  placeholder="e.g., Before major rewrite"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={changeSummary}
                  onChange={(e) => setChangeSummary(e.target.value)}
                  placeholder="What changes were made..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowSaveModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveNamedVersion}
                isLoading={isSavingVersion}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Check className="h-4 w-4 mr-1" />
                Save Version
              </Button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

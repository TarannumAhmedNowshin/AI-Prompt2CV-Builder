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
    // Parse the date string and ensure it's treated as UTC
    const utcDateString = dateString.includes('Z') || dateString.includes('+') || dateString.includes('T') && dateString.split('T')[1].includes('-')
      ? dateString 
      : dateString.includes('T') ? `${dateString}Z` : dateString;
    
    const date = new Date(utcDateString);
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
    // Parse the date string and ensure it's treated as UTC
    // If the string doesn't have timezone info, append 'Z' to treat it as UTC
    const utcDateString = dateString.includes('Z') || dateString.includes('+') || dateString.includes('T') && dateString.split('T')[1].includes('-')
      ? dateString 
      : dateString.includes('T') ? `${dateString}Z` : dateString;
    
    const date = new Date(utcDateString);
    const now = new Date();
    const diffMs = Math.abs(now.getTime() - date.getTime());
    const diffSecs = Math.round(diffMs / 1000);
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs} seconds ago`;
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    return formatDate(utcDateString);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-3xl bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-primary-50/80 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-xl">
              <History className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Version History</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-2 px-4 py-2 shadow-sm hover:shadow-md transition-shadow"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save Version</span>
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Version List */}
          <div className="w-2/5 border-r border-gray-200 overflow-y-auto bg-gray-50">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : versions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No versions yet</p>
                <p className="text-sm mt-2">Versions are created automatically when you save changes</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    onClick={() => fetchVersionDetail(version.id)}
                    className={`group p-4 cursor-pointer hover:bg-white transition-all duration-200 ${
                      selectedVersion?.id === version.id 
                        ? 'bg-white border-l-4 border-blue-600 shadow-sm' 
                        : 'hover:border-l-4 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md">
                            v{version.version_number}
                          </span>
                          {version.version_name && (
                            <span className="text-sm font-semibold text-gray-900 truncate">
                              {version.version_name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{getRelativeTime(version.created_at)}</span>
                        </div>
                        {version.change_summary && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {version.change_summary}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleDeleteVersion(version.id, e)}
                        className="p-1.5 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete version"
                      >
                        <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Version Preview */}
          <div className="w-3/5 overflow-y-auto bg-white">
            {selectedVersion ? (
              <div className="p-6">
                {/* Version Info Card */}
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200 p-5 mb-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Version {selectedVersion.version_number}
                      </h3>
                      {selectedVersion.version_name && (
                        <p className="text-base text-gray-700 font-medium">{selectedVersion.version_name}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleRestore(selectedVersion.id)}
                      isLoading={isRestoring}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(selectedVersion.created_at)}</span>
                  </div>
                  
                  {selectedVersion.change_summary && (
                    <p className="text-sm text-gray-700 mt-3 p-3 bg-white rounded-lg border border-blue-100">
                      {selectedVersion.change_summary}
                    </p>
                  )}
                </div>

                {/* Preview Content */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Eye className="h-5 w-5 text-gray-600" />
                      Content Preview
                    </h4>
                  </div>
                  
                  <div className="p-5 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Title</label>
                        <p className="text-base text-gray-900 font-medium">{selectedVersion.title || '-'}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Template</label>
                        <p className="text-base text-gray-900 font-medium capitalize">{selectedVersion.template || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-100">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Name</label>
                      <p className="text-base text-gray-900">{selectedVersion.full_name || '-'}</p>
                    </div>
                    
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Email</label>
                      <p className="text-base text-gray-900">{selectedVersion.email || '-'}</p>
                    </div>
                    
                    {selectedVersion.summary && (
                      <div className="pt-3 border-t border-gray-100">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Summary</label>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {selectedVersion.summary}
                        </p>
                      </div>
                    )}
                    
                    {selectedVersion.skills && (
                      <div className="pt-3 border-t border-gray-100">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Skills</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedVersion.skills.split(',').slice(0, 8).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                          {selectedVersion.skills.split(',').length > 8 && (
                            <span className="px-3 py-1.5 text-gray-600 text-sm font-medium">
                              +{selectedVersion.skills.split(',').length - 8} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center p-8">
                  <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Eye className="h-10 w-10 text-gray-300" />
                  </div>
                  <p className="text-lg font-medium text-gray-600">Select a version to preview</p>
                  <p className="text-sm text-gray-500 mt-2">Click on any version from the left to see its details</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-blue-600" />
            <p className="leading-relaxed">
              <span className="font-medium text-gray-900">Auto-save enabled.</span> Versions are created automatically when you save changes. 
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

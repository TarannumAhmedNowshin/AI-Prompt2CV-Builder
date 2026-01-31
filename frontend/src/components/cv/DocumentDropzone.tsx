'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import apiClient from '../../lib/api-client';

// Types for parsed CV data
export interface ParsedExperience {
  job_title: string;
  employer: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
}

export interface ParsedEducation {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  gpa: string;
  description: string;
}

export interface ParsedSkill {
  name: string;
  category: string;
}

export interface ParsedProject {
  title: string;
  technologies: string;
  description: string;
  link: string;
}

export interface ParsedCVData {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  experience: ParsedExperience[];
  education: ParsedEducation[];
  skills: ParsedSkill[];
  projects: ParsedProject[];
  confidence_scores: Record<string, number>;
}

interface DocumentDropzoneProps {
  onDataParsed: (data: ParsedCVData) => void;
  disabled?: boolean;
}

export default function DocumentDropzone({ onDataParsed, disabled = false }: DocumentDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fileName, setFileName] = useState('');

  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt'];

  const validateFile = (file: File): boolean => {
    // Check file type
    const isValidType = ALLOWED_TYPES.includes(file.type) || 
      ALLOWED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
      setErrorMessage('Please upload a PDF, Word document, or text file.');
      setUploadStatus('error');
      return false;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File is too large. Maximum size is 10MB.');
      setUploadStatus('error');
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/api/cv/parse-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const parsedData: ParsedCVData = response.data;
      setUploadStatus('success');
      onDataParsed(parsedData);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setErrorMessage(
        error.response?.data?.detail || 
        'Failed to parse document. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }, [disabled, isUploading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const resetState = () => {
    setUploadStatus('idle');
    setErrorMessage('');
    setFileName('');
  };

  return (
    <div className="w-full">
      {/* Main Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer
          ${isDragging 
            ? 'border-primary-500 bg-primary-50' 
            : uploadStatus === 'error'
            ? 'border-red-300 bg-red-50'
            : uploadStatus === 'success'
            ? 'border-green-300 bg-green-50'
            : 'border-slate-300 bg-slate-50 hover:border-primary-400 hover:bg-primary-50/50'
          }
          ${disabled || isUploading ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="flex flex-col items-center justify-center text-center">
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 text-primary-500 animate-spin mb-3" />
              <p className="text-sm font-medium text-slate-700">
                Parsing {fileName}...
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Extracting information from your document
              </p>
            </>
          ) : uploadStatus === 'success' ? (
            <>
              <CheckCircle className="h-10 w-10 text-green-500 mb-3" />
              <p className="text-sm font-medium text-green-700">
                Successfully parsed!
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Review the extracted data below
              </p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  resetState();
                }}
                className="mt-3 text-xs text-primary-600 hover:text-primary-700 underline"
              >
                Upload another document
              </button>
            </>
          ) : uploadStatus === 'error' ? (
            <>
              <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
              <p className="text-sm font-medium text-red-700">
                Upload failed
              </p>
              <p className="text-xs text-red-600 mt-1">
                {errorMessage}
              </p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  resetState();
                }}
                className="mt-3 text-xs text-primary-600 hover:text-primary-700 underline"
              >
                Try again
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 mb-3">
                <Upload className="h-6 w-6 text-primary-600" />
              </div>
              <p className="text-sm font-medium text-slate-700">
                Drop your resume/CV here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                or click to browse
              </p>
              <div className="flex items-center gap-2 mt-3">
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-400">
                  PDF, Word, or TXT (max 10MB)
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

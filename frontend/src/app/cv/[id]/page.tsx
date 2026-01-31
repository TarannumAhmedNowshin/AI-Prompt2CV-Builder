'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import ModernTemplate from '@/components/cv/ModernTemplate';
import ClassicTemplate from '@/components/cv/ClassicTemplate';
import CVEditor, { CVEditorData, createEmptyCVData, convertToLegacyFormat, convertLegacyCVData } from '@/components/cv/CVEditor';
import { Save, Download, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToPDF, prepareCVForExport } from '@/lib/pdf-export';

type TemplateType = 'modern' | 'classic';

export default function EditCVPage() {
  const router = useRouter();
  const params = useParams();
  const cvId = params?.id;
  
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [cvData, setCvData] = useState<CVEditorData>(createEmptyCVData());
  const [lastUsedPrompt, setLastUsedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  useEffect(() => {
    if (cvId) {
      fetchCV();
    }
  }, [cvId]);

  const fetchCV = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        toast.error('Please login to edit CV');
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/cv/${cvId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CV');
      }

      const data = await response.json();
      
      // Convert legacy data to new format
      const convertedData = convertLegacyCVData({
        title: data.title || '',
        fullName: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        summary: data.summary || '',
        experience: data.experience || '',
        education: data.education || '',
        skills: data.skills || '',
      });
      
      setCvData(convertedData);
      setSelectedTemplate(data.template as TemplateType);
      setLastUsedPrompt(data.ai_prompt || '');
      
    } catch (error) {
      console.error('Error fetching CV:', error);
      toast.error('Failed to load CV');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIGenerate = async (prompt: string) => {
    setIsGenerating(true);
    
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        toast.error('Please login to use AI features');
        setIsGenerating(false);
        return;
      }
      
      const response = await fetch('http://localhost:8000/api/cv/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to generate content');
      }

      const generatedData = await response.json();
      
      // Update personal info and other fields
      setCvData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          fullName: generatedData.full_name || prev.personalInfo.fullName,
          email: generatedData.email || prev.personalInfo.email,
          phone: generatedData.phone || prev.personalInfo.phone,
          location: generatedData.location || prev.personalInfo.location,
        },
        summary: generatedData.summary || prev.summary,
        // Parse experience if it's a string
        experience: generatedData.experience 
          ? (typeof generatedData.experience === 'string' 
              ? generatedData.experience.split('\n').filter((e: string) => e.trim()).map((exp: string, idx: number) => ({
                  id: `exp-${Date.now()}-${idx}`,
                  jobTitle: exp.trim(),
                  employer: '',
                  startDate: '',
                  endDate: '',
                  location: '',
                  description: '',
                  isVisible: true,
                }))
              : prev.experience)
          : prev.experience,
        // Parse education if it's a string
        education: generatedData.education 
          ? (typeof generatedData.education === 'string' 
              ? generatedData.education.split('\n').filter((e: string) => e.trim()).map((edu: string, idx: number) => ({
                  id: `edu-${Date.now()}-${idx}`,
                  school: edu.trim(),
                  degree: '',
                  field: '',
                  startDate: '',
                  endDate: '',
                  location: '',
                  description: '',
                  isVisible: true,
                }))
              : prev.education)
          : prev.education,
        // Parse skills if it's a string
        skills: generatedData.skills 
          ? (typeof generatedData.skills === 'string' 
              ? generatedData.skills.split(',').filter((s: string) => s.trim()).map((skill: string, idx: number) => ({
                  id: `skill-${Date.now()}-${idx}`,
                  name: skill.trim(),
                }))
              : prev.skills)
          : prev.skills,
      }));
      
      toast.success('AI content generated successfully!');
      // Append to existing prompts with timestamp
      const timestamp = new Date().toLocaleString();
      const newPromptEntry = `[${timestamp}] ${prompt}`;
      setLastUsedPrompt(prev => prev ? `${prev}\n\n${newPromptEntry}` : newPromptEntry);
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdate = async () => {
    if (!cvData.title) {
      toast.error('Please enter a CV title');
      return;
    }
    
    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        toast.error('Please login to update CV');
        return;
      }

      const legacyData = convertToLegacyFormat(cvData);
      
      const response = await fetch(`http://localhost:8000/api/cv/${cvId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...legacyData,
          template: selectedTemplate,
          ai_prompt: lastUsedPrompt || null,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update CV');
      }
      
      toast.success('CV updated successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating CV:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update CV');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    if (!cvData.title) {
      toast.error('Please enter a CV title before exporting');
      return;
    }

    if (!selectedTemplate) {
      toast.error('Please select a template before exporting');
      return;
    }

    const loadingToast = toast.loading('Generating PDF...');

    try {
      // Prepare the element for export (remove scroll constraints)
      const cleanup = prepareCVForExport('cv-preview');

      // Wait a bit for any layout changes to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate the PDF
      const filename = cvData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      await exportToPDF('cv-preview', filename);

      // Cleanup
      cleanup();

      toast.success('PDF exported successfully!', { id: loadingToast });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to export PDF',
        { id: loadingToast }
      );
    }
  };

  // Get preview data - pass structured data directly to templates
  const getPreviewData = () => {
    return {
      personalInfo: cvData.personalInfo,
      summary: cvData.summary,
      experience: cvData.experience,
      education: cvData.education,
      projects: cvData.projects,
      research: cvData.research,
      skills: cvData.skills,
      sectionTitles: cvData.sectionTitles,
    };
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading CV...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-[1800px] mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Edit CV</h1>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  Cancel
                </Button>
                <Button variant="secondary" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button onClick={handleUpdate} isLoading={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  Update
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Split Screen Layout */}
        <div className="flex max-w-[1800px] mx-auto">
          {/* Left Side - Form */}
          <div className="w-1/2 p-6">
            <CVEditor
              data={cvData}
              onChange={setCvData}
              onAIGenerate={handleAIGenerate}
              isGenerating={isGenerating}
              cvId={cvId as string}
            />
          </div>

          {/* Right Side - CV Preview */}
          <div className="w-1/2 bg-gray-200 p-6">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-700">Live Preview</h2>
                  <p className="text-sm text-gray-500">Your CV updates in real-time</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                >
                  Change Template
                </Button>
              </div>

              {/* Template Selector */}
              {showTemplateSelector && (
                <div className="mb-4 p-4 bg-white rounded-lg shadow-md border-2 border-pink-200">
                  <h3 className="font-semibold mb-3">Select Template</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setSelectedTemplate('modern');
                        setShowTemplateSelector(false);
                        toast.success('Template changed to Modern');
                      }}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        selectedTemplate === 'modern'
                          ? 'border-pink-600 bg-pink-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="aspect-[1/1.4] bg-gradient-to-br from-blue-600 to-blue-800 rounded mb-2"></div>
                      <p className="font-semibold text-center text-sm">Modern</p>
                      {selectedTemplate === 'modern' && (
                        <p className="text-xs text-pink-600 mt-1">✓ Active</p>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTemplate('classic');
                        setShowTemplateSelector(false);
                        toast.success('Template changed to Classic');
                      }}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        selectedTemplate === 'classic'
                          ? 'border-pink-600 bg-pink-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="aspect-[1/1.4] bg-white border-2 border-gray-800 rounded mb-2"></div>
                      <p className="font-semibold text-center text-sm">Classic</p>
                      {selectedTemplate === 'classic' && (
                        <p className="text-xs text-pink-600 mt-1">✓ Active</p>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="w-full" id="cv-preview">
                {selectedTemplate === 'modern' ? (
                  <ModernTemplate data={getPreviewData()} />
                ) : (
                  <ClassicTemplate data={getPreviewData()} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}


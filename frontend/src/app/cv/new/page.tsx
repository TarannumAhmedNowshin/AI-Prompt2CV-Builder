'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import ModernTemplate from '@/components/cv/ModernTemplate';
import ClassicTemplate from '@/components/cv/ClassicTemplate';
import CVEditor, { CVEditorData, createEmptyCVData, convertToLegacyFormat } from '@/components/cv/CVEditor';
import { Save, Download, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

type TemplateType = 'modern' | 'classic';

export default function NewCVPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [cvData, setCvData] = useState<CVEditorData>(createEmptyCVData());
  const [lastUsedPrompt, setLastUsedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
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
        toast.error('Please login to save CV');
        return;
      }

      const legacyData = convertToLegacyFormat(cvData);
      
      const response = await fetch('http://localhost:8000/api/cv/', {
        method: 'POST',
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
        throw new Error(errorData.detail || 'Failed to save CV');
      }
      
      toast.success('CV saved successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving CV:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save CV');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    toast.success('Exporting CV as PDF...');
    // Add PDF export logic here
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
                <h1 className="text-2xl font-bold text-gray-900">Create New CV</h1>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  Cancel
                </Button>
                <Button variant="secondary" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button onClick={handleSave} isLoading={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
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
            />
          </div>

          {/* Right Side - Template Selection or CV Preview */}
          <div className="w-1/2 bg-gray-200 p-6">
            {!selectedTemplate ? (
              /* Template Selection */
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Template</h2>
                  <p className="text-gray-600">Select a template to get started with your CV</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Modern Template */}
                  <button
                    onClick={() => setSelectedTemplate('modern')}
                    className="group p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all text-left"
                  >
                    <div className="flex gap-6">
                      <div className="w-48 h-64 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex-shrink-0 shadow-md"></div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                          Modern Template
                        </h3>
                        <p className="text-gray-600 mb-4">
                          A contemporary design with a bold gradient header. Perfect for creative professionals, 
                          tech industry, and modern workplaces.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-center gap-2">
                            <span className="text-blue-600">✓</span>
                            Gradient header design
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-blue-600">✓</span>
                            Clean section dividers
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-blue-600">✓</span>
                            Tag-style skills display
                          </li>
                        </ul>
                        <div className="mt-6">
                          <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg group-hover:bg-blue-700 transition-colors">
                            Select Template →
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Classic Template */}
                  <button
                    onClick={() => setSelectedTemplate('classic')}
                    className="group p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all text-left"
                  >
                    <div className="flex gap-6">
                      <div className="w-48 h-64 bg-white border-4 border-gray-800 rounded-lg flex-shrink-0 shadow-md"></div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                          Classic Template
                        </h3>
                        <p className="text-gray-600 mb-4">
                          A timeless professional design with traditional formatting. Ideal for corporate roles, 
                          formal industries, and conservative workplaces.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-center gap-2">
                            <span className="text-blue-600">✓</span>
                            Professional black & white
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-blue-600">✓</span>
                            Traditional layout
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-blue-600">✓</span>
                            ATS-friendly format
                          </li>
                        </ul>
                        <div className="mt-6">
                          <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg group-hover:bg-blue-700 transition-colors">
                            Select Template →
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              /* CV Preview */
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700">Live Preview</h2>
                    <p className="text-sm text-gray-500">Your CV updates in real-time</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedTemplate(null)}
                    className="text-sm"
                  >
                    Change Template
                  </Button>
                </div>
                <div className="w-full">
                  {selectedTemplate === 'modern' ? (
                    <ModernTemplate data={getPreviewData()} />
                  ) : (
                    <ClassicTemplate data={getPreviewData()} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

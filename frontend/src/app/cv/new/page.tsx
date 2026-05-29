'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import CVEditor, { CVEditorData, createEmptyCVData, convertToLegacyFormat } from '@/components/cv/CVEditor';
import TemplateSelector, { TemplateType, getTemplateComponent } from '@/components/cv/TemplateSelector';
import { Save, Download, ArrowLeft, Sparkles, PenLine } from 'lucide-react';
import toast from 'react-hot-toast';
import { mapAIResponseToCVData } from '@/lib/ai-content-mapper';

type PanelMode = 'edit' | 'ai';

export default function NewCVPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [cvData, setCvData] = useState<CVEditorData>(createEmptyCVData());
  const [lastUsedPrompt, setLastUsedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode>('edit');
  const [aiPrompt, setAiPrompt] = useState('');
  const hasUnsavedData = useRef(false);

  useEffect(() => {
    const hasData = !!(cvData.personalInfo.fullName || cvData.summary || cvData.experience.length > 0);
    hasUnsavedData.current = hasData;
  }, [cvData]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedData.current) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);

    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        toast.error('Please login to use AI features');
        setIsGenerating(false);
        return;
      }

      const response = await fetch('http://localhost:8001/api/cv/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to generate content');
      }

      const generatedData = await response.json();

      setCvData(prev => mapAIResponseToCVData(generatedData, prev));

      toast.success('AI content generated! Switching to editor...');
      const timestamp = new Date().toLocaleString();
      const newPromptEntry = `[${timestamp}] ${aiPrompt}`;
      setLastUsedPrompt(prev => prev ? `${prev}\n\n${newPromptEntry}` : newPromptEntry);
      setAiPrompt('');
      setPanelMode('edit');
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

      const response = await fetch('http://localhost:8001/api/cv/', {
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
    toast.success('Save your CV first, then export from the edit page.');
  };

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

  const TemplateComponent = selectedTemplate ? getTemplateComponent(selectedTemplate) : null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-[1800px] mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="h-6 w-px bg-slate-200" />
                <input
                  type="text"
                  value={cvData.title}
                  onChange={(e) => setCvData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Untitled CV"
                  className="text-lg font-semibold text-slate-900 bg-transparent border-none outline-none focus:ring-0 min-w-0 flex-1 max-w-xs placeholder:text-slate-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={panelMode === 'ai' ? 'primary' : 'ghost'}
                  onClick={() => setPanelMode(panelMode === 'ai' ? 'edit' : 'ai')}
                  title="AI Tools"
                  className={panelMode === 'ai' ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white' : ''}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>AI Tools</span>
                </Button>
                <div className="h-6 w-px bg-slate-200" />
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
                <Button onClick={handleSave} isLoading={isSaving}>
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Split Screen Layout */}
        <div className="flex max-w-[1800px] mx-auto">
          {/* Left Side — Edit or AI mode */}
          <div className="w-1/2 p-6">
            {panelMode === 'edit' ? (
              <CVEditor data={cvData} onChange={setCvData} />
            ) : (
              <div className="space-y-5">
                <button
                  onClick={() => setPanelMode('edit')}
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <PenLine className="h-3.5 w-3.5" />
                  Back to editing
                </button>

                <Card title="AI Content Generator" subtitle="Describe your background and let AI build your CV" variant="elevated">
                  <div className="space-y-4">
                    <textarea
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-500 focus:bg-white resize-none transition-all duration-200 text-slate-800 placeholder:text-slate-400"
                      rows={6}
                      placeholder="Tell me about yourself: your work experience, education, skills, and any projects or research. Include company names, job titles, dates, and descriptions for best results."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                    />
                    <Button
                      onClick={handleAIGenerate}
                      isLoading={isGenerating}
                      fullWidth
                      className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg"
                    >
                      <Sparkles className="h-5 w-5" />
                      <span>Generate with AI</span>
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Right Side — Template Selection or CV Preview */}
          <div className="w-1/2 bg-gray-200 p-6">
            {!selectedTemplate ? (
              <TemplateSelector selected={null} onSelect={setSelectedTemplate} mode="full" />
            ) : (
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
                  {TemplateComponent && <TemplateComponent data={getPreviewData()} />}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

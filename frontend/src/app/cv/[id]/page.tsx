'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import CVEditor, { CVEditorData, createEmptyCVData, convertToLegacyFormat, convertLegacyCVData } from '@/components/cv/CVEditor';
import VersionHistory from '@/components/cv/VersionHistory';
import DocumentDropzone, { ParsedCVData } from '@/components/cv/DocumentDropzone';
import ParsedDataPreview from '@/components/cv/ParsedDataPreview';
import JobSuggestions from '@/components/cv/JobSuggestions';
import CVReviewer from '@/components/cv/CVReviewer';
import TemplateSelector, { TemplateType, getTemplateComponent } from '@/components/cv/TemplateSelector';
import { Save, Download, ArrowLeft, History, FileUp, Sparkles, PenLine, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToPDF, prepareCVForExport } from '@/lib/pdf-export';
import { Skill } from '@/components/cv/SkillsSection';
import { ExperienceEntry } from '@/components/cv/ExperienceSection';
import { EducationEntry } from '@/components/cv/EducationSection';
import { ProjectEntry } from '@/components/cv/ProjectsSection';
import { mapAIResponseToCVData } from '@/lib/ai-content-mapper';

type PanelMode = 'edit' | 'ai';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

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
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedCVData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode>('edit');
  const [aiPrompt, setAiPrompt] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const isInitialLoad = useRef(true);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const latestCvData = useRef(cvData);
  const latestTemplate = useRef(selectedTemplate);
  const latestPrompt = useRef(lastUsedPrompt);

  latestCvData.current = cvData;
  latestTemplate.current = selectedTemplate;
  latestPrompt.current = lastUsedPrompt;

  const performAutoSave = useCallback(async () => {
    const data = latestCvData.current;
    const template = latestTemplate.current;
    const prompt = latestPrompt.current;

    if (!data.title || !template || !cvId) return;

    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const legacyData = convertToLegacyFormat(data);
      const response = await fetch(`http://localhost:8001/api/cv/${cvId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...legacyData,
          template,
          ai_prompt: prompt || null,
        }),
      });

      if (response.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    }
  }, [cvId]);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(() => {
      performAutoSave();
    }, 1500);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [cvData, selectedTemplate, performAutoSave]);

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

      const response = await fetch(`http://localhost:8001/api/cv/${cvId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CV');
      }

      const data = await response.json();

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
        projects: data.projects || '',
        research: data.research || '',
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

      const response = await fetch(`http://localhost:8001/api/cv/${cvId}`, {
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
      const cleanup = prepareCVForExport('cv-preview');
      await new Promise(resolve => setTimeout(resolve, 300));

      const filename = cvData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      await exportToPDF('cv-preview', filename);

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

  const handleDocumentParsed = (data: ParsedCVData) => {
    setParsedData(data);
    setShowPreview(true);
    setShowImportModal(false);
  };

  const handleApplyParsedData = (selectedData: ParsedCVData) => {
    const newSkills: Skill[] = selectedData.skills.map((skill, idx) => ({
      id: `imported-skill-${Date.now()}-${idx}`,
      name: skill.name,
    }));

    const newExperience: ExperienceEntry[] = selectedData.experience.map((exp, idx) => ({
      id: `imported-exp-${Date.now()}-${idx}`,
      jobTitle: exp.job_title,
      employer: exp.employer,
      location: exp.location,
      startDate: exp.start_date,
      endDate: exp.end_date,
      description: exp.description,
      isVisible: true,
    }));

    const newEducation: EducationEntry[] = selectedData.education.map((edu, idx) => ({
      id: `imported-edu-${Date.now()}-${idx}`,
      school: edu.institution,
      degree: edu.degree,
      field: edu.field_of_study,
      startDate: edu.start_date,
      endDate: edu.end_date,
      gpa: edu.gpa || '',
      location: '',
      description: edu.description,
      isVisible: true,
    }));

    const newProjects: ProjectEntry[] = selectedData.projects.map((proj, idx) => ({
      id: `imported-proj-${Date.now()}-${idx}`,
      name: proj.title,
      description: proj.description,
      technologies: proj.technologies,
      link: proj.link || '',
      startDate: '',
      endDate: '',
      isVisible: true,
    }));

    const updatedData: CVEditorData = {
      ...cvData,
      personalInfo: {
        fullName: selectedData.full_name || cvData.personalInfo.fullName,
        email: selectedData.email || cvData.personalInfo.email,
        phone: selectedData.phone || cvData.personalInfo.phone,
        location: selectedData.location || cvData.personalInfo.location,
        linkedin: selectedData.linkedin || cvData.personalInfo.linkedin,
        website: cvData.personalInfo.website,
        photo: cvData.personalInfo.photo,
      },
      summary: selectedData.summary || cvData.summary,
      experience: newExperience.length > 0 ? newExperience : cvData.experience,
      education: newEducation.length > 0 ? newEducation : cvData.education,
      projects: newProjects.length > 0 ? newProjects : cvData.projects,
      skills: [...cvData.skills, ...newSkills.filter(
        ns => !cvData.skills.some(s => s.name.toLowerCase() === ns.name.toLowerCase())
      )],
    };

    setCvData(updatedData);
    setShowPreview(false);
    setParsedData(null);
    toast.success('Document data imported successfully!');
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
    setParsedData(null);
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

  const handleTemplateChange = (template: TemplateType) => {
    setSelectedTemplate(template);
    setShowTemplateSelector(false);
    toast.success(`Template changed to ${template.charAt(0).toUpperCase() + template.slice(1)}`);
  };

  const TemplateComponent = selectedTemplate ? getTemplateComponent(selectedTemplate) : null;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-white">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-full mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
            </div>
            <p className="text-slate-500 font-medium">Loading CV...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-100 -mt-8">
        {/* Action Bar */}
        <div className="bg-white shadow-sm border-b border-slate-200 py-3">
          <div className="max-w-[1800px] mx-auto px-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Button variant="ghost" onClick={() => router.push('/dashboard')}>
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
                  className={panelMode === 'ai' ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white' : ''}
                >
                  {panelMode === 'ai' ? (
                    <>
                      <PenLine className="h-4 w-4" />
                      <span>Editing</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>AI Tools</span>
                    </>
                  )}
                </Button>
                <div className="h-6 w-px bg-slate-200" />
                <Button
                  variant="ghost"
                  onClick={() => setShowVersionHistory(true)}
                  title="Version history"
                >
                  <History className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowImportModal(true)}
                  title="Import document"
                >
                  <FileUp className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
                {saveStatus === 'saving' && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <span className="flex items-center gap-1.5 text-xs text-green-600">
                    <Check className="h-3.5 w-3.5" />
                    Saved
                  </span>
                )}
                <Button onClick={handleUpdate} isLoading={isSaving}>
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
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
                {/* CV Reviewer */}
                {cvId && <CVReviewer cvId={cvId} />}

                {/* AI Content Generator */}
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

                {/* Job Match Advisor */}
                {cvId && <JobSuggestions cvId={cvId} />}
              </div>
            )}
          </div>

          {/* Right Side — CV Preview */}
          <div className="w-1/2 bg-slate-200 p-6 min-h-[calc(100vh-140px)]">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-700">Live Preview</h2>
                  <p className="text-sm text-slate-500">Your CV updates in real-time</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                  className="bg-white"
                >
                  Change Template
                </Button>
              </div>

              {showTemplateSelector && (
                <div className="mb-4 p-5 bg-white rounded-2xl shadow-soft-lg border border-slate-100">
                  <h3 className="font-semibold text-slate-800 mb-4">Select Template</h3>
                  <TemplateSelector
                    selected={selectedTemplate}
                    onSelect={handleTemplateChange}
                    mode="compact"
                  />
                </div>
              )}

              <div className="w-full" id="cv-preview">
                {TemplateComponent && <TemplateComponent data={getPreviewData()} />}
              </div>
            </div>
          </div>
        </div>

        {/* Version History Panel */}
        <VersionHistory
          cvId={cvId as string}
          isOpen={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          onRestore={() => {
            fetchCV();
          }}
        />

        {/* Import Document Modal */}
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Import from Document</h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Upload your existing resume to auto-fill contact info and skills
              </p>
              <DocumentDropzone onDataParsed={handleDocumentParsed} />
            </div>
          </div>
        )}

        {/* Parsed Data Preview Modal */}
        {parsedData && (
          <ParsedDataPreview
            data={parsedData}
            onApply={handleApplyParsedData}
            onCancel={handleCancelPreview}
            isOpen={showPreview}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

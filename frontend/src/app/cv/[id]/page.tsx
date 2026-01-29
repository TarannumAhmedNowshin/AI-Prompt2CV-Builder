'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import ModernTemplate from '@/components/cv/ModernTemplate';
import ClassicTemplate from '@/components/cv/ClassicTemplate';
import { Save, Download, Sparkles, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

type TemplateType = 'modern' | 'classic';

export default function EditCVPage() {
  const router = useRouter();
  const params = useParams();
  const cvId = params?.id;
  
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [cvData, setCvData] = useState({
    title: '',
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    experience: '',
    education: '',
    skills: '',
  });
  const [aiPrompt, setAiPrompt] = useState('');
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
      
      setCvData({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCvData({
      ...cvData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

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
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to generate content');
      }

      const generatedData = await response.json();
      
      setCvData(prev => ({
        ...prev,
        fullName: generatedData.full_name || prev.fullName,
        email: generatedData.email || prev.email,
        phone: generatedData.phone || prev.phone,
        location: generatedData.location || prev.location,
        summary: generatedData.summary || prev.summary,
        experience: generatedData.experience || prev.experience,
        education: generatedData.education || prev.education,
        skills: generatedData.skills || prev.skills,
      }));
      
      toast.success('AI content generated successfully!');
      // Append to existing prompts with timestamp
      const timestamp = new Date().toLocaleString();
      const newPromptEntry = `[${timestamp}] ${aiPrompt}`;
      setLastUsedPrompt(prev => prev ? `${prev}\n\n${newPromptEntry}` : newPromptEntry);
      setAiPrompt('');
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
      
      const response = await fetch(`http://localhost:8000/api/cv/${cvId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: cvData.title,
          template: selectedTemplate,
          full_name: cvData.fullName,
          email: cvData.email,
          phone: cvData.phone,
          location: cvData.location,
          summary: cvData.summary,
          experience: cvData.experience,
          education: cvData.education,
          skills: cvData.skills,
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

  const handleExport = () => {
    toast.success('Exporting CV as PDF...');
    // Add PDF export logic here
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading CV...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
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
          {/* Left Side - Form and AI Prompt */}
          <div className="w-1/2 p-6">
            <div className="space-y-6">
              {/* AI Assistant Card */}
              <Card title="AI Assistant" subtitle="Use AI to update content for your CV">
                <div className="space-y-4">
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe what you want to add or change..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                  <Button
                    onClick={handleAIGenerate}
                    isLoading={isGenerating}
                    fullWidth
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate with AI
                  </Button>
                </div>
              </Card>

              {/* CV Form */}
              <Card title="CV Details">
                <div className="space-y-6">
                  <Input
                    label="CV Title"
                    name="title"
                    placeholder="e.g., Software Engineer Resume"
                    value={cvData.title}
                    onChange={handleChange}
                    required
                  />

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                    <div className="space-y-4">
                      <Input
                        label="Full Name"
                        name="fullName"
                        placeholder="John Doe"
                        value={cvData.fullName}
                        onChange={handleChange}
                      />
                      <Input
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={cvData.email}
                        onChange={handleChange}
                      />
                      <Input
                        label="Phone"
                        name="phone"
                        placeholder="+1 234 567 8900"
                        value={cvData.phone}
                        onChange={handleChange}
                      />
                      <Input
                        label="Location"
                        name="location"
                        placeholder="New York, NY"
                        value={cvData.location}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Professional Summary</h3>
                    <textarea
                      name="summary"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={4}
                      placeholder="Brief summary of your professional background..."
                      value={cvData.summary}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Experience</h3>
                    <textarea
                      name="experience"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={6}
                      placeholder="List your work experience (one per line)..."
                      value={cvData.experience}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Education</h3>
                    <textarea
                      name="education"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={4}
                      placeholder="List your educational background (one per line)..."
                      value={cvData.education}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Skills</h3>
                    <textarea
                      name="skills"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={3}
                      placeholder="List your skills (comma-separated)..."
                      value={cvData.skills}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Side - CV Preview */}
          <div className="w-1/2 bg-gray-100 p-6">
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
                <div className="mb-4 p-4 bg-white rounded-lg shadow-md border-2 border-blue-200">
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
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="aspect-[1/1.4] bg-gradient-to-br from-blue-600 to-blue-800 rounded mb-2"></div>
                      <p className="font-semibold text-center text-sm">Modern</p>
                      {selectedTemplate === 'modern' && (
                        <p className="text-xs text-blue-600 mt-1">✓ Active</p>
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
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="aspect-[1/1.4] bg-white border-2 border-gray-800 rounded mb-2"></div>
                      <p className="font-semibold text-center text-sm">Classic</p>
                      {selectedTemplate === 'classic' && (
                        <p className="text-xs text-blue-600 mt-1">✓ Active</p>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="w-full">
                {selectedTemplate === 'modern' ? (
                  <ModernTemplate data={cvData} />
                ) : (
                  <ClassicTemplate data={cvData} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}


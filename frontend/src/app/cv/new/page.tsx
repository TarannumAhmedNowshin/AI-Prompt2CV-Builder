'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import ModernTemplate from '@/components/cv/ModernTemplate';
import ClassicTemplate from '@/components/cv/ClassicTemplate';
import { Save, Download, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

type TemplateType = 'modern' | 'classic';

export default function NewCVPage() {
  const router = useRouter();
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
  const [isGenerating, setIsGenerating] = useState(false);

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
      
      // Merge generated data with existing CV data
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
      setAiPrompt('');
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
    
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        toast.error('Please login to save CV');
        return;
      }
      
      const response = await fetch('http://localhost:8000/api/cv/', {
        method: 'POST',
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
          ai_prompt: aiPrompt || null,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to save CV');
      }
      
      const savedCV = await response.json();
      toast.success('CV saved successfully!');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Error saving CV:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save CV');
    }
  };

  const handleExport = () => {
    toast.success('Exporting CV as PDF...');
    // Add PDF export logic here
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-[1800px] mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Create New CV</h1>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  Cancel
                </Button>
                <Button variant="secondary" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
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
              <Card title="AI Assistant" subtitle="Use AI to generate content for your CV">
                <div className="space-y-4">
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe your experience, skills, or what you want to include in your CV..."
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

          {/* Right Side - Template Selection or CV Preview */}
          <div className="w-1/2 bg-gray-100 p-6">
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
                    <ModernTemplate data={cvData} />
                  ) : (
                    <ClassicTemplate data={cvData} />
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

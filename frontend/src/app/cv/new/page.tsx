'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Save, Download, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewCVPage() {
  const router = useRouter();
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
    
    // Simulate AI generation (replace with actual API call)
    setTimeout(() => {
      toast.success('AI content generated!');
      setCvData({
        ...cvData,
        summary: `Generated summary based on: ${aiPrompt}`,
      });
      setIsGenerating(false);
      setAiPrompt('');
    }, 2000);
  };

  const handleSave = () => {
    if (!cvData.title) {
      toast.error('Please enter a CV title');
      return;
    }
    toast.success('CV saved successfully!');
    router.push('/dashboard');
  };

  const handleExport = () => {
    toast.success('Exporting CV as PDF...');
    // Add PDF export logic here
  };

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Create New CV</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={handleExport}>
              <Download className="h-5 w-5 mr-2" />
              Export PDF
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-5 w-5 mr-2" />
              Save
            </Button>
          </div>
        </div>

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
              <div className="grid md:grid-cols-2 gap-4">
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
                placeholder="List your work experience..."
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
                placeholder="List your educational background..."
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
    </ProtectedRoute>
  );
}

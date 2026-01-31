'use client';

import React, { useState } from 'react';
import { Briefcase, Target, CheckCircle, AlertCircle, TrendingUp, Lightbulb, X } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface JobSuggestionData {
  match_score: number;
  summary_suggestions: string;
  skills_to_highlight: string[];
  skills_to_add: string[];
  experience_suggestions: string;
  keywords_to_include: string[];
  overall_recommendations: string[];
  strengths: string;
  gaps: string;
}

interface JobSuggestionsProps {
  cvId: string | number;
  onClose?: () => void;
}

export default function JobSuggestions({ cvId, onClose }: JobSuggestionsProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [suggestions, setSuggestions] = useState<JobSuggestionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleGetSuggestions = async () => {
    if (!jobDescription.trim() || jobDescription.length < 20) {
      setError('Please enter a more detailed job description (at least 20 characters)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('Please login to use this feature');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:8000/api/cv/${cvId}/job-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ job_description: jobDescription }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to get suggestions');
      }

      const data = await response.json();
      setSuggestions(data);
    } catch (err) {
      console.error('Error getting job suggestions:', err);
      setError(err instanceof Error ? err.message : 'Failed to get suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Needs Improvement';
  };

  return (
    <Card 
      title="Job Match Advisor" 
      subtitle="Paste a job description to get personalized suggestions for your CV"
    >
      <div className="space-y-4">
        {/* Job Description Input */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-700">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Job Description</span>
          </div>
          <textarea
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-500 focus:bg-white resize-none transition-all duration-200 text-slate-800 placeholder:text-slate-400"
            rows={5}
            placeholder="Paste the job description here... Include requirements, responsibilities, and qualifications for best results."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleGetSuggestions}
          isLoading={isLoading}
          fullWidth
          className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg"
        >
          <Target className="h-5 w-5" />
          <span>Analyze Job Match</span>
        </Button>

        {/* Suggestions Display */}
        {suggestions && (
          <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
            {/* Match Score */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Match Score</span>
                  <p className="text-sm text-slate-500">{getScoreLabel(suggestions.match_score)}</p>
                </div>
              </div>
              <div className={`text-3xl font-bold px-4 py-2 rounded-xl ${getScoreColor(suggestions.match_score)}`}>
                {suggestions.match_score}%
              </div>
            </div>

            {/* Strengths */}
            {suggestions.strengths && (
              <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="font-semibold text-emerald-800">Your Strengths</span>
                </div>
                <p className="text-emerald-700 text-sm leading-relaxed">{suggestions.strengths}</p>
              </div>
            )}

            {/* Gaps */}
            {suggestions.gaps && (
              <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <span className="font-semibold text-amber-800">Areas to Address</span>
                </div>
                <p className="text-amber-700 text-sm leading-relaxed">{suggestions.gaps}</p>
              </div>
            )}

            {/* Skills to Highlight */}
            {suggestions.skills_to_highlight.length > 0 && (
              <div className="p-4 bg-primary-50/80 rounded-xl border border-primary-100">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-primary-600" />
                  <span className="font-semibold text-primary-800">Skills to Highlight</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.skills_to_highlight.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium border border-primary-200/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Skills to Add */}
            {suggestions.skills_to_add.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-slate-600" />
                  <span className="font-semibold text-slate-800">Skills to Consider Adding</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.skills_to_add.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1.5 bg-white text-slate-700 rounded-full text-sm font-medium border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords to Include */}
            {suggestions.keywords_to_include.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold text-gray-800">Keywords to Include</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.keywords_to_include.map((keyword, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Suggestions */}
            {suggestions.summary_suggestions && (
              <div className="p-4 bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold text-gray-800">Summary Suggestions</span>
                </div>
                <p className="text-gray-700">{suggestions.summary_suggestions}</p>
              </div>
            )}

            {/* Experience Suggestions */}
            {suggestions.experience_suggestions && (
              <div className="p-4 bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="h-5 w-5 text-indigo-500" />
                  <span className="font-semibold text-gray-800">Experience Suggestions</span>
                </div>
                <p className="text-gray-700">{suggestions.experience_suggestions}</p>
              </div>
            )}

            {/* Overall Recommendations */}
            {suggestions.overall_recommendations.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-gray-800">Overall Recommendations</span>
                </div>
                <ul className="space-y-2">
                  {suggestions.overall_recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold mt-0.5">•</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Clear Results Button */}
            <Button
              onClick={() => {
                setSuggestions(null);
                setJobDescription('');
              }}
              variant="secondary"
              fullWidth
            >
              <X className="h-4 w-4 mr-2" />
              Clear and Try Another Job
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

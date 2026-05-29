'use client';

import React, { useState } from 'react';
import { ClipboardCheck, TrendingUp, AlertCircle, CheckCircle, ArrowRight, Search, Award, FileText, X } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface WeakBullet {
  original: string;
  improved: string;
}

interface ATSOptimization {
  score: number;
  formatting_issues: string[];
  missing_sections: string[];
  recommendations: string[];
}

interface AchievementQuantification {
  score: number;
  weak_bullets: WeakBullet[];
  strong_bullets: string[];
  recommendations: string[];
}

interface TailoringAnalysis {
  score: number;
  generic_phrases: string[];
  recommendations: string[];
}

interface CVReviewData {
  overall_score: number;
  ats_optimization: ATSOptimization;
  achievement_quantification: AchievementQuantification;
  tailoring: TailoringAnalysis;
  summary_feedback: string;
  top_priorities: string[];
}

interface CVReviewerProps {
  cvId: string | number;
}

export default function CVReviewer({ cvId }: CVReviewerProps) {
  const [review, setReview] = useState<CVReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReview = async () => {
    setIsLoading(true);
    setError(null);
    setReview(null);

    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setError('Please login to use this feature');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:8001/api/cv/${cvId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to review CV');
      }

      const data = await response.json();
      setReview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to review CV. Please try again.');
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
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Work';
    return 'Weak';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-amber-500';
    if (score >= 40) return 'from-orange-500 to-amber-500';
    return 'from-red-500 to-rose-500';
  };

  return (
    <Card
      title="CV Reviewer"
      subtitle="Get recruiter-perspective feedback on your CV — ATS, achievements, and tailoring"
    >
      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {!review && (
          <Button
            onClick={handleReview}
            isLoading={isLoading}
            fullWidth
            className="bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 shadow-lg"
          >
            <ClipboardCheck className="h-5 w-5" />
            <span>{isLoading ? 'Reviewing...' : 'Review My CV'}</span>
          </Button>
        )}

        {review && (
          <div className="mt-2 space-y-4 border-t border-slate-100 pt-5">
            {/* Overall Score */}
            <div className={`p-5 bg-gradient-to-r ${getScoreBg(review.overall_score)} rounded-xl text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Overall CV Score</p>
                  <p className="text-2xl font-bold">{review.overall_score}/100</p>
                </div>
                <div className="text-5xl font-bold opacity-30">{review.overall_score}</div>
              </div>
              {review.summary_feedback && (
                <p className="mt-3 text-white/90 text-sm leading-relaxed border-t border-white/20 pt-3">
                  {review.summary_feedback}
                </p>
              )}
            </div>

            {/* Top 3 Priorities */}
            {review.top_priorities.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-rose-50 to-orange-50 rounded-xl border border-rose-100">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-rose-600" />
                  <span className="font-semibold text-rose-800">Top Priorities</span>
                </div>
                <ol className="space-y-2">
                  {review.top_priorities.map((priority, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-rose-200 text-rose-700 rounded-full flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-rose-800 text-sm">{priority}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Section Scores Bar */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'ATS', score: review.ats_optimization.score, icon: Search },
                { label: 'Impact', score: review.achievement_quantification.score, icon: Award },
                { label: 'Tailoring', score: review.tailoring.score, icon: FileText },
              ].map((item) => (
                <div key={item.label} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <item.icon className="h-4 w-4 mx-auto mb-1 text-slate-500" />
                  <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                  <p className={`text-lg font-bold mt-0.5 ${getScoreColor(item.score).split(' ')[0]}`}>
                    {item.score}
                  </p>
                  <p className="text-xs text-slate-400">{getScoreLabel(item.score)}</p>
                </div>
              ))}
            </div>

            {/* ATS Optimization */}
            <div className="p-4 bg-blue-50/80 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <Search className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">ATS Optimization</span>
                <span className={`ml-auto text-sm font-bold px-2 py-0.5 rounded-full ${getScoreColor(review.ats_optimization.score)}`}>
                  {review.ats_optimization.score}%
                </span>
              </div>

              {review.ats_optimization.missing_sections.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1.5">Missing Sections</p>
                  <div className="flex flex-wrap gap-1.5">
                    {review.ats_optimization.missing_sections.map((section, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium border border-red-200/50">
                        {section}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {review.ats_optimization.formatting_issues.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1.5">Formatting Issues</p>
                  <ul className="space-y-1">
                    {review.ats_optimization.formatting_issues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                        <AlertCircle className="h-3.5 w-3.5 mt-0.5 text-blue-400 flex-shrink-0" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {review.ats_optimization.recommendations.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1.5">Recommendations</p>
                  <ul className="space-y-1">
                    {review.ats_optimization.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                        <CheckCircle className="h-3.5 w-3.5 mt-0.5 text-blue-500 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Achievement Quantification */}
            <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-100">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-5 w-5 text-amber-600" />
                <span className="font-semibold text-amber-800">Achievement Quantification</span>
                <span className={`ml-auto text-sm font-bold px-2 py-0.5 rounded-full ${getScoreColor(review.achievement_quantification.score)}`}>
                  {review.achievement_quantification.score}%
                </span>
              </div>

              {review.achievement_quantification.weak_bullets.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Before → After</p>
                  <div className="space-y-2">
                    {review.achievement_quantification.weak_bullets.map((bullet, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-amber-200/60">
                        <div className="flex items-start gap-2 text-sm">
                          <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
                          <span className="text-slate-500 line-through">{bullet.original}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm mt-1.5">
                          <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                          <span className="text-slate-800 font-medium">{bullet.improved}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {review.achievement_quantification.strong_bullets.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1.5">Strong Bullets</p>
                  <ul className="space-y-1">
                    {review.achievement_quantification.strong_bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-emerald-800">
                        <CheckCircle className="h-3.5 w-3.5 mt-0.5 text-emerald-500 flex-shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {review.achievement_quantification.recommendations.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1.5">Tips</p>
                  <ul className="space-y-1">
                    {review.achievement_quantification.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-amber-800">
                        <ArrowRight className="h-3.5 w-3.5 mt-0.5 text-amber-500 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Tailoring */}
            <div className="p-4 bg-purple-50/80 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-800">Tailoring & Language</span>
                <span className={`ml-auto text-sm font-bold px-2 py-0.5 rounded-full ${getScoreColor(review.tailoring.score)}`}>
                  {review.tailoring.score}%
                </span>
              </div>

              {review.tailoring.generic_phrases.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1.5">Generic Phrases to Replace</p>
                  <div className="flex flex-wrap gap-1.5">
                    {review.tailoring.generic_phrases.map((phrase, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200/50 line-through">
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {review.tailoring.recommendations.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1.5">Recommendations</p>
                  <ul className="space-y-1">
                    {review.tailoring.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-purple-800">
                        <CheckCircle className="h-3.5 w-3.5 mt-0.5 text-purple-500 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Clear Results */}
            <Button
              onClick={() => setReview(null)}
              variant="secondary"
              fullWidth
            >
              <X className="h-4 w-4 mr-2" />
              Clear and Review Again
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

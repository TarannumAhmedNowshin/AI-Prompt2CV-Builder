'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Plus, FileText, Calendar, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CV {
  id: number;
  title: string;
  template: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        toast.error('Please login to view your CVs');
        return;
      }

      const response = await fetch('http://localhost:8000/api/cv/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CVs');
      }

      const data = await response.json();
      setCvs(data);
    } catch (error) {
      console.error('Error fetching CVs:', error);
      toast.error('Failed to load CVs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    router.push('/cv/new');
  };

  const handleEdit = (id: number) => {
    router.push(`/cv/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this CV?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`http://localhost:8000/api/cv/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete CV');
      }

      setCvs(cvs.filter(cv => cv.id !== id));
      toast.success('CV deleted successfully');
    } catch (error) {
      console.error('Error deleting CV:', error);
      toast.error('Failed to delete CV');
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-8 text-white overflow-hidden shadow-soft-lg">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary-400/20 rounded-full blur-2xl"></div>
          </div>
          
          <div className="relative">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-primary-100 text-lg">
              Ready to create or edit your professional CV?
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">My CVs</h2>
            <p className="text-slate-500 mt-1">Manage your professional resumes</p>
          </div>
          <Button onClick={handleCreateNew} className="shadow-lg hover:shadow-xl">
            <Plus className="h-5 w-5" />
            <span>Create New CV</span>
          </Button>
        </div>

        {/* CV List */}
        {isLoading ? (
          <Card variant="elevated">
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-full mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
              </div>
              <p className="text-slate-500">Loading your CVs...</p>
            </div>
          </Card>
        ) : cvs.length === 0 ? (
          <Card variant="elevated">
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-2xl mb-6">
                <FileText className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No CVs yet
              </h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                Get started by creating your first CV with AI assistance
              </p>
              <Button onClick={handleCreateNew} className="shadow-lg">
                <Plus className="h-5 w-5" />
                <span>Create Your First CV</span>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cvs.map((cv) => (
              <Card key={cv.id} className="hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer" variant="elevated">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl shadow-md">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(cv.id)}
                        className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-150"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cv.id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {cv.title}
                    </h3>
                    {cv.full_name && (
                      <p className="text-sm text-slate-500 mb-3">{cv.full_name}</p>
                    )}
                    <div className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-primary-50 text-primary-700 border border-primary-200/50 mb-3">
                      {cv.template}
                    </div>
                    <div className="space-y-1.5 text-sm text-slate-500">
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-2 text-slate-400" />
                        Created: {new Date(cv.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-2 text-slate-400" />
                        Updated: {new Date(cv.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => handleEdit(cv.id)}
                  >
                    Edit CV
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

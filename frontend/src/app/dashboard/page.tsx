'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Plus, FileText, Calendar, Edit, Trash2 } from 'lucide-react';

interface CV {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cvs, setCvs] = useState<CV[]>([
    // Mock data for now
    {
      id: '1',
      title: 'Software Engineer Resume',
      createdAt: '2026-01-20',
      updatedAt: '2026-01-25',
    },
  ]);

  const handleCreateNew = () => {
    router.push('/cv/new');
  };

  const handleEdit = (id: string) => {
    router.push(`/cv/${id}`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this CV?')) {
      setCvs(cvs.filter(cv => cv.id !== id));
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-primary-100">
            Ready to create or edit your professional CV?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">My CVs</h2>
          <Button onClick={handleCreateNew}>
            <Plus className="h-5 w-5 mr-2" />
            Create New CV
          </Button>
        </div>

        {/* CV List */}
        {cvs.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No CVs yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first CV with AI assistance
              </p>
              <Button onClick={handleCreateNew}>
                <Plus className="h-5 w-5 mr-2" />
                Create Your First CV
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cvs.map((cv) => (
              <Card key={cv.id} className="hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <FileText className="h-8 w-8 text-primary-600" />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(cv.id)}
                        className="text-gray-600 hover:text-primary-600 transition-colors"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cv.id)}
                        className="text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {cv.title}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Created: {new Date(cv.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Updated: {new Date(cv.updatedAt).toLocaleDateString()}
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

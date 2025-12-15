'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { chatbotService } from '@/lib/supabase/services/chatbotService';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface ChatbotQA {
  id: string;
  question_en: string;
  question_hi: string;
  answer_en: string;
  answer_hi: string;
  category?: string;
  is_active: boolean;
  priority: number;
}

const AdminChatbotModule = () => {
  const [questions, setQuestions] = useState<ChatbotQA[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    question_en: '',
    question_hi: '',
    answer_en: '',
    answer_hi: '',
    category: '',
    priority: 0,
    is_active: true
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load all questions
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await chatbotService.getQuestions('en'); // Language doesn't matter for admin
      setQuestions(data);
    } catch (err) {
      setError('Failed to load questions');
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'priority' ? parseInt(value) : name === 'is_active' ? value === 'true' : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        // Update existing question
        await chatbotService.updateQAPair(editingId, formData);
        setEditingId(null);
      } else {
        // Add new question
        await chatbotService.addQAPair(formData);
      }
      
      // Reset form
      setFormData({
        question_en: '',
        question_hi: '',
        answer_en: '',
        answer_hi: '',
        category: '',
        priority: 0,
        is_active: true
      });
      
      // Reload questions
      loadQuestions();
    } catch (err) {
      setError('Failed to save question');
      console.error('Error saving question:', err);
    }
  };

  const handleEdit = (question: ChatbotQA) => {
    setFormData({
      question_en: question.question_en,
      question_hi: question.question_hi,
      answer_en: question.answer_en,
      answer_hi: question.answer_hi,
      category: question.category || '',
      priority: question.priority,
      is_active: question.is_active
    });
    setEditingId(question.id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await chatbotService.toggleQAStatus(id, false); // Soft delete by deactivating
        loadQuestions(); // Reload questions
      } catch (err) {
        setError('Failed to delete question');
        console.error('Error deleting question:', err);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await chatbotService.toggleQAStatus(id, !currentStatus);
      loadQuestions(); // Reload questions
    } catch (err) {
      setError('Failed to update status');
      console.error('Error updating status:', err);
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.question_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.question_hi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.answer_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.answer_hi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.category && q.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Chatbot Management</CardTitle>
              <CardDescription>Manage questions and answers for the chatbot</CardDescription>
            </div>
            <Link href="/admin/superadmin#chatbot" passHref>
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add/Edit Form */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Question' : 'Add New Question'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="question_en">Question (English)</Label>
                    <Input
                      id="question_en"
                      name="question_en"
                      value={formData.question_en}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter question in English"
                    />
                  </div>
                  <div>
                    <Label htmlFor="question_hi">Question (Hindi)</Label>
                    <Input
                      id="question_hi"
                      name="question_hi"
                      value={formData.question_hi}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter question in Hindi"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="answer_en">Answer (English)</Label>
                    <Textarea
                      id="answer_en"
                      name="answer_en"
                      value={formData.answer_en}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter answer in English"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="answer_hi">Answer (Hindi)</Label>
                    <Textarea
                      id="answer_hi"
                      name="answer_hi"
                      value={formData.answer_hi}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter answer in Hindi"
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="e.g. pricing, support, booking"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={formData.priority.toString()} 
                      onValueChange={(value) => handleSelectChange('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="is_active">Status</Label>
                    <Select 
                      value={formData.is_active.toString()} 
                      onValueChange={(value) => handleSelectChange('is_active', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit">{editingId ? 'Update' : 'Add'} Question</Button>
                  {editingId && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          question_en: '',
                          question_hi: '',
                          answer_en: '',
                          answer_hi: '',
                          category: '',
                          priority: 0,
                          is_active: true
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Questions List */}
          <Card>
            <CardHeader>
              <CardTitle>Questions List</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Question (EN)</th>
                      <th className="text-left py-2">Question (HI)</th>
                      <th className="text-left py-2">Category</th>
                      <th className="text-left py-2">Priority</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.map((q) => (
                      <tr key={q.id} className="border-b">
                        <td className="py-2 max-w-xs truncate">{q.question_en}</td>
                        <td className="py-2 max-w-xs truncate">{q.question_hi}</td>
                        <td className="py-2">{q.category || '-'}</td>
                        <td className="py-2">{q.priority}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            q.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {q.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-2">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEdit(q)}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant={q.is_active ? "outline" : "default"}
                              onClick={() => handleToggleStatus(q.id, q.is_active)}
                            >
                              {q.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDelete(q.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredQuestions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No questions found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminChatbotModule;
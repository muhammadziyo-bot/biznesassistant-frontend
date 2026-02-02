import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Template, TemplateFormData } from '../types/template';
import toast from 'react-hot-toast';

export const useTemplates = (templateType?: 'transaction' | 'invoice') => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    type: templateType || 'transaction',
    description: '',
    is_recurring: false,
    recurring_interval: 'monthly',
    recurring_day: 1,
    data: {}
  });

  useEffect(() => {
    fetchTemplates();
  }, [templateType]);

  const fetchTemplates = async () => {
    try {
      const params = templateType ? { type: templateType } : {};
      const response = await api.get('/api/templates', { params });
      setTemplates(response.data);
    } catch (error) {
      toast.error('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (data: TemplateFormData) => {
    try {
      const response = await api.post('/api/templates', data);
      setTemplates([...templates, response.data]);
      toast.success('Template created successfully');
      setShowTemplateForm(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to create template');
    }
  };

  const applyTemplate = async (templateId: number, customData?: any) => {
    try {
      const response = await api.post(`/api/templates/${templateId}/apply`, { custom_data: customData });
      toast.success('Template applied successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to apply template');
      throw error;
    }
  };

  const deleteTemplate = async (id: number) => {
    try {
      await api.delete(`/api/templates/${id}`);
      setTemplates(templates.filter(t => t.id !== id));
      toast.success('Template deleted successfully');
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: templateType || 'transaction',
      description: '',
      is_recurring: false,
      recurring_interval: 'monthly',
      recurring_day: 1,
      data: {}
    });
  };

  return {
    templates,
    loading,
    showTemplateForm,
    formData,
    setShowTemplateForm,
    setFormData,
    createTemplate,
    applyTemplate,
    deleteTemplate,
    resetForm,
    fetchTemplates
  };
};

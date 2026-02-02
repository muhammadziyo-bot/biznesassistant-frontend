import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useTranslation } from '../hooks/useTranslation';

interface InviteColleaguesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ColleagueData {
  username: string;
  password: string;
  full_name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'accountant' | 'manager' | 'employee';
}

const InviteColleaguesModal: React.FC<InviteColleaguesModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [colleagues, setColleagues] = useState<ColleagueData[]>([
    {
      username: '',
      password: '',
      full_name: '',
      email: '',
      phone: '',
      role: 'employee'
    }
  ]);

  const addColleague = () => {
    setColleagues([
      ...colleagues,
      {
        username: '',
        password: '',
        full_name: '',
        email: '',
        phone: '',
        role: 'employee'
      }
    ]);
  };

  const removeColleague = (index: number) => {
    if (colleagues.length > 1) {
      setColleagues(colleagues.filter((_, i) => i !== index));
    }
  };

  const updateColleague = (index: number, field: keyof ColleagueData, value: string) => {
    const updatedColleagues = [...colleagues];
    updatedColleagues[index] = {
      ...updatedColleagues[index],
      [field]: value
    };
    setColleagues(updatedColleagues);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const generateUsername = (fullName: string, index: number) => {
    const baseName = fullName.toLowerCase().replace(/\s+/g, '');
    return baseName + (index > 0 ? index + 1 : '') + Math.floor(Math.random() * 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate all colleagues
      for (const colleague of colleagues) {
        if (!colleague.username || !colleague.password || !colleague.full_name || !colleague.email) {
          throw new Error('Please fill in all required fields for all colleagues');
        }
      }

      // Create accounts for all colleagues
      for (const colleague of colleagues) {
        await api.post('/api/auth/register-colleague', colleague);
      }

      toast.success(t('inviteColleagues.accountCreated', colleagues.length.toString()));
      
      // Reset form
      setColleagues([{
        username: '',
        password: '',
        full_name: '',
        email: '',
        phone: '',
        role: 'employee'
      }]);
      
      onClose();
    } catch (error: any) {
      console.error('Failed to create colleague accounts:', error);
      toast.error(error.response?.data?.detail || 'Failed to create colleague accounts');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('inviteColleagues.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {colleagues.map((colleague, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{t('inviteColleagues.title')} {index + 1}</h3>
                {colleagues.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeColleague(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    {t('inviteColleagues.remove')}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('inviteColleagues.fullName')} *
                  </label>
                  <input
                    type="text"
                    value={colleague.full_name}
                    onChange={(e) => {
                      updateColleague(index, 'full_name', e.target.value);
                      if (!colleague.username) {
                        updateColleague(index, 'username', generateUsername(e.target.value, index));
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('inviteColleagues.email')} *
                  </label>
                  <input
                    type="email"
                    value={colleague.email}
                    onChange={(e) => updateColleague(index, 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('inviteColleagues.username')} *
                  </label>
                  <input
                    type="text"
                    value={colleague.username}
                    onChange={(e) => updateColleague(index, 'username', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('inviteColleagues.password')} *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={colleague.password}
                      onChange={(e) => updateColleague(index, 'password', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => updateColleague(index, 'password', generatePassword())}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      {t('inviteColleagues.generatePassword')}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('inviteColleagues.phone')}
                  </label>
                  <input
                    type="tel"
                    value={colleague.phone}
                    onChange={(e) => updateColleague(index, 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('inviteColleagues.role')} *
                  </label>
                  <select
                    value={colleague.role}
                    onChange={(e) => updateColleague(index, 'role', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="employee">{t('inviteColleagues.roles.employee')}</option>
                    <option value="accountant">{t('inviteColleagues.roles.accountant')}</option>
                    <option value="manager">{t('inviteColleagues.roles.manager')}</option>
                    <option value="admin">{t('inviteColleagues.roles.admin')}</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={addColleague}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {t('inviteColleagues.addAnother')}
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                disabled={submitting}
              >
                {t('inviteColleagues.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? t('inviteColleagues.creatingAccounts') : t('inviteColleagues.createAccounts', colleagues.length.toString())}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteColleaguesModal;

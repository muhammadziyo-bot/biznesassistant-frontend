import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    language: 'uz',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user?.full_name || '',
        email: user?.email || '',
        phone: '', // phone not in User interface
        language: user?.language || 'uz',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      // API call to update profile would go here
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">User not found</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      <div className="max-w-2xl">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="full_name" className="label">
                  Full Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="language" className="label">
                  Language
                </label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="uz">Uzbek</option>
                  <option value="ru">Russian</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <div className="card mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Username:</span>
              <span className="font-medium">{user?.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Role:</span>
              <span className="font-medium capitalize">{user?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Company ID:</span>
              <span className="font-medium">{user?.company_id || 'None'}</span>
            </div>
          </div>
        </div>

        <div className="card mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Danger Zone</h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={logout}
                className="btn btn-secondary"
              >
                Logout
              </button>
              <button className="btn btn-danger">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

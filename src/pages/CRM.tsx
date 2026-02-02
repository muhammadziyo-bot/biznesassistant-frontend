import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useTranslation } from '../hooks/useTranslation';
import toast from 'react-hot-toast';
import AutoComplete from '../components/AutoComplete';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  company_name: string;
  type: string;
  created_at: string;
}

interface Lead {
  id: number;
  title: string;
  contact_name: string;
  status: string;
  estimated_value: number;
  created_at: string;
}

const CRM: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'leads' | 'deals'>('contacts');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [contactFormData, setContactFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    company_name: string;
    type: string;
  }>({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    type: 'customer'
  });
  const [leadFormData, setLeadFormData] = useState<{
    title: string;
    contact_name: string;
    status: string;
    estimated_value: string;
  }>({
    title: '',
    contact_name: '',
    status: 'new',
    estimated_value: ''
  });
  const { t } = useTranslation();

  useEffect(() => {
    fetchCRMData();
  }, []);

  const fetchCRMData = async () => {
    try {
      const [contactsResponse, leadsResponse] = await Promise.all([
        api.get('/api/crm/contacts'),
        api.get('/api/crm/leads')
      ]);
      setContacts(contactsResponse.data as Contact[]);
      setLeads(leadsResponse.data as Lead[]);
    } catch (error) {
      console.error('Failed to fetch CRM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContactFormData({ 
      ...contactFormData, 
      [name]: value 
    } as any);
  };

  const handleLeadInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLeadFormData({ 
      ...leadFormData, 
      [name]: value 
    } as any);
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.post('/api/crm/contacts', contactFormData);
      const newContact = response.data as Contact;
      setContacts([newContact, ...contacts]);
      setShowContactForm(false);
      setContactFormData({
        name: '',
        email: '',
        phone: '',
        company_name: '',
        type: 'customer'
      });
      toast.success('Contact created successfully!');
    } catch (error: any) {
      console.error('Failed to create contact:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to create contacts');
      } else if (error.response?.status === 403) {
        toast.error('You don\'t have permission to create contacts');
      } else {
        toast.error(`Failed to create contact: ${error.response?.data?.detail || 'Please try again'}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const leadData = {
        ...leadFormData,
        estimated_value: leadFormData.estimated_value ? parseFloat(leadFormData.estimated_value) : 0
      };
      const response = await api.post('/api/crm/leads', leadData);
      const newLead = response.data as Lead;
      setLeads([newLead, ...leads]);
      setShowLeadForm(false);
      setLeadFormData({
        title: '',
        contact_name: '',
        status: 'new',
        estimated_value: ''
      });
      toast.success('Lead created successfully!');
    } catch (error: any) {
      console.error('Failed to create lead:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to create leads');
      } else if (error.response?.status === 403) {
        toast.error('You don\'t have permission to create leads');
      } else {
        toast.error(`Failed to create lead: ${error.response?.data?.detail || 'Please try again'}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleConvertLeadToDeal = async (leadId: number) => {
    try {
      const lead = leads.find(l => l.id === leadId);
      if (!lead) return;

      const dealData = {
        title: lead.title,
        primary_contact: lead.contact_name,
        contact_email: '',
        contact_phone: '',
        company_name: '',
        deal_value: lead.estimated_value,
        expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        probability: 25,
        confidence_level: 50,
        products_services: lead.title,
        next_steps: 'Contact lead to discuss requirements',
        priority: 'medium'
      };

      const response = await api.post('/api/crm/deals', dealData);
      
      // Update lead status
      await api.put(`/api/crm/leads/${leadId}`, { status: 'qualified' });
      
      // Update local state
      setLeads(leads.map(l => l.id === leadId ? {...l, status: 'qualified'} : l));
      
      toast.success('Lead converted to deal successfully!');
    } catch (error: any) {
      console.error('Failed to convert lead:', error);
      toast.error('Failed to convert lead to deal');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('crm.title')}</h1>
        <p className="text-gray-600">{t('crm.subtitle')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="stat-card primary">
          <h3 className="text-lg font-semibold text-gray-900">{t('crm.totalContacts')}</h3>
          <p className="text-2xl font-bold text-blue-600">{contacts.length}</p>
        </div>
        <div className="stat-card success">
          <h3 className="text-lg font-semibold text-gray-900">{t('crm.activeLeads')}</h3>
          <p className="text-2xl font-bold text-green-600">
            {leads.filter(l => l.status !== 'converted' && l.status !== 'lost').length}
          </p>
        </div>
        <div className="stat-card warning">
          <h3 className="text-lg font-semibold text-gray-900">{t('crm.activeDeals')}</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {(leads.reduce((sum, l) => sum + (l.estimated_value || 0), 0) || 0).toLocaleString()} UZS
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex overflow-x-auto">
            {['contacts', 'leads', 'deals'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-2 px-3 sm:px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'contacts' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Contacts</h3>
                <button 
                  onClick={() => setShowContactForm(true)}
                  className="btn btn-primary w-full sm:w-auto"
                >
                  {t('crm.addContact')}
                </button>
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Name</th>
                      <th className="table-header-cell">Company</th>
                      <th className="table-header-cell">Email</th>
                      <th className="table-header-cell">Phone</th>
                      <th className="table-header-cell">Type</th>
                      <th className="table-header-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {contacts.map((contact) => (
                      <tr key={contact.id}>
                        <td className="table-cell font-medium">{contact.name}</td>
                        <td className="table-cell">{contact.company_name || '-'}</td>
                        <td className="table-cell">{contact.email || '-'}</td>
                        <td className="table-cell">{contact.phone || '-'}</td>
                        <td className="table-cell">
                          <span className="status-badge status-new">
                            {contact.type}
                          </span>
                        </td>
                        <td className="table-cell">
                          <button className="text-blue-600 hover:text-blue-800 mr-2">
                            View
                          </button>
                          <button className="text-red-600 hover:text-red-800">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-lg">👤</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{contact.name}</p>
                          <p className="text-sm text-gray-500">{contact.company_name || 'No Company'}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {contact.type}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      {contact.email && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500 mr-2">📧</span>
                          <span className="text-gray-900">{contact.email}</span>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500 mr-2">📱</span>
                          <span className="text-gray-900">{contact.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        View
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {contacts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No contacts found
                </div>
              )}
            </div>
          )}

          {activeTab === 'leads' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Leads</h3>
                <button 
                  onClick={() => setShowLeadForm(true)}
                  className="btn btn-primary"
                >
                  {t('crm.addLead')}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Title</th>
                      <th className="table-header-cell">Contact</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Value</th>
                      <th className="table-header-cell">Created</th>
                      <th className="table-header-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {leads.map((lead) => (
                      <tr key={lead.id}>
                        <td className="table-cell font-medium">{lead.title}</td>
                        <td className="table-cell">{lead.contact_name}</td>
                        <td className="table-cell">
                          <span className={`status-badge ${
                            lead.status === 'new' ? 'status-new' :
                            lead.status === 'qualified' ? 'status-sent' :
                            lead.status === 'converted' ? 'status-paid' : 'status-draft'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="table-cell">
                          {lead.estimated_value ? `${(lead.estimated_value || 0).toLocaleString()} UZS` : '-'}
                        </td>
                        <td className="table-cell">
                          {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="table-cell">
                          <button className="text-blue-600 hover:text-blue-800 mr-2">
                            View
                          </button>
                          {lead.status !== 'converted' && lead.status !== 'qualified' && (
                            <button 
                              onClick={() => handleConvertLeadToDeal(lead.id)}
                              className="text-green-600 hover:text-green-800 mr-2"
                            >
                              Convert to Deal
                            </button>
                          )}
                          <button className="text-red-600 hover:text-red-800">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {leads.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No leads found. Add your first lead to get started.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'deals' && (
            <div className="text-center py-8 text-gray-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Deals Management</h3>
              <p>Deal management functionality coming soon!</p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{t('crm.addContact')}</h2>
            <form onSubmit={handleCreateContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('common.name')}
                </label>
                <AutoComplete
                  value={contactFormData.name}
                  onChange={(value) => setContactFormData({...contactFormData, name: value})}
                  onSelect={(contact) => setContactFormData({
                    ...contactFormData,
                    name: contact.name,
                    email: contact.email || contactFormData.email,
                    phone: contact.phone || contactFormData.phone,
                    company_name: contact.company_name || contactFormData.company_name
                  })}
                  suggestions={contacts}
                  placeholder="Start typing customer name..."
                  displayField="name"
                  valueField="id"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('common.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={contactFormData.email}
                  onChange={handleContactInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('common.phone')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={contactFormData.phone}
                  onChange={handleContactInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('crm.company')}
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={contactFormData.company_name}
                  onChange={handleContactInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={contactFormData.type}
                  onChange={handleContactInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="customer">Customer</option>
                  <option value="prospect">Prospect</option>
                  <option value="partner">Partner</option>
                  <option value="supplier">Supplier</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 space-y-2 sm:space-y-0">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="btn btn-secondary w-full sm:w-auto"
                  disabled={submitting}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary w-full sm:w-auto"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : t('common.add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Form Modal */}
      {showLeadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{t('crm.addLead')}</h2>
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={leadFormData.title}
                  onChange={handleLeadInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={leadFormData.contact_name}
                  onChange={handleLeadInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={leadFormData.status}
                  onChange={handleLeadInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="new">New</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Value (UZS)
                </label>
                <input
                  type="number"
                  name="estimated_value"
                  value={leadFormData.estimated_value}
                  onChange={handleLeadInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 space-y-2 sm:space-y-0">
                <button
                  type="button"
                  onClick={() => setShowLeadForm(false)}
                  className="btn btn-secondary w-full sm:w-auto"
                  disabled={submitting}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary w-full sm:w-auto"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : t('common.add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;

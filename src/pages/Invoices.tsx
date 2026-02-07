import React, { useState, useEffect } from 'react';
// @ts-ignore
import { useQueryClient } from 'react-query';
import api from '../api/axios';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  status: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  issue_date: string;
  due_date: string;
  paid_date: string;
  created_at: string;
}

const Invoices: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({
    customer_name: '',
    total_amount: '',
    paid_amount: '0',
    paid_date: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    status: 'draft',
    notes: ''
  });
  const [customerReliability, setCustomerReliability] = useState<any>(null);
  const [isLoadingReliability, setIsLoadingReliability] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<any[]>([]);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      toast.error('Please log in to access invoices');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }
    fetchInvoices();
    fetchContacts();
  }, [user]);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/api/invoices/invoices');
      setInvoices(response.data as Invoice[]);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await api.get('/api/crm/contacts');
      setContacts(response.data);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Handle customer name input with auto-complete
    if (name === 'customer_name') {
      const customerName = value.trim();
      
      // Show auto-complete suggestions after 2 letters
      if (customerName.length >= 2) {
        const suggestions = contacts.filter(contact =>
          contact.name.toLowerCase().includes(customerName.toLowerCase())
        ).slice(0, 5); // Limit to 5 suggestions
        
        setAutoCompleteSuggestions(suggestions);
        setShowAutoComplete(suggestions.length > 0);
        setSelectedSuggestionIndex(-1);
      } else {
        setShowAutoComplete(false);
        setAutoCompleteSuggestions([]);
      }
      
      // Check if exact match exists and fetch reliability
      const exactMatch = contacts.find(contact =>
        contact.name.toLowerCase() === customerName.toLowerCase()
      );
      
      if (exactMatch) {
        fetchCustomerReliability(exactMatch.id);
      } else {
        setCustomerReliability(null);
      }
    }
  };

  // Handle keyboard navigation for auto-complete
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showAutoComplete) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const newIndexDown = selectedSuggestionIndex < autoCompleteSuggestions.length - 1 
          ? selectedSuggestionIndex + 1 
          : 0;
        setSelectedSuggestionIndex(newIndexDown);
        break;
      case 'ArrowUp':
        e.preventDefault();
        const newIndexUp = selectedSuggestionIndex > 0 
          ? selectedSuggestionIndex - 1 
          : autoCompleteSuggestions.length - 1;
        setSelectedSuggestionIndex(newIndexUp);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          selectSuggestion(autoCompleteSuggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowAutoComplete(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Select auto-complete suggestion
  const selectSuggestion = (contact: any) => {
    setFormData(prev => ({ ...prev, customer_name: contact.name }));
    setShowAutoComplete(false);
    setSelectedSuggestionIndex(-1);
    fetchCustomerReliability(contact.id);
  };

  // Customer Reliability Function
  const fetchCustomerReliability = async (contactId: number) => {
    setIsLoadingReliability(true);
    try {
      const response = await api.get(`/api/ml/customer-reliability/${contactId}`);
      setCustomerReliability(response.data.reliability);
    } catch (error) {
      console.error('Failed to fetch customer reliability:', error);
      setCustomerReliability(null);
    } finally {
      setIsLoadingReliability(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Create a default item if no items are provided
      const defaultItem = {
        description: formData.notes || 'Service/Product',
        quantity: 1,
        unit_price: parseFloat(formData.total_amount || '0'),
        total_price: parseFloat(formData.total_amount || '0')
      };

      const invoiceData = {
        ...formData,
        items: [defaultItem]
      };

      const response = await api.post('/api/invoices/invoices', invoiceData);
      const newInvoice = response.data as Invoice;
      setInvoices([newInvoice, ...invoices]);
      
      // Invalidate related queries
      queryClient.invalidateQueries(['analytics-summary']);
      
      // Reset form
      setFormData({
        customer_name: '',
        total_amount: '',
        paid_amount: '0',
        paid_date: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        status: 'draft',
        notes: ''
      });
      setCustomerReliability(null);
      setShowAutoComplete(false);
      setAutoCompleteSuggestions([]);
      setShowCreateForm(false);
      
      // Show success message
      toast.success('Invoice created successfully!');
    } catch (error: any) {
      console.error('Failed to create invoice:', error);
      
      // Handle specific authentication errors
      if (error.response?.status === 401) {
        toast.error('Please log in to create invoices');
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (error.response?.status === 403) {
        toast.error('You don\'t have permission to create invoices');
      } else {
        toast.error(`Failed to create invoice: ${error.response?.data?.detail || 'Please try again'}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    try {
      await api.delete(`/api/invoices/invoices/${id}`);
      setInvoices(invoices.filter(i => i.id !== id));
      
      // Invalidate related queries
      queryClient.invalidateQueries(['analytics-summary']);
      
      toast.success('Invoice deleted successfully!');
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      toast.error('Failed to delete invoice. Please try again.');
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      const invoice = invoices.find(i => i.id === id);
      if (!invoice) return;

      // Update invoice status to paid
      await api.put(`/api/invoices/invoices/${id}`, {
        status: 'paid',
        paid_amount: invoice.total_amount,
        paid_date: new Date().toISOString()
      });

      // Create transaction for the payment
      const transactionData = {
        type: 'income',
        amount: invoice.total_amount,
        category: 'sales',
        description: `Payment for invoice ${invoice.invoice_number}`,
        date: new Date().toISOString(),
        vat_included: true,
        invoice_id: id
      };

      await api.post('/api/accounting/transactions', transactionData);

      // Update local state
      setInvoices(invoices.map(i => 
        i.id === id 
          ? { ...i, status: 'paid', paid_amount: i.total_amount, remaining_amount: 0 }
          : i
      ));
      
      // Invalidate related queries
      queryClient.invalidateQueries(['analytics-summary']);
      queryClient.invalidateQueries(['kpis']);
      
      toast.success('Invoice marked as paid and transaction recorded!');
    } catch (error) {
      console.error('Failed to mark invoice as paid:', error);
      toast.error('Failed to mark invoice as paid');
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('invoices.title')}</h1>
          <p className="text-gray-600">{t('invoices.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary"
        >
          {t('invoices.createInvoice')}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stat-card primary">
          <h3 className="text-lg font-semibold text-gray-900">{t('invoices.totalInvoices')}</h3>
          <p className="text-2xl font-bold text-blue-600">{invoices.length}</p>
        </div>
        <div className="stat-card success">
          <h3 className="text-lg font-semibold text-gray-900">{t('invoices.status')}</h3>
          <p className="text-2xl font-bold text-green-600">
            {invoices.filter(inv => inv.status === 'paid').length}
          </p>
        </div>
        <div className="stat-card warning">
          <h3 className="text-lg font-semibold text-gray-900">{t('invoices.pending')}</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {invoices.filter(inv => inv.status === 'sent').length}
          </p>
        </div>
        <div className="stat-card danger">
          <h3 className="text-lg font-semibold text-gray-900">{t('invoices.overdueInvoices')}</h3>
          <p className="text-2xl font-bold text-red-600">
            {invoices.filter(inv => inv.status === 'overdue').length}
          </p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('invoices.title')}</h2>
        
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">{t('invoices.invoiceNumber')}</th>
                <th className="table-header-cell">{t('invoices.customer')}</th>
                <th className="table-header-cell">{t('invoices.issueDate')}</th>
                <th className="table-header-cell">{t('invoices.dueDate')}</th>
                <th className="table-header-cell">{t('common.amount')}</th>
                <th className="table-header-cell">{t('invoices.paidAmount')}</th>
                <th className="table-header-cell">{t('invoices.remainingAmount')}</th>
                <th className="table-header-cell">{t('common.status')}</th>
                <th className="table-header-cell">{t('common.edit')} / {t('common.delete')}</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="table-cell font-medium">{invoice.invoice_number}</td>
                  <td className="table-cell">{invoice.customer_name}</td>
                  <td className="table-cell">
                    {invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="table-cell">
                    {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="table-cell font-medium">
                    {(invoice.total_amount || 0).toLocaleString()} UZS
                  </td>
                  <td className="table-cell">
                    {(invoice.paid_amount || 0).toLocaleString()} UZS
                  </td>
                  <td className="table-cell">
                    {(invoice.remaining_amount || 0).toLocaleString()} UZS
                  </td>
                  <td className="table-cell">
                    <span className={`status-badge ${
                      invoice.status === 'paid' ? 'status-paid' :
                      invoice.status === 'sent' ? 'status-sent' :
                      invoice.status === 'overdue' ? 'status-overdue' : 'status-draft'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <button className="text-blue-600 hover:text-blue-800 mr-2">
                      {t('common.view')}
                    </button>
                    <button className="text-green-600 hover:text-green-800 mr-2">
                      {t('common.edit')}
                    </button>
                    {invoice.status !== 'paid' && (
                      <button 
                        onClick={() => handleMarkAsPaid(invoice.id)}
                        className="text-purple-600 hover:text-purple-800 mr-2"
                      >
                        {t('invoices.markAsPaid')}
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(invoice.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      {t('common.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-3">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    invoice.status === 'paid' ? 'bg-green-100' :
                    invoice.status === 'sent' ? 'bg-blue-100' :
                    invoice.status === 'overdue' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    <span className="text-lg">
                      {invoice.status === 'paid' ? '✅' :
                       invoice.status === 'sent' ? '📤' :
                       invoice.status === 'overdue' ? '⚠️' : '📄'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
                    <p className="text-sm text-gray-500">{invoice.customer_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900">
                    {(invoice.total_amount || 0).toLocaleString()} UZS
                  </p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    invoice.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('invoices.issueDate')}:</span>
                  <span className="text-gray-900">
                    {invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('invoices.dueDate')}:</span>
                  <span className="text-gray-900">
                    {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('invoices.paidAmount')}:</span>
                  <span className="text-gray-900">
                    {(invoice.paid_amount || 0).toLocaleString()} UZS
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('invoices.remainingAmount')}:</span>
                  <span className="font-medium text-gray-900">
                    {(invoice.remaining_amount || 0).toLocaleString()} UZS
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  {t('common.view')}
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  {t('common.edit')}
                </button>
                {invoice.status !== 'paid' && (
                  <button 
                    onClick={() => handleMarkAsPaid(invoice.id)}
                    className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    {t('invoices.markAsPaid')}
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(invoice.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {invoices.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {t('invoices.noInvoices')}
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal max-w-2xl w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('invoices.modal.title')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">{t('invoices.modal.customerName')}</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      className="input w-full" 
                      placeholder={t('invoices.modal.customerName') + '...'} 
                      required 
                    />
                    
                    {/* Auto-complete Dropdown */}
                    {showAutoComplete && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {autoCompleteSuggestions.map((contact, index) => (
                          <div
                            key={contact.id}
                            className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                              index === selectedSuggestionIndex ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => selectSuggestion(contact)}
                          >
                            <span className="text-gray-900">{contact.name}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                selectSuggestion(contact);
                              }}
                              className="text-green-600 hover:text-green-800 font-bold text-lg"
                            >
                              ✓
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Customer Reliability Display - Only shows for exact matches */}
                  {customerReliability && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-green-700 font-medium">{t('invoices.reliability.title')}</span>
                        <span className={`font-bold ${
                          customerReliability.class === 'high' ? 'text-green-600' :
                          customerReliability.class === 'medium' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {customerReliability.score}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>{t('invoices.reliability.avgPayment', customerReliability.avg_days)}</div>
                        <div>{t('invoices.reliability.totalInvoices', customerReliability.total_invoices)}</div>
                        <div>{t('invoices.reliability.paidInvoices', customerReliability.paid_invoices)}</div>
                        <div>{t('invoices.reliability.lastPayment', customerReliability.last_payment)}</div>
                      </div>
                    </div>
                  )}
                  
                  {isLoadingReliability && (
                    <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded">
                      <div className="text-sm text-gray-600">{t('invoices.reliability.loading')}</div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="label">{t('invoices.modal.totalAmount')}</label>
                  <input 
                    type="number" 
                    name="total_amount"
                    value={formData.total_amount}
                    onChange={handleInputChange}
                    className="input" 
                    placeholder="0.00" 
                    step="0.01"
                    min="0"
                    required 
                  />
                </div>
                <div>
                  <label className="label">{t('invoices.modal.paidAmount')}</label>
                  <input 
                    type="number" 
                    name="paid_amount"
                    value={formData.paid_amount}
                    onChange={handleInputChange}
                    className="input" 
                    placeholder="0.00" 
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="label">{t('invoices.modal.status')}</label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="draft">{t('invoices.statuses.draft')}</option>
                    <option value="sent">{t('invoices.statuses.sent')}</option>
                    <option value="paid">{t('invoices.statuses.paid')}</option>
                    <option value="overdue">{t('invoices.statuses.overdue')}</option>
                  </select>
                </div>
                <div>
                  <label className="label">{t('invoices.modal.issueDate')}</label>
                  <input 
                    type="date" 
                    name="issue_date"
                    value={formData.issue_date}
                    onChange={handleInputChange}
                    className="input" 
                    required 
                  />
                </div>
                <div>
                  <label className="label">{t('invoices.modal.dueDate')}</label>
                  <input 
                    type="date" 
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleInputChange}
                    className="input" 
                    required 
                  />
                </div>
                <div>
                  <label className="label">{t('invoices.modal.paidDate')}</label>
                  <input 
                    type="date" 
                    name="paid_date"
                    value={formData.paid_date}
                    onChange={handleInputChange}
                    className="input" 
                  />
                </div>
              </div>
              
              <div>
                <label className="label">{t('invoices.modal.notes')}</label>
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="input" 
                  rows={3} 
                  placeholder={t('invoices.modal.notes')}
                ></textarea>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 space-y-2 sm:space-y-0">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
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
                  {submitting ? t('invoices.modal.creating') : t('invoices.modal.createInvoice')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;

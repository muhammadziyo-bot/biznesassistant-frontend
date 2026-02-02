import React, { useState, useEffect } from 'react';
// @ts-ignore
import { useQueryClient } from 'react-query';
import api from '../api/axios';
import { useTranslation } from '../hooks/useTranslation';
import { useKeyboardShortcuts, SHORTCUTS } from '../hooks/useKeyboardShortcuts';
import { useAutoSave } from '../hooks/useAutoSave';
import { useTemplates } from '../hooks/useTemplates';
import { useBulkOperations } from '../hooks/useBulkOperations';
import toast from 'react-hot-toast';
import AutoComplete from '../components/AutoComplete';
import DragDropUpload from '../components/DragDropUpload';
import { ImportExportManager, COMMON_MAPPINGS } from '../utils/importExport';

interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  vat_amount: number;
  tax_amount: number;
  created_at: string;
}

const Accounting: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [formData, setFormData] = useState<{
    type: 'income' | 'expense';
    amount: string;
    category: string;
    description: string;
    date: string;
    vat_included: boolean;
  }>({
    type: 'income',
    amount: '',
    category: 'sales',
    description: '',
    date: new Date().toISOString().split('T')[0],
    vat_included: true
  });
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Auto-save functionality
  const { forceSave } = useAutoSave({
    data: showAddForm ? formData : null,
    onSave: async (data) => {
      if (showAddForm && data.description && data.amount) {
        try {
          // Auto-save as draft
          await api.post('/api/drafts/', {
            draft_type: 'transaction',
            title: `Transaction Draft - ${data.description?.substring(0, 30)}...`,
            data: data,
            metadata: {
              form_type: 'transaction',
              auto_save: true
            }
          });
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    },
    enabled: showAddForm,
    debounceMs: 3000,
    showNotification: false
  });

  // Templates functionality
  const { templates, createTemplate, applyTemplate, showTemplateForm, setShowTemplateForm } = useTemplates('transaction');

  // Bulk operations
  const bulkOps = useBulkOperations(
    transactions,
    setTransactions,
    {
      delete: async (ids) => {
        await Promise.all(ids.map(id => api.delete(`/api/accounting/transactions/${id}`)));
      },
      update: async (ids, data) => {
        // Bulk update implementation
      },
      export: async (ids) => {
        const exportData = transactions.filter(t => ids.includes(t.id));
        // Create CSV content manually
        const csvHeaders = ['Date', 'Description', 'Amount', 'Type', 'Category', 'VAT Amount'];
        const csvContent = [
          csvHeaders.join(','),
          ...exportData.map(t => 
            `${t.date},${t.description},${t.amount},${t.type},${t.category},${t.vat_amount}`
          )
        ].join('\n');
        return new Blob([csvContent], { type: 'text/csv' });
      }
    }
  );

  // Keyboard shortcuts
  useKeyboardShortcuts({
    [SHORTCUTS.NEW]: () => setShowAddForm(true),
    [SHORTCUTS.SAVE]: () => {
      if (showAddForm) {
        handleSubmit(new Event('submit') as any);
      }
    },
    [SHORTCUTS.DELETE]: () => bulkOps.bulkDelete(),
    [SHORTCUTS.EXPORT]: () => bulkOps.bulkExport(),
    [SHORTCUTS.IMPORT]: () => setShowImport(true),
    [SHORTCUTS.SEARCH]: () => {
      const searchInput = document.getElementById('transaction-search') as HTMLInputElement;
      searchInput?.focus();
    }
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/api/accounting/transactions');
      setTransactions(response.data as Transaction[]);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString()
      };

      const response = await api.post('/api/accounting/transactions', transactionData);
      const newTransaction = response.data as Transaction;
      setTransactions([newTransaction, ...transactions]);
      
      // Invalidate KPI-related queries to refresh dashboard data
      queryClient.invalidateQueries(['kpis']);
      queryClient.invalidateQueries(['kpi-trend']);
      queryClient.invalidateQueries(['analytics-summary']);
      
      // Reset form
      setFormData({
        type: 'income',
        amount: '',
        category: 'sales',
        description: '',
        date: new Date().toISOString().split('T')[0],
        vat_included: true
      });
      setShowAddForm(false);
      
      // Show success message
      toast.success('Transaction created successfully!');
    } catch (error) {
      console.error('Failed to create transaction:', error);
      toast.error('Failed to create transaction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await api.delete(`/api/accounting/transactions/${id}`);
      setTransactions(transactions.filter(t => t.id !== id));
      
      // Invalidate KPI-related queries to refresh dashboard data
      queryClient.invalidateQueries(['kpis']);
      queryClient.invalidateQueries(['kpi-trend']);
      queryClient.invalidateQueries(['analytics-summary']);
      
      toast.success(t('accounting.messages.transactionDeleted'));
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      toast.error(t('accounting.messages.deleteFailed'));
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
          <h1 className="text-3xl font-bold text-gray-900">{t('accounting.title')}</h1>
          <p className="text-gray-600">{t('accounting.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary"
        >
          {t('common.add')} {t('accounting.transactions')}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card success">
          <h3 className="text-lg font-semibold text-gray-900">{t('accounting.income')}</h3>
          <p className="text-2xl font-bold text-green-600">
            {transactions
              .filter(t => t.type === 'income')
              .reduce((sum, t) => sum + (typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount || 0), 0)
              .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} UZS
          </p>
        </div>
        <div className="stat-card danger">
          <h3 className="text-lg font-semibold text-gray-900">{t('accounting.expense')}</h3>
          <p className="text-2xl font-bold text-red-600">
            {transactions
              .filter(t => t.type === 'expense')
              .reduce((sum, t) => sum + (typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount || 0), 0)
              .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} UZS
          </p>
        </div>
        <div className="stat-card primary">
          <h3 className="text-lg font-semibold text-gray-900">{t('accounting.netProfit')}</h3>
          <p className="text-2xl font-bold text-blue-600">
            {(() => {
              const income = transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + (typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount || 0), 0);
              const expense = transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + (typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount || 0), 0);
              const netProfit = income - expense;
              return netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            })()} UZS
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('accounting.transactions')}</h2>
        
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">{t('common.date')}</th>
                <th className="table-header-cell">{t('common.description')}</th>
                <th className="table-header-cell">{t('accounting.category')}</th>
                <th className="table-header-cell">{t('common.status')}</th>
                <th className="table-header-cell">{t('common.amount')}</th>
                <th className="table-header-cell">{t('accounting.vatAmount')}</th>
                <th className="table-header-cell">{t('common.edit')} / {t('common.delete')}</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="table-cell">
                    {transaction.date ? new Date(transaction.date).toLocaleDateString() : '-'}
                  </td>
                  <td className="table-cell">{transaction.description}</td>
                  <td className="table-cell">{transaction.category}</td>
                  <td className="table-cell">
                    <span className={`status-badge ${
                      transaction.type === 'income' ? 'status-paid' : 'status-draft'
                    }`}>
                      {transaction.type === 'income' ? t('accounting.income') : t('accounting.expense')}
                    </span>
                  </td>
                  <td className={`table-cell font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {(typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} UZS
                  </td>
                  <td className="table-cell">{(transaction.vat_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} UZS</td>
                  <td className="table-cell">
                    <button className="text-blue-600 hover:text-blue-800 mr-2">
                      {t('common.edit')}
                    </button>
                    <button 
                      onClick={() => handleDelete(transaction.id)}
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
          {transactions.map((transaction) => (
            <div key={transaction.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <span className="text-lg">
                      {transaction.type === 'income' ? '💰' : '💸'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {(typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} UZS
                  </p>
                  <p className="text-xs text-gray-500">
                    {transaction.date ? new Date(transaction.date).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  transaction.type === 'income' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {transaction.type === 'income' ? t('accounting.income') : t('accounting.expense')}
                </span>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    VAT: {(transaction.vat_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} UZS
                  </span>
                  <div className="flex space-x-1">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(transaction.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {transactions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {t('accounting.noTransactions')}
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('accounting.modal.title')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">{t('accounting.modal.type')}</label>
                <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleInputChange}
                  className="input"
                >
                  <option value="income">{t('accounting.income')}</option>
                  <option value="expense">{t('accounting.expense')}</option>
                </select>
              </div>
              <div>
                <label className="label">{t('accounting.modal.amount')}</label>
                <input 
                  type="number" 
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="input" 
                  placeholder="0.00" 
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="label">{t('accounting.category')}</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleInputChange}
                  className="input"
                >
                  {formData.type === 'income' ? (
                    <>
                      <option value="sales">{t('accounting.categories.income.sales')}</option>
                      <option value="services">{t('accounting.categories.income.services')}</option>
                      <option value="investment">{t('accounting.categories.income.investment')}</option>
                      <option value="other_income">{t('accounting.categories.income.other_income')}</option>
                    </>
                  ) : (
                    <>
                      <option value="salaries">{t('accounting.categories.expense.salaries')}</option>
                      <option value="rent">{t('accounting.categories.expense.rent')}</option>
                      <option value="utilities">{t('accounting.categories.expense.utilities')}</option>
                      <option value="marketing">{t('accounting.categories.expense.marketing')}</option>
                      <option value="supplies">{t('accounting.categories.expense.supplies')}</option>
                      <option value="taxes">{t('accounting.categories.expense.taxes')}</option>
                      <option value="other_expense">{t('accounting.categories.expense.other_expense')}</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="label">{t('accounting.modal.description')}</label>
                <input 
                  type="text" 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input" 
                  placeholder="Enter description" 
                  required
                />
              </div>
              <div>
                <label className="label">{t('accounting.modal.date')}</label>
                <input 
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="input" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('accounting.modal.vatIncluded')}
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    name="vat_included"
                    checked={formData.vat_included}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  VAT Included
                </label>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 space-y-2 sm:space-y-0">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
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
                  {submitting ? t('accounting.creating') : t('accounting.addTransaction')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounting;

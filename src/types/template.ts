export interface Template {
  id: number;
  name: string;
  type: 'transaction' | 'invoice';
  description?: string;
  is_recurring: boolean;
  recurring_interval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurring_day?: number;
  data: any; // Transaction or Invoice data
  created_by: number;
  tenant_id: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateFormData {
  name: string;
  type: 'transaction' | 'invoice';
  description?: string;
  is_recurring: boolean;
  recurring_interval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurring_day?: number;
  data: any;
}

export interface RecurringSchedule {
  id: number;
  template_id: number;
  next_date: string;
  last_executed?: string;
  is_active: boolean;
  created_at: string;
}

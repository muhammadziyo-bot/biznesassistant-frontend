import toast from 'react-hot-toast';

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export class ImportExportManager {
  // Export data to CSV
  static exportToCSV<T extends Record<string, any>>(
    data: T[],
    filename: string,
    headers?: string[]
  ): void {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const csvHeaders = headers || Object.keys(data[0]);
    const csvContent = [
      csvHeaders.join(','),
      ...data.map(item => 
        csvHeaders.map(header => {
          const value = item[header];
          // Handle values that contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${data.length} records`);
  }

  // Import data from CSV
  static async importFromCSV<T>(
    file: File,
    mapping: Record<string, keyof T>,
    validator: (item: Partial<T>) => string | null
  ): Promise<ImportResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            toast.error('CSV file is empty or invalid');
            resolve({ success: 0, failed: 0, errors: ['Empty or invalid CSV'] });
            return;
          }

          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const data: T[] = [];
          const errors: string[] = [];
          let successCount = 0;
          let failedCount = 0;

          for (let i = 1; i < lines.length; i++) {
            try {
              const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
              const item: any = {};
              
              // Map CSV columns to object properties
              headers.forEach((header, index) => {
                const mappedKey = mapping[header];
                if (mappedKey) {
                  item[mappedKey as string] = values[index] || '';
                }
              });

              // Validate the item
              const validationError = validator(item);
              if (validationError) {
                errors.push(`Row ${i + 1}: ${validationError}`);
                failedCount++;
              } else {
                data.push(item as T);
                successCount++;
              }
            } catch (error) {
              errors.push(`Row ${i + 1}: Invalid data format`);
              failedCount++;
            }
          }

          toast.success(`Imported ${successCount} records`);
          if (failedCount > 0) {
            toast.error(`${failedCount} records failed to import`);
          }

          resolve({
            success: successCount,
            failed: failedCount,
            errors
          });
        } catch (error) {
          toast.error('Failed to parse CSV file');
          resolve({ success: 0, failed: 0, errors: ['Failed to parse CSV'] });
        }
      };

      reader.onerror = () => {
        toast.error('Failed to read file');
        resolve({ success: 0, failed: 0, errors: ['Failed to read file'] });
      };

      reader.readAsText(file);
    });
  }

  // Export to JSON
  static exportToJSON<T>(data: T[], filename: string): void {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${data.length} records to JSON`);
  }

  // Import from JSON
  static async importFromJSON<T>(
    file: File,
    validator: (item: any) => string | null
  ): Promise<ImportResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const jsonContent = e.target?.result as string;
          const data = JSON.parse(jsonContent);
          
          if (!Array.isArray(data)) {
            toast.error('JSON file must contain an array');
            resolve({ success: 0, failed: 0, errors: ['JSON must be an array'] });
            return;
          }

          const validData: T[] = [];
          const errors: string[] = [];
          let successCount = 0;
          let failedCount = 0;

          data.forEach((item, index) => {
            const validationError = validator(item);
            if (validationError) {
              errors.push(`Item ${index + 1}: ${validationError}`);
              failedCount++;
            } else {
              validData.push(item as T);
              successCount++;
            }
          });

          toast.success(`Imported ${successCount} records`);
          if (failedCount > 0) {
            toast.error(`${failedCount} records failed to import`);
          }

          resolve({
            success: successCount,
            failed: failedCount,
            errors
          });
        } catch (error) {
          toast.error('Failed to parse JSON file');
          resolve({ success: 0, failed: 0, errors: ['Failed to parse JSON'] });
        }
      };

      reader.onerror = () => {
        toast.error('Failed to read file');
        resolve({ success: 0, failed: 0, errors: ['Failed to read file'] });
      };

      reader.readAsText(file);
    });
  }
}

// Common field mappings for different data types
export const COMMON_MAPPINGS = {
  transaction: {
    'Date': 'date',
    'Description': 'description',
    'Amount': 'amount',
    'Type': 'type',
    'Category': 'category',
    'VAT Included': 'vat_included'
  },
  contact: {
    'Name': 'name',
    'Email': 'email',
    'Phone': 'phone',
    'Company': 'company_name',
    'Type': 'type'
  },
  invoice: {
    'Invoice Number': 'invoice_number',
    'Customer': 'customer_name',
    'Amount': 'total_amount',
    'Paid Amount': 'paid_amount',
    'Issue Date': 'issue_date',
    'Due Date': 'due_date',
    'Status': 'status'
  }
};

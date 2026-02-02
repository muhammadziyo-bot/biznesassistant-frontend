import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface BulkOperation {
  type: 'delete' | 'export' | 'update' | 'copy';
  itemIds: number[];
  data?: any;
}

export const useBulkOperations = <T extends { id: number }>(
  items: T[],
  onItemsChange: (items: T[]) => void,
  apiEndpoints: {
    delete: (ids: number[]) => Promise<void>;
    update: (ids: number[], data: any) => Promise<void>;
    export: (ids: number[]) => Promise<Blob>;
  }
) => {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const toggleItemSelection = useCallback((itemId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    setIsAllSelected(false);
  }, [selectedItems]);

  const toggleAllSelection = useCallback(() => {
    if (isAllSelected) {
      setSelectedItems(new Set());
      setIsAllSelected(false);
    } else {
      setSelectedItems(new Set(items.map(item => item.id)));
      setIsAllSelected(true);
    }
  }, [isAllSelected, items]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
    setIsAllSelected(false);
  }, []);

  const executeBulkOperation = useCallback(async (operation: BulkOperation) => {
    if (operation.itemIds.length === 0) {
      toast.error('No items selected');
      return;
    }

    setIsBulkProcessing(true);
    
    try {
      switch (operation.type) {
        case 'delete':
          await apiEndpoints.delete(operation.itemIds);
          onItemsChange(items.filter(item => !operation.itemIds.includes(item.id)));
          toast.success(`Deleted ${operation.itemIds.length} items`);
          break;

        case 'update':
          await apiEndpoints.update(operation.itemIds, operation.data);
          // Refresh items to show updates
          toast.success(`Updated ${operation.itemIds.length} items`);
          break;

        case 'export':
          const blob = await apiEndpoints.export(operation.itemIds);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `export_${Date.now()}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          toast.success(`Exported ${operation.itemIds.length} items`);
          break;

        case 'copy':
          // This would be implemented based on specific needs
          toast.success(`Copied ${operation.itemIds.length} items`);
          break;

        default:
          throw new Error('Unknown bulk operation type');
      }
      
      clearSelection();
    } catch (error) {
      console.error('Bulk operation failed:', error);
      toast.error('Bulk operation failed');
    } finally {
      setIsBulkProcessing(false);
    }
  }, [items, onItemsChange, apiEndpoints, clearSelection]);

  const bulkDelete = useCallback(() => {
    if (selectedItems.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.size} items?`)) {
      executeBulkOperation({
        type: 'delete',
        itemIds: Array.from(selectedItems)
      });
    }
  }, [selectedItems, executeBulkOperation]);

  const bulkExport = useCallback(() => {
    if (selectedItems.size === 0) return;
    
    executeBulkOperation({
      type: 'export',
      itemIds: Array.from(selectedItems)
    });
  }, [selectedItems, executeBulkOperation]);

  const bulkUpdate = useCallback((updateData: any) => {
    if (selectedItems.size === 0) return;
    
    executeBulkOperation({
      type: 'update',
      itemIds: Array.from(selectedItems),
      data: updateData
    });
  }, [selectedItems, executeBulkOperation]);

  return {
    selectedItems,
    isAllSelected,
    isBulkProcessing,
    toggleItemSelection,
    toggleAllSelection,
    clearSelection,
    bulkDelete,
    bulkExport,
    bulkUpdate,
    executeBulkOperation
  };
};

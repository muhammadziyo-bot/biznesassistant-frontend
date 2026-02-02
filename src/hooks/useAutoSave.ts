import { useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from '../hooks/useTranslation';

interface AutoSaveConfig {
  data: any;
  onSave: (data: any) => Promise<void>;
  enabled?: boolean;
  debounceMs?: number;
  showNotification?: boolean;
}

export const useAutoSave = ({
  data,
  onSave,
  enabled = true,
  debounceMs = 2000,
  showNotification = true
}: AutoSaveConfig) => {
  const { t } = useTranslation();
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastSavedRef = useRef<any>(null);
  const isSavingRef = useRef(false);

  const saveData = useCallback(async (dataToSave: any) => {
    if (isSavingRef.current) return;
    
    isSavingRef.current = true;
    
    try {
      await onSave(dataToSave);
      lastSavedRef.current = dataToSave;
      if (showNotification) {
        toast.success(t('autoSave.autoSaved'));
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      if (showNotification) {
        toast.error(t('autoSave.autoSaveFailed'));
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave, showNotification]);

  const triggerAutoSave = useCallback(() => {
    if (!enabled) return;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Check if data actually changed
    if (JSON.stringify(data) === JSON.stringify(lastSavedRef.current)) {
      return;
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      saveData(data);
    }, debounceMs);
  }, [data, saveData, enabled, debounceMs]);

  useEffect(() => {
    triggerAutoSave();
  }, [triggerAutoSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    saveData(data);
  }, [data, saveData]);

  return {
    forceSave,
    isSaving: isSavingRef.current,
    lastSaved: lastSavedRef.current
  };
};

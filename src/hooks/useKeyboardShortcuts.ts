import { useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

interface ShortcutConfig {
  [key: string]: () => void;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig, enabled: boolean = true) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const key = [];
    if (event.ctrlKey) key.push('ctrl');
    if (event.altKey) key.push('alt');
    if (event.shiftKey) key.push('shift');
    
    // Add null check for event.key
    if (event.key) {
      key.push(event.key.toLowerCase());
    } else {
      return; // Skip if no key
    }

    const shortcut = key.join('+');
    
    if (shortcuts[shortcut]) {
      event.preventDefault();
      shortcuts[shortcut]();
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Common shortcut combinations
export const SHORTCUTS = {
  NEW: 'ctrl+n',
  SAVE: 'ctrl+s',
  EDIT: 'ctrl+e',
  DELETE: 'ctrl+d',
  SEARCH: 'ctrl+f',
  REFRESH: 'ctrl+r',
  EXPORT: 'ctrl+e',
  IMPORT: 'ctrl+i',
  BULK_SELECT: 'ctrl+a',
  COPY: 'ctrl+c',
  PASTE: 'ctrl+v',
  UNDO: 'ctrl+z',
  REDO: 'ctrl+y',
};

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface AutoCompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: any) => void;
  suggestions: any[];
  placeholder?: string;
  displayField?: string;
  valueField?: string;
  className?: string;
  disabled?: boolean;
  minChars?: number;
  maxSuggestions?: number;
}

const AutoComplete: React.FC<AutoCompleteProps> = ({
  value,
  onChange,
  onSelect,
  suggestions,
  placeholder = '',
  displayField = 'name',
  valueField = 'id',
  className = '',
  disabled = false,
  minChars = 2,
  maxSuggestions = 10
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (value.length >= minChars) {
      const filtered = suggestions
        .filter(item => {
          const displayValue = item[displayField];
          return displayValue && typeof displayValue === 'string' && 
                 displayValue.toLowerCase().includes(value.toLowerCase());
        })
        .slice(0, maxSuggestions);
      
      setFilteredSuggestions(filtered);
      setIsOpen(filtered.length > 0);
      setHighlightedIndex(-1);
    } else {
      setFilteredSuggestions([]);
      setIsOpen(false);
    }
  }, [value, suggestions, displayField, minChars, maxSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleKeyDown = (e: any) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = highlightedIndex < filteredSuggestions.length - 1 ? highlightedIndex + 1 : 0;
        setHighlightedIndex(nextIndex);
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = highlightedIndex > 0 ? highlightedIndex - 1 : filteredSuggestions.length - 1;
        setHighlightedIndex(prevIndex);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          selectItem(filteredSuggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const selectItem = (item: any) => {
    onChange(item[displayField]);
    onSelect(item);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleBlur = () => {
    // Delay closing to allow click events on suggestions
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 200);
  };

  const handleFocus = () => {
    if (value.length >= minChars) {
      setIsOpen(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      
      {isOpen && filteredSuggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {filteredSuggestions.map((item, index) => (
            <li
              key={item[valueField]}
              className={`px-3 py-2 cursor-pointer transition-colors ${
                index === highlightedIndex
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => selectItem(item)}
            >
              <div className="font-medium">{item[displayField] || 'Unknown'}</div>
              {item.email && (
                <div className="text-sm text-gray-500">{item.email}</div>
              )}
              {item.phone && (
                <div className="text-sm text-gray-500">{item.phone}</div>
              )}
              {item.company_name && (
                <div className="text-sm text-gray-500">{item.company_name}</div>
              )}
            </li>
          ))}
        </ul>
      )}
      
      {value.length >= minChars && filteredSuggestions.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg px-3 py-2 text-gray-500">
          {t('autoComplete.noResults')}
        </div>
      )}
    </div>
  );
};

export default AutoComplete;

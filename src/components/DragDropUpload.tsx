import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface DragDropUploadProps {
  onFilesDrop: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

function DragDropUpload({
  onFilesDrop,
  accept = '*/*',
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  className = '',
  disabled = false,
  children
}: DragDropUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((files: FileList): File[] => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      // Check file size
      if (file.size > maxSize) {
        errors.push(`${file.name} is too large (max ${Math.round(maxSize / 1024 / 1024)}MB)`);
        return;
      }

      // Check file type if accept is specified
      if (accept !== '*/*') {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const isAccepted = acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          return file.type.match(type.replace('*', '.*'));
        });

        if (!isAccepted) {
          errors.push(`${file.name} is not a supported file type`);
          return;
        }
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      // Show error toast
      console.error('File validation errors:', errors);
    }

    return validFiles;
  }, [accept, maxSize]);

  const handleDragOver = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragEnter = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDrop = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    const validFiles = validateFiles(files);

    if (validFiles.length > 0) {
      onFilesDrop(validFiles);
    }
  }, [disabled, validateFiles, onFilesDrop]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validFiles = validateFiles(files);
      if (validFiles.length > 0) {
        onFilesDrop(validFiles);
      }
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [validateFiles, onFilesDrop]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getClassName = () => {
    return [
      'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
      isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50',
      className
    ].join(' ');
  };

  return (
    <div
      className={getClassName()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDragEnter={handleDragEnter}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        
        {children ? children : (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 text-gray-400">
                <svg
                  className="w-full h-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              
              <div className="text-gray-600">
                <p className="font-medium">
                  {isDragging ? t('dragDrop.dropHere') : t('dragDrop.dragFilesHere')}
                </p>
                <p className="text-sm mt-1">
                  {t('dragDrop.or')}{' '}
                  <span className="text-blue-600 hover:text-blue-700 underline">
                    {t('dragDrop.browse')}
                  </span>
                </p>
              </div>
              
              <div className="text-xs text-gray-500">
                {multiple ? t('dragDrop.multipleFiles') : t('dragDrop.singleFile')}
                <br />
                {t('dragDrop.maxSize')}: {formatFileSize(maxSize)}
              </div>
            </div>
          )}
      </>
    </div>
  );
}

export default DragDropUpload;

// ----------------------------------------------------------------------------
//  File:        file-upload.tsx
//  Project:     Celaya Solutions (C-Suite Dashboard)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: File upload component for tool calling interface
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (May 2025)
// ----------------------------------------------------------------------------

"use client"

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  onFileSelect: (files: File[]) => void;
  maxSize?: number; // in bytes
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  accept = "*/*",
  multiple = false,
  onFileSelect,
  maxSize = 10 * 1024 * 1024, // 10MB default
  disabled = false,
  className = ""
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`);
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
    onFileSelect(validFiles);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={disabled ? undefined : openFileDialog}
      >
        <div className="space-y-2">
          <div className="text-3xl">📁</div>
          <div className="text-sm text-gray-600">
            {dragActive ? (
              <span className="text-blue-600 font-medium">Drop files here...</span>
            ) : (
              <>
                <span className="font-medium">Click to upload</span> or drag and drop
              </>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Max size: {Math.round(maxSize / 1024 / 1024)}MB
            {accept !== "*/*" && ` • Accepted: ${accept}`}
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Selected Files Display */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Selected Files:</div>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className="text-lg">
                    {file.type.startsWith('image/') ? '🖼️' : 
                     file.type.includes('pdf') ? '📄' : 
                     file.type.includes('text') ? '📝' : '📎'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{file.name}</div>
                    <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="ml-2 h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUpload; 
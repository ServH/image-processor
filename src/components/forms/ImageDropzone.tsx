"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

export interface FileWithPreview extends File {
  preview: string;
}

interface ImageDropzoneProps {
  onImageSelect: (file: File) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
}

export function ImageDropzone({
  onImageSelect,
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxFileSize = 5 * 1024 * 1024, // 5MB default
}: ImageDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Clear the selected file and error when component unmounts
  React.useEffect(() => {
    return () => {
      if (selectedFile) {
        URL.revokeObjectURL(selectedFile.preview);
      }
    };
  }, [selectedFile]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      
      if (acceptedFiles.length === 0) {
        return;
      }
      
      const file = acceptedFiles[0];
      
      // Validate file type
      if (!acceptedFileTypes.includes(file.type)) {
        setError(`Tipo de archivo no soportado. Por favor, utiliza: ${acceptedFileTypes.join(', ')}`);
        return;
      }
      
      // Validate file size
      if (file.size > maxFileSize) {
        setError(`El archivo es demasiado grande. El tamaño máximo es ${Math.round(maxFileSize / (1024 * 1024))}MB`);
        return;
      }
      
      // Create preview
      const fileWithPreview = Object.assign(file, {
        preview: URL.createObjectURL(file),
      }) as FileWithPreview;
      
      setSelectedFile(fileWithPreview);
      onImageSelect(file);
    },
    [acceptedFileTypes, maxFileSize, onImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    multiple: false,
  });

  const handleReset = () => {
    if (selectedFile) {
      URL.revokeObjectURL(selectedFile.preview);
    }
    setSelectedFile(null);
    setError(null);
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 cursor-pointer text-center transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-3">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-full h-full"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Haz clic para seleccionar</span> o arrastra y suelta
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF hasta {Math.round(maxFileSize / (1024 * 1024))}MB
            </p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-gray-200">
          {/* Corregimos el problema de altura estableciendo dimensiones fijas */}
          <div className="relative w-full" style={{ height: '240px' }}>
            <Image
              src={selectedFile.preview}
              alt="Vista previa"
              className="object-contain"
              fill
              sizes="(max-width: 640px) 100vw, 640px"
            />
          </div>
          <div className="absolute top-2 right-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleReset}
              aria-label="Eliminar imagen"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </Button>
          </div>
          <div className="p-3 bg-gray-50 text-sm text-gray-700">
            <p className="truncate font-medium">{selectedFile.name}</p>
            <p className="text-gray-500 text-xs">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
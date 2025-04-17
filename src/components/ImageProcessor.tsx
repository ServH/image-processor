"use client";

import React, { useState } from 'react';
import { ImageDropzone } from '@/components/forms/ImageDropzone';
import { ResizeForm } from '@/components/forms/ResizeForm';
import { RescaleForm } from '@/components/forms/RescaleForm';
import { ImageComparison } from '@/components/ImageComparasion';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Operation, ResizeOperation, RescaleOperation } from '@/lib/validators/image-operations';

type OperationType = 'resize' | 'rescale';

interface ProcessedImage {
  url: string;
  originalUrl: string;
  originalSize: number;
  processedSize: number;
  dimensions: [number, number];
  processingTime?: number;
  operation: OperationType;
  operationDetails: Record<string, any>;
}

// Exportación por defecto en lugar de exportación nombrada
export default function ImageProcessor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeOperation, setActiveOperation] = useState<OperationType>('resize');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null);

  // Handle image selection
  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    setProcessedImage(null);
    setError(null);
  };

  // Handle operation type change
  const handleOperationChange = (operation: OperationType) => {
    setActiveOperation(operation);
    setError(null);
  };

  // Process image with selected operation
  const processImage = async (operationData: ResizeOperation | RescaleOperation) => {
    if (!selectedFile) {
      setError('Por favor, selecciona una imagen primero');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create temporary URL for the original image
      const originalUrl = URL.createObjectURL(selectedFile);

      // Create form data for API request
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('operation', operationData.operation);

      // Add operation-specific parameters
      if (operationData.operation === 'resize') {
        const { width, height, keepAspectRatio } = operationData;
        formData.append('width', width.toString());
        formData.append('height', height.toString());
        formData.append('keepAspectRatio', keepAspectRatio.toString());
      } else if (operationData.operation === 'rescale') {
        const { scaleFactor } = operationData;
        formData.append('scaleFactor', scaleFactor.toString());
      }

      // Send request to API
      console.log('Enviando solicitud a la API...');
      const response = await fetch('/api/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error de API:', errorData);
        throw new Error(errorData.message || 'Error al procesar la imagen');
      }

      const result = await response.json();
      console.log('Respuesta de la API:', result);

      if (!result.success) {
        throw new Error(result.message || 'Error al procesar la imagen');
      }

      // Set processed image data
      setProcessedImage({
        url: result.url,
        originalUrl: originalUrl,
        originalSize: result.originalSize,
        processedSize: result.processedSize,
        dimensions: result.dimensions,
        processingTime: result.processingTime,
        operation: operationData.operation,
        operationDetails: operationData.operation === 'resize' 
          ? { 
              width: (operationData as ResizeOperation).width, 
              height: (operationData as ResizeOperation).height, 
              keepAspectRatio: (operationData as ResizeOperation).keepAspectRatio 
            }
          : { 
              scaleFactor: (operationData as RescaleOperation).scaleFactor 
            }
      });
    } catch (err) {
      console.error('Error al procesar imagen:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al procesar la imagen');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle resize form submission
  const handleResizeSubmit = (data: ResizeOperation) => {
    processImage(data);
  };

  // Handle rescale form submission
  const handleRescaleSubmit = (data: RescaleOperation) => {
    processImage(data);
  };

  // Reset the current operation
  const handleReset = () => {
    if (processedImage && processedImage.originalUrl) {
      URL.revokeObjectURL(processedImage.originalUrl);
    }
    setProcessedImage(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Imagen Original</CardTitle>
            <CardDescription>
              Sube la imagen que deseas procesar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageDropzone onImageSelect={handleImageSelect} />
          </CardContent>
        </Card>

        {/* Operations Section */}
        <Card>
          <CardHeader>
            <CardTitle>Operaciones</CardTitle>
            <CardDescription>
              Selecciona la operación a realizar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Operation Selector */}
              <div className="flex space-x-2 mb-4">
                <Button
                  type="button"
                  variant={activeOperation === 'resize' ? 'default' : 'outline'}
                  onClick={() => handleOperationChange('resize')}
                  disabled={isProcessing || !selectedFile}
                  className="flex-1"
                >
                  Redimensionar
                </Button>
                <Button
                  type="button"
                  variant={activeOperation === 'rescale' ? 'default' : 'outline'}
                  onClick={() => handleOperationChange('rescale')}
                  disabled={isProcessing || !selectedFile}
                  className="flex-1"
                >
                  Reescalar
                </Button>
              </div>

              {/* Active Operation Form */}
              {selectedFile ? (
                <>
                  {activeOperation === 'resize' ? (
                    <ResizeForm onSubmit={handleResizeSubmit} isProcessing={isProcessing} />
                  ) : (
                    <RescaleForm onSubmit={handleRescaleSubmit} isProcessing={isProcessing} />
                  )}
                </>
              ) : (
                <p className="text-center text-gray-500 py-6">
                  Sube una imagen para comenzar
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Results Section */}
      {processedImage && (
        <div className="mt-6">
          <ImageComparison
            originalUrl={processedImage.originalUrl}
            processedUrl={processedImage.url}
            originalSize={processedImage.originalSize}
            processedSize={processedImage.processedSize}
            dimensions={processedImage.dimensions}
            processingTime={processedImage.processingTime}
            operation={processedImage.operation}
            operationDetails={processedImage.operationDetails}
          />
          
          <div className="mt-4 flex justify-end">
            <Button 
              type="button"
              variant="outline"
              onClick={handleReset}
              className="ml-auto"
            >
              Procesar otra imagen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
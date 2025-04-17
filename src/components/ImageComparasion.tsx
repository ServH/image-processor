"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

interface ImageComparisonProps {
  originalUrl: string;
  processedUrl: string;
  originalSize: number;
  processedSize: number;
  dimensions: [number, number];
  processingTime?: number;
  operation: 'resize' | 'rescale';
  operationDetails: Record<string, any>;
}

export function ImageComparison({
  originalUrl,
  processedUrl,
  originalSize,
  processedSize,
  dimensions,
  processingTime = 0,
  operation,
  operationDetails
}: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50); // Posición inicial en el medio
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Calcular el porcentaje de reducción de tamaño
  const sizeReduction = processedSize < originalSize
    ? ((originalSize - processedSize) / originalSize) * 100
    : 0;

  // Gestionar el movimiento del slider
  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const relativeX = e.clientX - containerRect.left;
    
    // Limitar la posición al rango 0-100%
    const newPosition = Math.max(0, Math.min(100, (relativeX / containerWidth) * 100));
    setSliderPosition(newPosition);
  };

  // Gestionar eventos táctiles
  const handleTouchMove = (e: React.TouchEvent | TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const touch = e.touches[0];
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const relativeX = touch.clientX - containerRect.left;
    
    const newPosition = Math.max(0, Math.min(100, (relativeX / containerWidth) * 100));
    setSliderPosition(newPosition);
  };

  // Configurar y limpiar listeners globales para movimiento y finalización
  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleTouchEnd = () => setIsDragging(false);
    
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove as any);
      window.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove as any);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  // Determinar el texto de la operación
  const getOperationText = () => {
    if (operation === 'resize') {
      return `Redimensionado a ${dimensions[0]}×${dimensions[1]}px${
        operationDetails.keepAspectRatio ? ' (manteniendo proporción)' : ''
      }`;
    } else {
      return `Reescalado por factor ${operationDetails.scaleFactor.toFixed(2)}x`;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Resultado del Procesamiento</CardTitle>
        <CardDescription>{getOperationText()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Comparador de imágenes */}
          <div
            ref={containerRef}
            className="relative rounded-lg overflow-hidden border border-gray-200 cursor-col-resize h-64 md:h-80"
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
          >
            {/* Imagen procesada (fondo) */}
            <div className="absolute inset-0 w-full h-full">
              <Image
                src={processedUrl}
                alt="Imagen procesada"
                className="object-contain"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            
            {/* Imagen original (primer plano, recortada por slider) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <Image
                src={originalUrl}
                alt="Imagen original"
                className="object-contain"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            
            {/* Línea divisoria deslizable */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white border-l border-r border-blue-500 cursor-col-resize"
              style={{ left: `${sliderPosition}%`, marginLeft: '-1px' }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-md flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </div>
            </div>
            
            {/* Etiquetas */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              Original
            </div>
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              Procesada
            </div>
            
            {/* Instrucción */}
            <div className="absolute bottom-2 left-0 right-0 text-center">
              <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                Desliza para comparar
              </span>
            </div>
          </div>
          
          {/* Información del procesamiento */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-gray-500">Dimensiones:</div>
              <div>{dimensions[0]} × {dimensions[1]} px</div>
              
              <div className="text-gray-500">Tamaño original:</div>
              <div>{(originalSize / 1024).toFixed(2)} KB</div>
              
              <div className="text-gray-500">Tamaño procesado:</div>
              <div>{(processedSize / 1024).toFixed(2)} KB</div>
              
              <div className="text-gray-500">Reducción:</div>
              <div>
                {sizeReduction > 0 
                  ? <span className="text-green-600">{sizeReduction.toFixed(2)}%</span> 
                  : <span className="text-gray-600">Sin reducción</span>}
              </div>
              
              {processingTime > 0 && (
                <>
                  <div className="text-gray-500">Tiempo de procesamiento:</div>
                  <div>{processingTime} ms</div>
                </>
              )}
              
              <div className="text-gray-500">Operación:</div>
              <div>{operation === 'resize' ? 'Redimensionar' : 'Reescalar'}</div>
              
              {operation === 'resize' && (
                <>
                  <div className="text-gray-500">Mantener proporción:</div>
                  <div>{operationDetails.keepAspectRatio ? 'Sí' : 'No'}</div>
                </>
              )}
              
              {operation === 'rescale' && (
                <>
                  <div className="text-gray-500">Factor de escala:</div>
                  <div>{operationDetails.scaleFactor.toFixed(2)}x</div>
                </>
              )}
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Acciones</h4>
              <div className="flex space-x-2">
                <a
                  href={processedUrl}
                  download
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm inline-flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Descargar
                </a>
                <a
                  href={processedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm inline-flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  Ver original
                </a>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
"use client";

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResizeOperation } from '@/lib/validators/image-operations';
import { Button } from '@/components/ui/Button';
import { z } from 'zod';

// Esquema de validación específico para este formulario
const formSchema = z.object({
  operation: z.literal('resize'),
  width: z.number()
    .int()
    .positive()
    .max(10000, 'El ancho máximo permitido es 10000px'),
  height: z.number()
    .int()
    .positive()
    .max(10000, 'El alto máximo permitido es 10000px'),
  keepAspectRatio: z.boolean(),
});

// Tipo inferido del esquema del formulario
type FormValues = z.infer<typeof formSchema>;

interface ResizeFormProps {
  onSubmit: (data: ResizeOperation) => void;
  isProcessing: boolean;
}

export function ResizeForm({ onSubmit, isProcessing }: ResizeFormProps) {
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operation: 'resize',
      width: 800,
      height: 600,
      keepAspectRatio: true,
    },
  });

  // Crear handler tipado para el envío del formulario
  const onFormSubmit: SubmitHandler<FormValues> = (data) => {
    onSubmit(data);
  };

  // Track aspect ratio if needed
  const width = watch('width');
  const height = watch('height');
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  // Set initial aspect ratio when both dimensions are available
  React.useEffect(() => {
    if (width && height && aspectRatio === null) {
      setAspectRatio(width / height);
    }
  }, [width, height, aspectRatio]);

  // Update height when width changes if aspect ratio is locked
  React.useEffect(() => {
    if (keepAspectRatio && aspectRatio && width) {
      const calculatedHeight = Math.round(width / aspectRatio);
      setValue('height', calculatedHeight);
    }
  }, [width, keepAspectRatio, aspectRatio, setValue]);

  // Toggle aspect ratio lock
  const handleAspectRatioToggle = () => {
    // Update the aspect ratio before toggling if it's currently unlocked
    if (!keepAspectRatio && width && height) {
      setAspectRatio(width / height);
    }
    setKeepAspectRatio(!keepAspectRatio);
    setValue('keepAspectRatio', !keepAspectRatio);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Dimensiones
        </label>
        
        <div className="flex items-center space-x-2">
          <div className="w-full">
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                {...register('width', { valueAsNumber: true })}
                className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Ancho"
                min={1}
                max={10000}
                disabled={isProcessing}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 sm:text-sm">px</span>
              </div>
            </div>
            {errors.width && (
              <p className="mt-1 text-sm text-red-600">{errors.width.message}</p>
            )}
          </div>
          
          <span className="text-gray-500">×</span>
          
          <div className="w-full">
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                {...register('height', { valueAsNumber: true })}
                className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Alto"
                min={1}
                max={10000}
                disabled={isProcessing || keepAspectRatio}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 sm:text-sm">px</span>
              </div>
            </div>
            {errors.height && (
              <p className="mt-1 text-sm text-red-600">{errors.height.message}</p>
            )}
          </div>
          
          <button
            type="button"
            onClick={handleAspectRatioToggle}
            className={`p-2 rounded-md ${
              keepAspectRatio 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600'
            }`}
            title={keepAspectRatio ? 'Desbloquear relación de aspecto' : 'Bloquear relación de aspecto'}
            disabled={isProcessing}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-5 h-5"
            >
              {keepAspectRatio ? (
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              ) : (
                <path d="M18.36 6.64A9 9 0 0 1 20.77 15M5.64 18.36A9 9 0 0 1 3.23 9m12.13-3.64A9 9 0 0 0 9 3.23M18.36 18.36A9 9 0 0 1 9 20.77" />
              )}
            </svg>
          </button>
        </div>
      </div>
            
      <div className="pt-2">
        <Button 
          type="submit" 
          isLoading={isProcessing}
          disabled={isProcessing}
          className="w-full"
        >
          Redimensionar Imagen
        </Button>
      </div>
    </form>
  );
}
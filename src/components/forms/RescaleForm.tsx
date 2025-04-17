"use client";

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RescaleOperation } from '@/lib/validators/image-operations';
import { Button } from '@/components/ui/Button';
import { z } from 'zod';

// Esquema de validación específico para este formulario
const formSchema = z.object({
  operation: z.literal('rescale'),
  scaleFactor: z.number()
    .positive()
    .min(0.1, 'El factor de escala mínimo es 0.1')
    .max(10, 'El factor de escala máximo es 10'),
});

// Tipo inferido del esquema del formulario
type FormValues = z.infer<typeof formSchema>;

interface RescaleFormProps {
  onSubmit: (data: RescaleOperation) => void;
  isProcessing: boolean;
}

export function RescaleForm({ onSubmit, isProcessing }: RescaleFormProps) {
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operation: 'rescale',
      scaleFactor: 1.5,
    },
  });

  // Crear handler tipado para el envío del formulario
  const onFormSubmit: SubmitHandler<FormValues> = (data) => {
    onSubmit(data);
  };

  const scaleFactor = watch('scaleFactor');

  // Calculate percentage for display
  const percentage = React.useMemo(() => {
    return Math.round(scaleFactor * 100);
  }, [scaleFactor]);

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Factor de Escala ({percentage}%)
          </label>
          <span className="text-sm text-gray-500">
            {scaleFactor < 1 ? 'Reducir' : 'Ampliar'}
          </span>
        </div>
        
        <div className="relative pt-1">
          <input
            type="range"
            {...register('scaleFactor', { valueAsNumber: true })}
            min={0.1}
            max={10}
            step={0.1}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-100"
            disabled={isProcessing}
          />
          
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>10%</span>
            <span>100%</span>
            <span>1000%</span>
          </div>
        </div>
        
        <div className="mt-2">
          <div className="relative rounded-md shadow-sm">
            <input
              type="number"
              {...register('scaleFactor', { valueAsNumber: true })}
              className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Factor de escala"
              min={0.1}
              max={10}
              step={0.1}
              disabled={isProcessing}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500 sm:text-sm">×</span>
            </div>
          </div>
          {errors.scaleFactor && (
            <p className="mt-1 text-sm text-red-600">{errors.scaleFactor.message}</p>
          )}
        </div>
      </div>
      
      <div className="pt-2">
        <Button 
          type="submit" 
          isLoading={isProcessing}
          disabled={isProcessing}
          className="w-full"
        >
          Reescalar Imagen
        </Button>
      </div>
    </form>
  );
}
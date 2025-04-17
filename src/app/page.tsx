import React from 'react';
import { ImageProcessor } from '@/components/ImageProcessor';

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Procesador de Imágenes</h1>
          <p className="text-gray-600">
            Redimensiona y reescala tus imágenes sin perder calidad
          </p>
        </div>
        
        <ImageProcessor />
        
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            Desarrollado con Next.js, TypeScript y Pillow
          </p>
        </footer>
      </div>
    </main>
  );
}
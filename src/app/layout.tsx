import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { initializeApp } from '@/lib/app-init';

// Solo ejecuta initializeApp() en el servidor
if (typeof window === 'undefined') {
  initializeApp();
}

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Procesador de Imágenes',
  description: 'Aplicación para redimensionar y reescalar imágenes sin perder calidad',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
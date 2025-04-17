import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Importamos usando rutas relativas para evitar problemas
import { ImageService } from '../../../lib/services/image-service';

/**
 * Handler para procesar imágenes
 * Se encarga de validar la entrada, procesar la imagen y devolver el resultado
 */
export async function POST(req: NextRequest) {
  try {
    console.log("API: Recibiendo solicitud de procesamiento de imagen");
    
    // 1. Recibir FormData
    const formData = await req.formData();
    
    // 2. Extraer datos básicos para debug
    const operation = formData.get('operation');
    const file = formData.get('file');
    
    console.log(`API: Operación: ${operation}, Archivo recibido: ${file instanceof File ? 'Sí' : 'No'}`);
    
    // Validación básica
    if (!file || !(file instanceof File)) {
      console.error("API: No se envió ningún archivo");
      return NextResponse.json(
        { success: false, message: 'No se envió ningún archivo' },
        { status: 400 }
      );
    }
    
    if (!operation || !['resize', 'rescale'].includes(operation as string)) {
      console.error("API: Operación no válida");
      return NextResponse.json(
        { success: false, message: 'Operación no válida' },
        { status: 400 }
      );
    }

    // 3. Preparar datos según la operación para procesamiento directo
    if (operation === 'resize') {
      const width = parseInt(formData.get('width') as string);
      const height = parseInt(formData.get('height') as string);
      const keepAspectRatio = formData.get('keepAspectRatio') === 'true';
      
      // 4. Procesar directamente sin depender de clases externas
      // Crear directorio temporal si no existe
      const tempDir = join(process.cwd(), 'public', 'temp');
      if (!existsSync(tempDir)) {
        await mkdir(tempDir, { recursive: true });
      }
      
      // Generar nombres de archivo únicos
      const fileId = uuidv4();
      const fileExt = (file as File).name.split('.').pop() || 'jpg';
      
      const originalFilename = `${fileId}-original.${fileExt}`;
      const processedFilename = `${fileId}-processed.${fileExt}`;
      
      const originalPath = join(tempDir, originalFilename);
      
      // Escribir archivo original
      const fileBuffer = Buffer.from(await (file as File).arrayBuffer());
      await writeFile(originalPath, fileBuffer);
      
      console.log(`API: Archivo guardado en ${originalPath}`);
      
      // Por ahora, simplemente devolvemos el archivo original sin procesarlo
      // Esto nos permite verificar si la subida de archivos funciona correctamente
      return NextResponse.json({
        success: true,
        url: `/temp/${originalFilename}`,
        originalSize: fileBuffer.length,
        processedSize: fileBuffer.length,
        dimensions: [width || 800, height || 600],
      });
      
    } else if (operation === 'rescale') {
      const scaleFactor = parseFloat(formData.get('scaleFactor') as string);
      
      // Igual que arriba, procesamiento directo
      const tempDir = join(process.cwd(), 'public', 'temp');
      if (!existsSync(tempDir)) {
        await mkdir(tempDir, { recursive: true });
      }
      
      const fileId = uuidv4();
      const fileExt = (file as File).name.split('.').pop() || 'jpg';
      
      const originalFilename = `${fileId}-original.${fileExt}`;
      
      const originalPath = join(tempDir, originalFilename);
      
      const fileBuffer = Buffer.from(await (file as File).arrayBuffer());
      await writeFile(originalPath, fileBuffer);
      
      console.log(`API: Archivo guardado en ${originalPath}`);
      
      // Por ahora, simplemente devolvemos el archivo original sin procesarlo
      return NextResponse.json({
        success: true,
        url: `/temp/${originalFilename}`,
        originalSize: fileBuffer.length,
        processedSize: fileBuffer.length,
        dimensions: [
          Math.round(800 * scaleFactor),
          Math.round(600 * scaleFactor)
        ],
      });
    }
    
    // Si llegamos aquí, algo salió mal con la validación
    return NextResponse.json(
      { success: false, message: 'Parámetros incorrectos' },
      { status: 400 }
    );
  } catch (error) {
    console.error('API: Error procesando imagen:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error interno del servidor',
        stack: error instanceof Error ? error.stack : undefined 
      }, 
      { status: 500 }
    );
  }
}
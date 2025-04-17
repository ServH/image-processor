import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Importamos de forma relativa para evitar problemas con las rutas
import { ApiUtils } from '../../../lib/utils/api-utils';
import { imageProcessingRequestSchema } from '../../../lib/validators/api-validators';
import { ImageService } from '../../../lib/services/image-service';

/**
 * Handler para procesar imágenes
 * Se encarga de validar la entrada, procesar la imagen y devolver el resultado
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Recibir FormData
    const formData = await req.formData();
    
    // 2. Preparar datos para validación
    const rawData = {
      operation: formData.get('operation'),
      file: formData.get('file'),
      ...(formData.get('operation') === 'resize' ? {
        width: formData.get('width'),
        height: formData.get('height'),
        keepAspectRatio: formData.get('keepAspectRatio'),
      } : {
        scaleFactor: formData.get('scaleFactor'),
      })
    };
    
    // 3. Validar datos
    const validationResult = imageProcessingRequestSchema.safeParse(rawData);
    
    if (!validationResult.success) {
      return ApiUtils.createZodErrorResponse(validationResult.error);
    }
    
    const data = validationResult.data;
    
    // 4. Inicializar servicio de procesamiento de imágenes
    const imageService = new ImageService();
    
    // 5. Procesar imagen
    const result = await imageService.processFile({
      file: data.file,
      operation: data.operation,
      options: data.operation === 'resize' 
        ? { 
            width: data.width, 
            height: data.height, 
            keepAspectRatio: data.keepAspectRatio 
          }
        : { 
            scaleFactor: data.scaleFactor 
          }
    });
    
    // 6. Verificar resultado
    if (!result.success) {
      return ApiUtils.createErrorResponse(
        result.error || 'Error al procesar la imagen',
        500
      );
    }
    
    // 7. Devolver resultado exitoso
    return NextResponse.json({
      success: true,
      url: result.url,
      originalSize: result.originalSize,
      processedSize: result.processedSize,
      dimensions: result.dimensions,
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error interno del servidor' 
      }, 
      { status: 500 }
    );
  }
}
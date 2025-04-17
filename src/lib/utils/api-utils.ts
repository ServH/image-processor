import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Interface para respuestas de error estándar
 */
interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, any>;
}

/**
 * Clase de utilidades para manejo de API Routes
 */
export class ApiUtils {
  /**
   * Crea una respuesta de error estándar
   * 
   * @param message - Mensaje de error
   * @param status - Código de estado HTTP
   * @param errors - Errores adicionales (opcional)
   * @returns Respuesta NextResponse con formato estandarizado
   */
  public static createErrorResponse(
    message: string,
    status: number = 400,
    errors?: Record<string, any>
  ): NextResponse {
    const errorResponse: ErrorResponse = {
      success: false,
      message,
      ...(errors && { errors })
    };
    
    return NextResponse.json(errorResponse, { status });
  }

  /**
   * Crea una respuesta de error a partir de un ZodError
   * 
   * @param error - Error de validación de Zod
   * @param message - Mensaje de error general (opcional)
   * @returns Respuesta NextResponse con formato estandarizado
   */
  public static createZodErrorResponse(
    error: ZodError,
    message: string = 'Error de validación'
  ): NextResponse {
    return ApiUtils.createErrorResponse(message, 400, error.format());
  }

  /**
   * Extrae un archivo de FormData y verifica su tipo
   * 
   * @param formData - FormData a procesar
   * @param fieldName - Nombre del campo que contiene el archivo
   * @param allowedMimeTypes - Tipos MIME permitidos
   * @returns El archivo si es válido, null si no existe o no es válido
   */
  public static extractFile(
    formData: FormData,
    fieldName: string = 'file',
    allowedMimeTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  ): File | null {
    const file = formData.get(fieldName);
    
    if (!file || !(file instanceof File)) {
      return null;
    }
    
    if (!allowedMimeTypes.includes(file.type)) {
      return null;
    }
    
    return file;
  }

  /**
   * Extrae parámetros de una consulta de URL
   * 
   * @param request - Solicitud NextRequest
   * @returns Objeto con los parámetros de consulta
   */
  public static getQueryParams(request: NextRequest): Record<string, string> {
    const url = new URL(request.url);
    const params: Record<string, string> = {};
    
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  }

  /**
   * Crea un nombre de archivo seguro (elimina caracteres no permitidos)
   * 
   * @param filename - Nombre original del archivo
   * @returns Nombre de archivo seguro
   */
  public static sanitizeFilename(filename: string): string {
    // Eliminar caracteres no permitidos
    return filename
      .replace(/[^\w\s.-]/g, '')  // Mantener sólo letras, números, espacios, puntos y guiones
      .replace(/\s+/g, '-')       // Reemplazar espacios con guiones
      .toLowerCase();             // Convertir a minúsculas
  }

  /**
   * Determina el tipo MIME a partir de la extensión del archivo
   * 
   * @param filename - Nombre del archivo
   * @returns Tipo MIME o null si no se puede determinar
   */
  public static getMimeTypeFromFilename(filename: string): string | null {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    if (!extension) {
      return null;
    }
    
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'csv': 'text/csv',
      'json': 'application/json',
    };
    
    return mimeTypes[extension] || null;
  }
}
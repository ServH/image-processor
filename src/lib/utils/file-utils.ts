import { mkdir, writeFile, unlink, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interfaz para los metadatos de un archivo
 */
export interface FileMetadata {
  id: string;
  originalName: string;
  path: string;
  publicPath: string;
  size: number;
  type: string;
  extension: string;
}

/**
 * Clase de utilidades para manejo de archivos
 */
export class FileUtils {
  /**
   * Guarda un archivo en el sistema de archivos
   * 
   * @param file - Archivo a guardar
   * @param directory - Directorio donde guardar el archivo (relativo a la raíz del proyecto)
   * @param filenamePrefix - Prefijo opcional para el nombre del archivo
   * @returns Metadatos del archivo guardado
   */
  public static async saveFile(
    file: File,
    directory: string = 'public/temp',
    filenamePrefix?: string
  ): Promise<FileMetadata> {
    // Crear directorio si no existe
    const fullDirectory = join(process.cwd(), directory);
    if (!existsSync(fullDirectory)) {
      await mkdir(fullDirectory, { recursive: true });
    }

    // Generar ID único para el archivo
    const fileId = uuidv4();
    
    // Extraer extensión del archivo original
    const originalName = file.name;
    const extension = originalName.split('.').pop() || '';
    
    // Crear nombre de archivo único
    const filename = `${filenamePrefix || ''}${fileId}.${extension}`;
    const filePath = join(fullDirectory, filename);
    
    // Convertir File a Buffer y guardar
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, fileBuffer);
    
    // Calcular la ruta pública para acceder al archivo
    let publicPath: string;
    
    if (directory.startsWith('public/')) {
      // Si está en la carpeta public, lo hacemos accesible desde la web
      publicPath = `/${directory.replace('public/', '')}/${filename}`;
    } else {
      // Si no está en la carpeta public, no es accesible directamente
      publicPath = '';
    }
    
    // Obtener tamaño del archivo guardado
    const fileStats = await stat(filePath);
    
    // Devolver metadatos
    return {
      id: fileId,
      originalName,
      path: filePath,
      publicPath,
      size: fileStats.size,
      type: file.type,
      extension
    };
  }

  /**
   * Elimina un archivo del sistema de archivos
   * 
   * @param filePath - Ruta completa del archivo a eliminar
   * @returns true si se eliminó correctamente, false si ocurrió un error
   */
  public static async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (existsSync(filePath)) {
        await unlink(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Obtiene la extensión de un archivo a partir de su nombre
   * 
   * @param filename - Nombre del archivo
   * @returns Extensión del archivo (sin el punto)
   */
  public static getFileExtension(filename: string): string {
    return filename.split('.').pop() || '';
  }

  /**
   * Verifica si un archivo es una imagen
   * 
   * @param mimeType - Tipo MIME del archivo
   * @returns true si es una imagen, false en caso contrario
   */
  public static isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Verifica si un tipo MIME de imagen es soportado
   * 
   * @param mimeType - Tipo MIME del archivo
   * @returns true si es un formato soportado, false en caso contrario
   */
  public static isSupportedImageFormat(mimeType: string): boolean {
    const supportedFormats = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    return supportedFormats.includes(mimeType);
  }
}
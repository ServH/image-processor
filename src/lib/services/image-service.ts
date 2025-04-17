import { exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import { FileUtils } from '@/lib/utils/file-utils';

const execPromise = promisify(exec);

/**
 * Opciones para redimensionar una imagen
 */
export interface ResizeOptions {
  width: number;
  height: number;
  keepAspectRatio: boolean;
}

/**
 * Opciones para reescalar una imagen
 */
export interface RescaleOptions {
  scaleFactor: number;
}

/**
 * Unión de tipos para las operaciones posibles
 */
export type OperationOptions = ResizeOptions | RescaleOptions;

/**
 * Tipo de operación
 */
export type OperationType = 'resize' | 'rescale';

/**
 * Parámetros para procesar una imagen
 */
export interface ProcessImageParams {
  inputPath: string;
  outputPath: string;
  operation: OperationType;
  options: OperationOptions;
}

/**
 * Resultado del procesamiento de una imagen
 */
export interface ProcessResult {
  success: boolean;
  error?: string;
  originalSize?: number;
  processedSize?: number;
  dimensions?: [number, number];
  scaleFactor?: number;
}

/**
 * Parámetros para procesar una imagen desde un archivo
 */
export interface ProcessFileParams {
  file: File;
  operation: OperationType;
  options: OperationOptions;
}

/**
 * Servicio para el procesamiento de imágenes
 * Esta implementación preparatoria será completada en la Fase 3
 */
export class ImageService {
  private static readonly TEMP_DIR = path.join(process.cwd(), 'public', 'temp');
  private static readonly PYTHON_SCRIPT = path.join(process.cwd(), 'src', 'python', 'image_processor.py');

  /**
   * Constructor que inicializa el servicio
   * Verifica que exista el directorio temporal y el script Python
   */
  constructor() {
    this.ensureTempDirectory();
    this.validatePythonScript();
  }

  /**
   * Procesa un archivo de imagen
   * 
   * @param params - Parámetros para el procesamiento
   * @returns Resultado del procesamiento
   */
  public async processFile(params: ProcessFileParams): Promise<ProcessResult & { url: string }> {
    try {
      // Crear directorio temporal si no existe
      await this.ensureTempDirectory();
      
      // Guardar archivo original en carpeta temporal
      const fileId = uuidv4();
      const fileExt = params.file.name.split('.').pop() || 'jpg';
      
      const originalFilename = `${fileId}-original.${fileExt}`;
      const processedFilename = `${fileId}-processed.${fileExt}`;
      
      const originalPath = path.join(ImageService.TEMP_DIR, originalFilename);
      const processedPath = path.join(ImageService.TEMP_DIR, processedFilename);
      
      // Escribir archivo original
      const fileBuffer = Buffer.from(await params.file.arrayBuffer());
      await fs.writeFile(originalPath, fileBuffer);
      
      // Procesar imagen
      const result = await this.processImage({
        inputPath: originalPath,
        outputPath: processedPath,
        operation: params.operation,
        options: params.options
      });
      
      // Generar URL pública
      const publicUrl = `/temp/${processedFilename}`;
      
      return {
        ...result,
        url: publicUrl
      };
    } catch (error) {
      console.error('Error processing file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        url: ''
      };
    }
  }

  /**
   * Procesa una imagen
   * Esta implementación será completada en la Fase 3
   * 
   * @param params - Parámetros para el procesamiento
   * @returns Resultado del procesamiento
   */
  public async processImage(params: ProcessImageParams): Promise<ProcessResult> {
    // Este método será implementado en la Fase 3
    // Por ahora, devolvemos una simulación del resultado
    
    try {
      // Verificar que exista el archivo de entrada
      if (!existsSync(params.inputPath)) {
        throw new Error(`El archivo de entrada no existe: ${params.inputPath}`);
      }
      
      // Obtener tamaño del archivo original
      const originalStats = await fs.stat(params.inputPath);
      const originalSize = originalStats.size;
      
      // Simular procesamiento (copiar archivo)
      // En la Fase 3, llamaremos al script Python
      await fs.copyFile(params.inputPath, params.outputPath);
      
      // Obtener tamaño del archivo procesado
      const processedStats = await fs.stat(params.outputPath);
      const processedSize = processedStats.size;
      
      // Simular dimensiones según operación
      let dimensions: [number, number] = [800, 600]; // Valores por defecto
      
      if (params.operation === 'resize') {
        const options = params.options as ResizeOptions;
        dimensions = [options.width, options.height];
      } else if (params.operation === 'rescale') {
        // Simular dimensiones para reescalado
        const options = params.options as RescaleOptions;
        dimensions = [
          Math.round(800 * options.scaleFactor),
          Math.round(600 * options.scaleFactor)
        ];
      }
      
      return {
        success: true,
        originalSize,
        processedSize,
        dimensions,
        ...(params.operation === 'rescale' && { 
          scaleFactor: (params.options as RescaleOptions).scaleFactor
        })
      };
    } catch (error) {
      console.error('Error processing image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Asegura que existe el directorio temporal
   */
  private async ensureTempDirectory(): Promise<void> {
    if (!existsSync(ImageService.TEMP_DIR)) {
      await fs.mkdir(ImageService.TEMP_DIR, { recursive: true });
    }
  }

  /**
   * Valida que existe el script Python
   */
  private validatePythonScript(): void {
    if (!existsSync(ImageService.PYTHON_SCRIPT)) {
      console.warn(`Advertencia: El script Python no existe en la ruta: ${ImageService.PYTHON_SCRIPT}`);
    }
  }

  /**
   * Limpia archivos temporales antiguos
   * 
   * @param maxAgeMs - Edad máxima de los archivos en milisegundos (por defecto 1 hora)
   */
  public async cleanupTempFiles(maxAgeMs: number = 60 * 60 * 1000): Promise<void> {
    try {
      const now = Date.now();
      const files = await fs.readdir(ImageService.TEMP_DIR);
      
      for (const file of files) {
        // Ignorar archivo .gitkeep
        if (file === '.gitkeep') continue;
        
        const filePath = path.join(ImageService.TEMP_DIR, file);
        const stats = await fs.stat(filePath);
        
        // Eliminar archivos más antiguos que maxAgeMs
        if (now - stats.mtimeMs > maxAgeMs) {
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }
}
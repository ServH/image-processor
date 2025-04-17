import { exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';

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
  format?: string;
  processingTime?: number;
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
 * Utiliza un script Python con Pillow para el procesamiento de alta calidad
 */
export class ImageService {
  private static readonly TEMP_DIR = path.join(process.cwd(), 'public', 'temp');
  private static readonly PYTHON_SCRIPT = path.join(process.cwd(), 'src', 'python', 'image_processor.py');
  private static readonly MAX_FILE_AGE_MS = 60 * 60 * 1000; // 1 hora

  /**
   * Constructor que inicializa el servicio
   * Verifica que exista el directorio temporal y el script Python
   */
  constructor() {
    this.ensureTempDirectory();
    this.validatePythonScript();
    
    // Limpieza automática de archivos temporales viejos
    setTimeout(() => {
      this.cleanupTempFiles();
    }, 1000);
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
      
      // Si hubo un error, devolver la URL original
      if (!result.success) {
        return {
          ...result,
          url: `/temp/${originalFilename}`
        };
      }
      
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
   * Procesa una imagen utilizando el script Python
   * 
   * @param params - Parámetros para el procesamiento
   * @returns Resultado del procesamiento
   */
  public async processImage(params: ProcessImageParams): Promise<ProcessResult> {
    try {
      // Verificar que exista el archivo de entrada
      if (!existsSync(params.inputPath)) {
        throw new Error(`El archivo de entrada no existe: ${params.inputPath}`);
      }
      
      // Verificar que exista el script Python
      await this.validatePythonScript();
      
      // Preparar comando y argumentos para el script Python
      const args = {
        operation: params.operation,
        input_path: params.inputPath,
        output_path: params.outputPath,
        ...(params.operation === 'resize' ? {
          width: (params.options as ResizeOptions).width,
          height: (params.options as ResizeOptions).height,
          keep_aspect_ratio: (params.options as ResizeOptions).keepAspectRatio
        } : {
          scale_factor: (params.options as RescaleOptions).scaleFactor
        })
      };
      
      // Ejecutar script Python
      const pythonExecutable = this.getPythonExecutable();
      const command = `${pythonExecutable} "${ImageService.PYTHON_SCRIPT}" '${JSON.stringify(args)}'`;
      
      const { stdout, stderr } = await execPromise(command);
      
      if (stderr) {
        console.warn('Python warning/error:', stderr);
      }
      
      // Parsear resultado
      const result = JSON.parse(stdout);
      
      // Si hubo un error en el script
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Error desconocido en el procesamiento'
        };
      }
      
      // Verificar que se creó el archivo de salida
      if (!existsSync(params.outputPath)) {
        return {
          success: false,
          error: 'El archivo de salida no fue creado'
        };
      }
      
      return {
        success: true,
        originalSize: result.original_size,
        processedSize: result.processed_size,
        dimensions: result.dimensions,
        format: result.format,
        processingTime: result.processing_time,
        ...(params.operation === 'rescale' && { 
          scaleFactor: result.scale_factor
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
   * Determina el ejecutable de Python a utilizar
   * Primero intenta con 'python3', luego con 'python'
   */
  private getPythonExecutable(): string {
    // En un entorno real, esto debería verificar si los comandos existen
    // Para simplificar, asumimos que al menos uno está disponible
    return process.platform === 'win32' ? 'python' : 'python3';
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
  private async validatePythonScript(): Promise<void> {
    if (!existsSync(ImageService.PYTHON_SCRIPT)) {
      throw new Error(`El script Python no existe en la ruta: ${ImageService.PYTHON_SCRIPT}`);
    }
  }

  /**
   * Limpia archivos temporales antiguos
   * 
   * @param maxAgeMs - Edad máxima de los archivos en milisegundos
   */
  public async cleanupTempFiles(maxAgeMs: number = ImageService.MAX_FILE_AGE_MS): Promise<void> {
    try {
      const now = Date.now();
      const files = await fs.readdir(ImageService.TEMP_DIR);
      
      let cleanedCount = 0;
      
      for (const file of files) {
        // Ignorar archivo .gitkeep
        if (file === '.gitkeep') continue;
        
        const filePath = path.join(ImageService.TEMP_DIR, file);
        const stats = await fs.stat(filePath);
        
        // Eliminar archivos más antiguos que maxAgeMs
        if (now - stats.mtimeMs > maxAgeMs) {
          await fs.unlink(filePath);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        console.log(`Limpieza completada: ${cleanedCount} archivos eliminados`);
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }
}
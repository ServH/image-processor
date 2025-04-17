import { join } from 'path';
import { readdir, stat, unlink } from 'fs/promises';
import { existsSync } from 'fs';

/**
 * Servicio para limpieza automática de archivos temporales
 */
export class CleanupService {
  // Ruta al directorio temporal
  private static readonly TEMP_DIR = join(process.cwd(), 'public', 'temp');
  
  // Tiempo máximo de vida de los archivos (1 hora por defecto)
  private static readonly MAX_AGE_MS = 60 * 60 * 1000;
  
  // Intervalo de limpieza (15 minutos por defecto)
  private static readonly CLEANUP_INTERVAL_MS = 15 * 60 * 1000;
  
  // ID del intervalo de limpieza
  private static cleanupInterval: NodeJS.Timeout | null = null;
  
  /**
   * Inicia el servicio de limpieza automática
   */
  public static startCleanupService(): void {
    if (this.cleanupInterval) {
      console.log('Servicio de limpieza ya está en ejecución');
      return;
    }
    
    console.log('Iniciando servicio de limpieza automática');
    
    // Realizar una limpieza inicial
    this.cleanupTempFiles();
    
    // Configurar intervalo para limpiezas periódicas
    this.cleanupInterval = setInterval(() => {
      this.cleanupTempFiles();
    }, this.CLEANUP_INTERVAL_MS);
  }
  
  /**
   * Detiene el servicio de limpieza automática
   */
  public static stopCleanupService(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('Servicio de limpieza detenido');
    }
  }
  
  /**
   * Limpia archivos temporales antiguos
   * 
   * @param maxAgeMs - Edad máxima de los archivos en milisegundos
   * @returns Número de archivos eliminados
   */
  public static async cleanupTempFiles(maxAgeMs = this.MAX_AGE_MS): Promise<number> {
    try {
      // Verificar que existe el directorio
      if (!existsSync(this.TEMP_DIR)) {
        console.log(`Directorio ${this.TEMP_DIR} no existe, creándolo...`);
        return 0;
      }
      
      const now = Date.now();
      const files = await readdir(this.TEMP_DIR);
      
      let cleanedCount = 0;
      const errors: string[] = [];
      
      for (const file of files) {
        // Ignorar archivo .gitkeep
        if (file === '.gitkeep') continue;
        
        try {
          const filePath = join(this.TEMP_DIR, file);
          const fileStats = await stat(filePath);
          
          // Eliminar archivos más antiguos que maxAgeMs
          if (now - fileStats.mtimeMs > maxAgeMs) {
            await unlink(filePath);
            cleanedCount++;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          errors.push(`Error al procesar archivo ${file}: ${errorMessage}`);
        }
      }
      
      if (cleanedCount > 0) {
        console.log(`Limpieza completada: ${cleanedCount} archivos eliminados`);
      }
      
      if (errors.length > 0) {
        console.warn('Errores durante la limpieza:', errors);
      }
      
      return cleanedCount;
    } catch (error) {
      console.error('Error en la limpieza de archivos temporales:', error);
      return 0;
    }
  }
}
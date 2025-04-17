import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { existsSync } from 'fs';
import fs from 'fs/promises';

const execPromise = promisify(exec);

/**
 * Clase de utilidades para comunicación con Python
 */
export class PythonUtils {
  /**
   * Ejecuta un script Python con argumentos JSON
   * 
   * @param scriptPath - Ruta al script Python
   * @param args - Argumentos a pasar al script (serán convertidos a JSON)
   * @returns Resultado del script
   */
  public static async executeScript<T>(scriptPath: string, args: any): Promise<T> {
    try {
      // Verificar que el script existe
      if (!existsSync(scriptPath)) {
        throw new Error(`Script Python no encontrado: ${scriptPath}`);
      }
      
      // Obtener ejecutable de Python
      const pythonExecutable = this.getPythonExecutable();
      
      // Ejecutar script con argumentos en formato JSON
      const command = `${pythonExecutable} "${scriptPath}" '${JSON.stringify(args)}'`;
      
      const { stdout, stderr } = await execPromise(command);
      
      if (stderr) {
        console.warn('Python warning/error:', stderr);
      }
      
      // Parsear resultado
      const result = JSON.parse(stdout);
      return result as T;
    } catch (error) {
      console.error('Error executing Python script:', error);
      throw error;
    }
  }
  
  /**
   * Determina el ejecutable de Python a utilizar
   */
  private static getPythonExecutable(): string {
    // En un entorno real, esto debería verificar si los comandos existen
    // Para simplificar, asumimos que al menos uno está disponible
    return process.platform === 'win32' ? 'python' : 'python3';
  }
  
  /**
   * Verifica si Python está instalado y disponible
   */
  public static async isPythonAvailable(): Promise<boolean> {
    try {
      const pythonExecutable = this.getPythonExecutable();
      await execPromise(`${pythonExecutable} --version`);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Verifica si un módulo Python está instalado
   * 
   * @param moduleName - Nombre del módulo a verificar
   */
  public static async isPythonModuleInstalled(moduleName: string): Promise<boolean> {
    try {
      const pythonExecutable = this.getPythonExecutable();
      const command = `${pythonExecutable} -c "import ${moduleName}; print('Module exists')"`;
      await execPromise(command);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Instala un módulo Python usando pip
   * 
   * @param moduleName - Nombre del módulo a instalar
   */
  public static async installPythonModule(moduleName: string): Promise<boolean> {
    try {
      const pythonExecutable = this.getPythonExecutable();
      const pipCommand = process.platform === 'win32' ? 'pip' : 'pip3';
      
      const command = `${pipCommand} install ${moduleName}`;
      await execPromise(command);
      return true;
    } catch (error) {
      console.error(`Error installing Python module ${moduleName}:`, error);
      return false;
    }
  }
  
  /**
   * Verifica los requisitos de Python necesarios para la aplicación
   * 
   * @returns Objeto con información sobre los requisitos
   */
  public static async checkPythonRequirements(): Promise<{
    pythonAvailable: boolean;
    pillowInstalled: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    
    // Verificar si Python está disponible
    const pythonAvailable = await this.isPythonAvailable();
    if (!pythonAvailable) {
      issues.push('Python no está instalado o no está disponible en la ruta del sistema.');
    }
    
    // Verificar si Pillow está instalado
    let pillowInstalled = false;
    if (pythonAvailable) {
      pillowInstalled = await this.isPythonModuleInstalled('PIL');
      if (!pillowInstalled) {
        issues.push('El módulo Pillow (PIL) no está instalado. Necesario para el procesamiento de imágenes.');
      }
    }
    
    return {
      pythonAvailable,
      pillowInstalled,
      issues
    };
  }
}
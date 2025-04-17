import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

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
    const operation = formData.get('operation') as string;
    const file = formData.get('file') as File;
    
    console.log(`API: Operación: ${operation}, Archivo recibido: ${file instanceof File ? 'Sí' : 'No'}`);
    
    // Validación básica
    if (!file || !(file instanceof File)) {
      console.error("API: No se envió ningún archivo");
      return NextResponse.json(
        { success: false, message: 'No se envió ningún archivo' },
        { status: 400 }
      );
    }
    
    if (!operation || !['resize', 'rescale'].includes(operation)) {
      console.error("API: Operación no válida");
      return NextResponse.json(
        { success: false, message: 'Operación no válida' },
        { status: 400 }
      );
    }

    // 3. Obtener parámetros específicos según la operación
    let processingArgs: any = {};
    
    if (operation === 'resize') {
      const width = parseInt(formData.get('width') as string);
      const height = parseInt(formData.get('height') as string);
      
      // Corrección importante: Convertir explícitamente el string a booleano
      const keepAspectRatioStr = formData.get('keepAspectRatio') as string;
      const keepAspectRatio = keepAspectRatioStr === 'true';
      
      console.log(`API: Parámetros de resize - width: ${width}, height: ${height}, keepAspectRatio: ${keepAspectRatio} (original: "${keepAspectRatioStr}")`);
      
      if (isNaN(width) || width <= 0 || width > 10000) {
        return NextResponse.json(
          { success: false, message: 'Ancho no válido' },
          { status: 400 }
        );
      }
      
      if (isNaN(height) || height <= 0 || height > 10000) {
        return NextResponse.json(
          { success: false, message: 'Alto no válido' },
          { status: 400 }
        );
      }
      
      processingArgs = { width, height, keep_aspect_ratio: keepAspectRatio };
    } else if (operation === 'rescale') {
      const scaleFactor = parseFloat(formData.get('scaleFactor') as string);
      
      if (isNaN(scaleFactor) || scaleFactor < 0.1 || scaleFactor > 10) {
        return NextResponse.json(
          { success: false, message: 'Factor de escala no válido' },
          { status: 400 }
        );
      }
      
      processingArgs = { scale_factor: scaleFactor };
    }
    
    // 4. Preparar archivos y directorios
    const tempDir = join(process.cwd(), 'public', 'temp');
    const pythonScript = join(process.cwd(), 'src', 'python', 'image_processor.py');
    
    // Verificar que el script Python existe
    if (!existsSync(pythonScript)) {
      console.error(`API: Script Python no encontrado en ${pythonScript}`);
      return NextResponse.json(
        { success: false, message: 'Error de configuración: Script Python no encontrado' },
        { status: 500 }
      );
    }
    
    // Crear directorio temporal si no existe
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }
    
    // Generar nombres de archivo únicos
    const fileId = uuidv4();
    const fileExt = file.name.split('.').pop() || 'jpg';
    
    const originalFilename = `${fileId}-original.${fileExt}`;
    const processedFilename = `${fileId}-processed.${fileExt}`;
    
    const originalPath = join(tempDir, originalFilename);
    const processedPath = join(tempDir, processedFilename);
    
    // Escribir archivo original
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(originalPath, fileBuffer);
    
    console.log(`API: Archivo guardado en ${originalPath}`);
    
    // 5. Procesar la imagen con Python
    // Preparar argumentos para el script Python
    const pythonArgs = {
      operation,
      input_path: originalPath,
      output_path: processedPath,
      ...processingArgs
    };
    
    // Ejecutar el script Python
    const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';
    const command = `${pythonExecutable} "${pythonScript}" '${JSON.stringify(pythonArgs)}'`;
    
    console.log(`API: Ejecutando comando: ${command}`);
    
    // Opción alternativa si hay problemas con comillas simples
    // const command = `${pythonExecutable} "${pythonScript}" "${JSON.stringify(pythonArgs).replace(/"/g, '\\"')}"`;
    
    try {
      const { stdout, stderr } = await execPromise(command);
      
      if (stderr) {
        console.warn('API: Advertencia/error de Python:', stderr);
      }
      
      console.log('API: Respuesta de Python:', stdout);
      
      // Parsear resultado
      let result;
      try {
        result = JSON.parse(stdout);
      } catch (error) {
        console.error('API: Error al parsear la respuesta de Python:', error);
        console.error('API: Stdout completo:', stdout);
        return NextResponse.json(
          { success: false, message: 'Error al procesar la imagen', pythonOutput: stdout },
          { status: 500 }
        );
      }
      
      // Verificar si hubo error en el procesamiento
      if (!result.success) {
        console.error('API: Error en el procesamiento Python:', result.error);
        return NextResponse.json(
          { success: false, message: result.error || 'Error al procesar la imagen' },
          { status: 500 }
        );
      }
      
      // Verificar que se creó el archivo procesado
      if (!existsSync(processedPath)) {
        console.error(`API: El archivo procesado no fue creado en ${processedPath}`);
        return NextResponse.json(
          { success: false, message: 'Error al procesar la imagen: archivo no creado' },
          { status: 500 }
        );
      }
      
      // 6. Devolver resultado exitoso
      return NextResponse.json({
        success: true,
        url: `/temp/${processedFilename}`,
        originalSize: result.original_size,
        processedSize: result.processed_size,
        dimensions: result.dimensions,
        processingTime: result.processing_time || 0,
      });
    } catch (execError) {
      console.error('API: Error al ejecutar el comando Python:', execError);
      // Intentar un enfoque alternativo con comillas diferentes si es el problema
      return NextResponse.json(
        { 
          success: false, 
          message: 'Error al ejecutar el procesamiento de imagen',
          error: execError instanceof Error ? execError.message : String(execError)
        }, 
        { status: 500 }
      );
    }
    
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
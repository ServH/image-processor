from PIL import Image, ImageEnhance
import sys
import json
import os
import time

def resize_image(input_path, output_path, width, height, keep_aspect_ratio=True):
    try:
        start_time = time.time()
        
        # Abrir imagen
        img = Image.open(input_path)
        original_width, original_height = img.size
        
        # Determinar las nuevas dimensiones
        if keep_aspect_ratio:
            # Si queremos ampliar (nuevo tamaño > tamaño original)
            if width > original_width or height > original_height:
                # Calcular proporciones
                width_ratio = width / original_width
                height_ratio = height / original_height
                
                # Usar la proporción más pequeña para mantener la imagen dentro de los límites
                ratio = min(width_ratio, height_ratio)
                
                # Calcular nuevas dimensiones
                new_width = int(original_width * ratio)
                new_height = int(original_height * ratio)
                
                # Redimensionar
                img = img.resize((new_width, new_height), Image.LANCZOS)
            else:
                # Para reducir, usamos thumbnail que preserva mejor la calidad
                img_copy = img.copy()  # Crear copia para no modificar el original
                img_copy.thumbnail((width, height), Image.LANCZOS)
                img = img_copy
                new_width, new_height = img.size
        else:
            # Redimensionar exactamente a las dimensiones especificadas
            img = img.resize((width, height), Image.LANCZOS)
            new_width, new_height = width, height
        
        # Guardar imagen procesada
        img.save(output_path)
        
        # Obtener información
        original_size = os.path.getsize(input_path)
        processed_size = os.path.getsize(output_path)
        
        # Calcular tiempo de procesamiento
        processing_time = int((time.time() - start_time) * 1000)  # milisegundos
        
        return {
            "success": True,
            "original_size": original_size,
            "processed_size": processed_size,
            "dimensions": [new_width, new_height],
            "processing_time": processing_time
        }
        
    except Exception as e:
        import traceback
        print(f"Error en resize_image: {str(e)}")
        print(traceback.format_exc())
        return {
            "success": False,
            "error": str(e)
        }

def rescale_image(input_path, output_path, scale_factor):
    """
    Reescala una imagen manteniendo la máxima calidad posible.
    
    Args:
        input_path: Ruta de la imagen de entrada
        output_path: Ruta donde guardar la imagen procesada
        scale_factor: Factor de escala (ej: 1.5 para aumentar 50%)
    
    Returns:
        dict: Información sobre el procesamiento
    """
    try:
        start_time = time.time()
        
        # Abrir imagen
        img = Image.open(input_path)
        
        # Calcular nuevas dimensiones
        original_width, original_height = img.size
        new_width = int(original_width * scale_factor)
        new_height = int(original_height * scale_factor)
        
        # Reescalar imagen
        img = img.resize((new_width, new_height), Image.LANCZOS)
        
        # Guardar imagen procesada
        img.save(output_path)
        
        # Obtener información
        original_size = os.path.getsize(input_path)
        processed_size = os.path.getsize(output_path)
        
        # Calcular tiempo de procesamiento
        processing_time = int((time.time() - start_time) * 1000)  # milisegundos
        
        return {
            "success": True,
            "original_size": original_size,
            "processed_size": processed_size,
            "dimensions": [new_width, new_height],
            "scale_factor": scale_factor,
            "processing_time": processing_time
        }
        
    except Exception as e:
        import traceback
        print(f"Error en rescale_image: {str(e)}")
        print(traceback.format_exc())
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    try:
        # Verificar argumentos
        if len(sys.argv) < 2:
            print(json.dumps({"success": False, "error": "No se proporcionaron argumentos"}))
            sys.exit(1)
        
        # Obtener y parsear argumentos
        args_str = sys.argv[1]
        args = json.loads(args_str)
        
        # Extraer operación y parámetros básicos
        operation = args.get("operation")
        input_path = args.get("input_path")
        output_path = args.get("output_path")
        
        # Verificar que los archivos y directorios existen
        if not os.path.exists(input_path):
            print(json.dumps({"success": False, "error": f"Archivo de entrada no encontrado: {input_path}"}))
            sys.exit(1)
            
        # Crear directorio de salida si no existe
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Realizar operación correspondiente
        if operation == "resize":
            width = args.get("width")
            height = args.get("height")
            keep_aspect_ratio = args.get("keep_aspect_ratio", True)
            
            # Debug
            print(f"Debug: resize con width={width}, height={height}, keep_aspect_ratio={keep_aspect_ratio}, tipo={type(keep_aspect_ratio)}", file=sys.stderr)
            
            result = resize_image(
                input_path,
                output_path,
                width,
                height,
                keep_aspect_ratio
            )
            
        elif operation == "rescale":
            scale_factor = args.get("scale_factor")
            
            result = rescale_image(
                input_path,
                output_path,
                scale_factor
            )
            
        else:
            result = {"success": False, "error": f"Operación no soportada: {operation}"}
        
        # Devolver resultado como JSON
        print(json.dumps(result))
        
    except Exception as e:
        import traceback
        print(f"Error global: {str(e)}", file=sys.stderr)
        print(traceback.format_exc(), file=sys.stderr)
        print(json.dumps({"success": False, "error": str(e)}))
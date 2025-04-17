from PIL import Image
import sys
import json
import os

def resize_image(input_path, output_path, width, height, keep_aspect_ratio=True):
    """
    Redimensiona una imagen manteniendo la máxima calidad posible.
    
    Args:
        input_path: Ruta de la imagen de entrada
        output_path: Ruta donde guardar la imagen procesada
        width: Ancho deseado
        height: Alto deseado
        keep_aspect_ratio: Si se debe mantener la relación de aspecto
    
    Returns:
        dict: Información sobre el procesamiento
    """
    try:
        with Image.open(input_path) as img:
            # Guardar formato original
            original_format = img.format
            
            # Redimensionar
            if keep_aspect_ratio:
                img.thumbnail((width, height), Image.LANCZOS)
            else:
                img = img.resize((width, height), Image.LANCZOS)
                
            # Asegurar carpeta de destino
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Guardar con la máxima calidad
            img.save(output_path, format=original_format, quality=100)
            
            return {
                "success": True,
                "original_size": os.path.getsize(input_path),
                "processed_size": os.path.getsize(output_path),
                "dimensions": img.size
            }
    except Exception as e:
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
        with Image.open(input_path) as img:
            # Guardar formato original
            original_format = img.format
            
            # Calcular nueva dimensión
            width = int(img.width * scale_factor)
            height = int(img.height * scale_factor)
            
            # Reescalar usando el algoritmo de alta calidad
            img = img.resize((width, height), Image.LANCZOS)
            
            # Asegurar carpeta de destino
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Guardar con la máxima calidad
            img.save(output_path, format=original_format, quality=100)
            
            return {
                "success": True,
                "original_size": os.path.getsize(input_path),
                "processed_size": os.path.getsize(output_path),
                "dimensions": img.size,
                "scale_factor": scale_factor
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    # Procesar argumentos en formato JSON
    args = json.loads(sys.argv[1])
    operation = args.get("operation")
    
    result = {}
    
    if operation == "resize":
        result = resize_image(
            args.get("input_path"),
            args.get("output_path"),
            args.get("width"),
            args.get("height"),
            args.get("keep_aspect_ratio", True)
        )
    elif operation == "rescale":
        result = rescale_image(
            args.get("input_path"),
            args.get("output_path"),
            args.get("scale_factor")
        )
    else:
        result = {"success": False, "error": "Operación no soportada"}
    
    # Devolver resultado como JSON
    print(json.dumps(result))

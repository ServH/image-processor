from PIL import Image, ImageFilter, ImageEnhance
import sys
import json
import os
import time

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
        start_time = time.time()
        
        with Image.open(input_path) as img:
            # Guardar formato original y metadatos
            original_format = img.format
            original_info = img.info
            original_mode = img.mode
            
            # Si la imagen no está en modo RGB/RGBA, convertirla para mejor procesamiento
            working_img = img
            if original_mode not in ('RGB', 'RGBA'):
                working_img = img.convert('RGB')
            
            # Redimensionar con algoritmo de alta calidad
            if keep_aspect_ratio:
                # Thumbnail mantiene la relación de aspecto
                working_img.thumbnail((width, height), Image.LANCZOS)
                new_width, new_height = working_img.size
            else:
                # Resize cambia el tamaño exacto
                working_img = working_img.resize((width, height), Image.LANCZOS)
                new_width, new_height = width, height
            
            # Aplicar un ligero refinado para mejorar la calidad
            # Solo aplicar estos efectos si la imagen se ha reducido significativamente
            original_size = img.size
            if original_size[0] > new_width * 1.5 or original_size[1] > new_height * 1.5:
                # Aplicar un ligero enfoque para compensar el redimensionamiento
                enhancer = ImageEnhance.Sharpness(working_img)
                working_img = enhancer.enhance(1.1)  # Valor ligero para evitar artefactos
            
            # Asegurar carpeta de destino
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Determinar formato de salida basado en extensión y soporte
            output_format = original_format
            if not output_format or output_format not in ('JPEG', 'PNG', 'GIF', 'WEBP'):
                # Determinar formato por extensión
                ext = os.path.splitext(output_path)[1].lower()
                if ext == '.jpg' or ext == '.jpeg':
                    output_format = 'JPEG'
                elif ext == '.png':
                    output_format = 'PNG'
                elif ext == '.gif':
                    output_format = 'GIF'
                elif ext == '.webp':
                    output_format = 'WEBP'
                else:
                    output_format = 'JPEG'  # Por defecto
            
            # Guardar con la máxima calidad según el formato
            save_args = {"format": output_format}
            
            # Preparar argumentos específicos del formato
            if output_format == 'JPEG':
                save_args.update({
                    "quality": 95,              # Alta calidad
                    "optimize": True,           # Optimizar para web
                    "progressive": True,        # Carga progresiva
                })
            elif output_format == 'PNG':
                save_args.update({
                    "optimize": True,           # Optimizar para web
                    "compress_level": 9,        # Máxima compresión
                })
            elif output_format == 'WEBP':
                save_args.update({
                    "quality": 95,              # Alta calidad
                    "method": 6,                # Mayor calidad (más lento)
                    "lossless": False,          # Con pérdida para mejor compresión
                })
            
            # Preservar metadatos relevantes
            for key in ('exif', 'icc_profile'):
                if key in original_info:
                    save_args[key] = original_info[key]
            
            # Guardar imagen
            working_img.save(output_path, **save_args)
            
            # Obtener tamaños de archivo
            original_size_bytes = os.path.getsize(input_path)
            processed_size_bytes = os.path.getsize(output_path)
            
            end_time = time.time()
            
            return {
                "success": True,
                "original_size": original_size_bytes,
                "processed_size": processed_size_bytes,
                "dimensions": [new_width, new_height],
                "format": output_format,
                "processing_time": round((end_time - start_time) * 1000)  # tiempo en ms
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
        start_time = time.time()
        
        with Image.open(input_path) as img:
            # Guardar formato original y metadatos
            original_format = img.format
            original_info = img.info
            original_mode = img.mode
            
            # Si la imagen no está en modo RGB/RGBA, convertirla para mejor procesamiento
            working_img = img
            if original_mode not in ('RGB', 'RGBA'):
                working_img = img.convert('RGB')
            
            # Calcular nuevas dimensiones
            width = int(img.width * scale_factor)
            height = int(img.height * scale_factor)
            
            # Reescalar imagen con alta calidad
            if scale_factor > 1:
                # Si estamos aumentando la imagen, usamos un enfoque de alta calidad
                # Primero redimensionamos
                working_img = working_img.resize((width, height), Image.LANCZOS)
                
                # Aplicamos un ligero desenfoque gaussiano para reducir pixelación
                if scale_factor > 2:
                    working_img = working_img.filter(ImageFilter.GaussianBlur(0.5))
                
                # Aplicamos un suave enfoque para mejorar detalles
                enhancer = ImageEnhance.Sharpness(working_img)
                working_img = enhancer.enhance(1.05)
            else:
                # Si estamos reduciendo, usamos simplemente LANCZOS
                working_img = working_img.resize((width, height), Image.LANCZOS)
            
            # Asegurar carpeta de destino
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Determinar formato de salida basado en extensión y soporte
            output_format = original_format
            if not output_format or output_format not in ('JPEG', 'PNG', 'GIF', 'WEBP'):
                # Determinar formato por extensión
                ext = os.path.splitext(output_path)[1].lower()
                if ext == '.jpg' or ext == '.jpeg':
                    output_format = 'JPEG'
                elif ext == '.png':
                    output_format = 'PNG'
                elif ext == '.gif':
                    output_format = 'GIF'
                elif ext == '.webp':
                    output_format = 'WEBP'
                else:
                    output_format = 'JPEG'  # Por defecto
            
            # Guardar con la máxima calidad según el formato
            save_args = {"format": output_format}
            
            # Preparar argumentos específicos del formato
            if output_format == 'JPEG':
                save_args.update({
                    "quality": 95,              # Alta calidad
                    "optimize": True,           # Optimizar para web
                    "progressive": True,        # Carga progresiva
                })
            elif output_format == 'PNG':
                save_args.update({
                    "optimize": True,           # Optimizar para web
                    "compress_level": 9,        # Máxima compresión
                })
            elif output_format == 'WEBP':
                save_args.update({
                    "quality": 95,              # Alta calidad
                    "method": 6,                # Mayor calidad (más lento)
                    "lossless": False,          # Con pérdida para mejor compresión
                })
            
            # Preservar metadatos relevantes
            for key in ('exif', 'icc_profile'):
                if key in original_info:
                    save_args[key] = original_info[key]
            
            # Guardar imagen
            working_img.save(output_path, **save_args)
            
            # Obtener tamaños de archivo
            original_size_bytes = os.path.getsize(input_path)
            processed_size_bytes = os.path.getsize(output_path)
            
            end_time = time.time()
            
            return {
                "success": True,
                "original_size": original_size_bytes,
                "processed_size": processed_size_bytes,
                "dimensions": [width, height],
                "format": output_format,
                "scale_factor": scale_factor,
                "processing_time": round((end_time - start_time) * 1000)  # tiempo en ms
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    try:
        # Verificar que se reciben argumentos
        if len(sys.argv) < 2:
            raise ValueError("No se proporcionaron argumentos JSON")
        
        # Procesar argumentos en formato JSON
        args = json.loads(sys.argv[1])
        operation = args.get("operation")
        
        # Validar operación
        if not operation or operation not in ['resize', 'rescale']:
            print(json.dumps({"success": False, "error": "Operación no válida"}))
            sys.exit(1)
        
        # Validar existencia de archivo de entrada
        input_path = args.get("input_path")
        if not input_path or not os.path.exists(input_path):
            print(json.dumps({"success": False, "error": "Archivo de entrada no encontrado"}))
            sys.exit(1)
        
        # Ejecutar operación correspondiente
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
        
        # Devolver resultado como JSON
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
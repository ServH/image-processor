#!/usr/bin/env python3
"""
Script de prueba para el procesador de imágenes.
Este script se puede ejecutar de forma independiente para verificar
que el procesador de imágenes funciona correctamente.
"""

import os
import json
import time
from PIL import Image
import argparse
import image_processor

def test_resize():
    """Prueba la función de redimensionamiento"""
    print("Probando función de redimensionamiento...")
    
    # Crear directorio de prueba si no existe
    test_dir = os.path.join(os.path.dirname(__file__), "test_output")
    os.makedirs(test_dir, exist_ok=True)
    
    # Probar con un archivo de ejemplo
    sample_file = os.path.join(os.path.dirname(__file__), "sample.jpg")
    
    # Si el archivo de muestra no existe, crear una imagen simple
    if not os.path.exists(sample_file):
        print(f"No se encontró archivo de ejemplo, creando uno en {sample_file}...")
        img = Image.new("RGB", (1024, 768), color=(73, 109, 137))
        img.save(sample_file)
    
    # Definir casos de prueba
    test_cases = [
        {"width": 800, "height": 600, "keep_aspect_ratio": True, 
         "name": "resize_with_aspect_ratio"},
        {"width": 800, "height": 600, "keep_aspect_ratio": False, 
         "name": "resize_without_aspect_ratio"},
        {"width": 300, "height": 300, "keep_aspect_ratio": True, 
         "name": "resize_small_with_aspect_ratio"},
    ]
    
    results = []
    
    # Ejecutar casos de prueba
    for case in test_cases:
        output_file = os.path.join(test_dir, f"{case['name']}.jpg")
        print(f"Procesando {case['name']}...")
        
        start_time = time.time()
        result = image_processor.resize_image(
            sample_file,
            output_file,
            case["width"],
            case["height"],
            case["keep_aspect_ratio"]
        )
        end_time = time.time()
        
        # Añadir tiempo de procesamiento si no está incluido
        if "processing_time" not in result:
            result["processing_time"] = round((end_time - start_time) * 1000)
        
        result["case"] = case["name"]
        results.append(result)
        
        print(f"  - Resultado: {'✅ OK' if result['success'] else '❌ Error'}")
        if result["success"]:
            print(f"  - Dimensiones: {result['dimensions']}")
            print(f"  - Tamaño original: {result['original_size']/1024:.1f} KB")
            print(f"  - Tamaño procesado: {result['processed_size']/1024:.1f} KB")
            print(f"  - Tiempo: {result['processing_time']} ms")
    
    return results

def test_rescale():
    """Prueba la función de reescalado"""
    print("\nProbando función de reescalado...")
    
    # Crear directorio de prueba si no existe
    test_dir = os.path.join(os.path.dirname(__file__), "test_output")
    os.makedirs(test_dir, exist_ok=True)
    
    # Probar con un archivo de ejemplo
    sample_file = os.path.join(os.path.dirname(__file__), "sample.jpg")
    
    # Si el archivo de muestra no existe, crear una imagen simple
    if not os.path.exists(sample_file):
        print(f"No se encontró archivo de ejemplo, creando uno en {sample_file}...")
        img = Image.new("RGB", (1024, 768), color=(73, 109, 137))
        img.save(sample_file)
    
    # Definir casos de prueba
    test_cases = [
        {"scale_factor": 1.5, "name": "rescale_enlarge"},
        {"scale_factor": 0.5, "name": "rescale_reduce"},
        {"scale_factor": 2.0, "name": "rescale_double"},
    ]
    
    results = []
    
    # Ejecutar casos de prueba
    for case in test_cases:
        output_file = os.path.join(test_dir, f"{case['name']}.jpg")
        print(f"Procesando {case['name']}...")
        
        start_time = time.time()
        result = image_processor.rescale_image(
            sample_file,
            output_file,
            case["scale_factor"]
        )
        end_time = time.time()
        
        # Añadir tiempo de procesamiento si no está incluido
        if "processing_time" not in result:
            result["processing_time"] = round((end_time - start_time) * 1000)
        
        result["case"] = case["name"]
        results.append(result)
        
        print(f"  - Resultado: {'✅ OK' if result['success'] else '❌ Error'}")
        if result["success"]:
            print(f"  - Dimensiones: {result['dimensions']}")
            print(f"  - Tamaño original: {result['original_size']/1024:.1f} KB")
            print(f"  - Tamaño procesado: {result['processed_size']/1024:.1f} KB")
            print(f"  - Tiempo: {result['processing_time']} ms")
    
    return results

def test_command_line():
    """Prueba la interfaz de línea de comandos"""
    print("\nProbando interfaz de línea de comandos...")
    
    # Crear directorio de prueba si no existe
    test_dir = os.path.join(os.path.dirname(__file__), "test_output")
    os.makedirs(test_dir, exist_ok=True)
    
    # Probar con un archivo de ejemplo
    sample_file = os.path.join(os.path.dirname(__file__), "sample.jpg")
    output_file = os.path.join(test_dir, "cli_test.jpg")
    
    # Preparar argumentos como se harían en producción
    args = {
        "operation": "resize",
        "input_path": sample_file,
        "output_path": output_file,
        "width": 400,
        "height": 300,
        "keep_aspect_ratio": True
    }
    
    # Simular llamada desde línea de comandos
    import sys
    original_argv = sys.argv
    sys.argv = [sys.argv[0], json.dumps(args)]
    
    # Capturar salida estándar
    import io
    from contextlib import redirect_stdout
    
    f = io.StringIO()
    with redirect_stdout(f):
        # Importar módulo para que se ejecute el bloque if __name__ == "__main__"
        import importlib
        importlib.reload(image_processor)
    
    # Restaurar sys.argv
    sys.argv = original_argv
    
    # Verificar resultado
    output = f.getvalue()
    try:
        result = json.loads(output)
        print(f"  - Resultado: {'✅ OK' if result['success'] else '❌ Error'}")
        if result["success"]:
            print(f"  - Dimensiones: {result['dimensions']}")
            print(f"  - Tamaño original: {result['original_size']/1024:.1f} KB")
            print(f"  - Tamaño procesado: {result['processed_size']/1024:.1f} KB")
            print(f"  - Tiempo: {result['processing_time']} ms")
        return result
    except json.JSONDecodeError:
        print("  - ❌ Error al parsear salida JSON")
        print(f"  - Salida: {output}")
        return {"success": False, "error": "Error al parsear salida JSON"}

def main():
    """Función principal del script de prueba"""
    parser = argparse.ArgumentParser(description='Prueba del procesador de imágenes')
    parser.add_argument('--all', action='store_true', help='Ejecutar todas las pruebas')
    parser.add_argument('--resize', action='store_true', help='Probar función de redimensionamiento')
    parser.add_argument('--rescale', action='store_true', help='Probar función de reescalado')
    parser.add_argument('--cli', action='store_true', help='Probar interfaz de línea de comandos')
    
    args = parser.parse_args()
    
    # Si no se especifica ninguna opción, ejecutar todas las pruebas
    run_all = args.all or not (args.resize or args.rescale or args.cli)
    
    all_results = {}
    
    if args.resize or run_all:
        resize_results = test_resize()
        all_results["resize"] = resize_results
    
    if args.rescale or run_all:
        rescale_results = test_rescale()
        all_results["rescale"] = rescale_results
    
    if args.cli or run_all:
        cli_result = test_command_line()
        all_results["cli"] = cli_result
    
    # Resumen de resultados
    print("\n=== Resumen de Resultados ===")
    
    total_tests = 0
    passed_tests = 0
    
    for category, results in all_results.items():
        if isinstance(results, list):
            for result in results:
                total_tests += 1
                if result.get("success", False):
                    passed_tests += 1
        else:
            total_tests += 1
            if results.get("success", False):
                passed_tests += 1
    
    print(f"Tests ejecutados: {total_tests}")
    print(f"Tests exitosos: {passed_tests}")
    print(f"Tasa de éxito: {passed_tests/total_tests*100:.1f}%")
    
    # Guardar resultados en JSON para análisis posterior
    results_file = os.path.join(os.path.dirname(__file__), "test_output", "results.json")
    with open(results_file, 'w') as f:
        json.dump(all_results, f, indent=2)
    
    print(f"\nResultados detallados guardados en: {results_file}")

if __name__ == "__main__":
    main()
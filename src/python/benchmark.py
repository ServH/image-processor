#!/usr/bin/env python3
"""
Script para realizar benchmarks y pruebas de rendimiento
del procesador de imágenes.
"""

import os
import json
import time
import statistics
from PIL import Image
import argparse
import image_processor

def create_test_images(test_dir, sizes):
    """Crea imágenes de prueba con diferentes tamaños"""
    print("Creando imágenes de prueba...")
    
    images = {}
    
    # Crear directorio si no existe
    os.makedirs(test_dir, exist_ok=True)
    
    # Crear imágenes de diferentes tamaños
    for size in sizes:
        width, height = size
        filename = os.path.join(test_dir, f"test_{width}x{height}.jpg")
        
        # Verificar si ya existe
        if os.path.exists(filename):
            print(f"  - Imagen {width}x{height} ya existe")
        else:
            print(f"  - Creando imagen {width}x{height}")
            img = Image.new("RGB", (width, height), color=(73, 109, 137))
            img.save(filename, quality=95)
        
        images[f"{width}x{height}"] = filename
    
    return images

def run_resize_benchmark(images, test_dir, iterations=3):
    """Ejecuta benchmark de redimensionamiento"""
    print("\nEjecutando benchmark de redimensionamiento...")
    
    results = {}
    
    # Para cada imagen
    for label, image_path in images.items():
        print(f"Procesando imagen {label}...")
        
        # Diferentes configuraciones de redimensionamiento
        configs = [
            {"width": 800, "height": 600, "keep_aspect_ratio": True, "name": "resize_800x600_aspect"},
            {"width": 800, "height": 600, "keep_aspect_ratio": False, "name": "resize_800x600_exact"},
            {"width": 300, "height": 300, "keep_aspect_ratio": True, "name": "resize_300x300_aspect"},
            {"width": 1920, "height": 1080, "keep_aspect_ratio": True, "name": "resize_1920x1080_aspect"}
        ]
        
        image_results = {}
        
        # Para cada configuración
        for config in configs:
            print(f"  - Config: {config['name']}")
            
            times = []
            result = None
            
            # Ejecutar múltiples iteraciones para obtener tiempos promedio
            for i in range(iterations):
                output_file = os.path.join(test_dir, f"bench_{label}_{config['name']}_{i}.jpg")
                
                start_time = time.time()
                result = image_processor.resize_image(
                    image_path,
                    output_file,
                    config["width"],
                    config["height"],
                    config["keep_aspect_ratio"]
                )
                end_time = time.time()
                
                if not result['success']:
                    print(f"    ❌ Error: {result.get('error', 'desconocido')}")
                    break
                
                times.append((end_time - start_time) * 1000)  # ms
            
            if result and result['success']:
                # Calcular estadísticas
                avg_time = statistics.mean(times)
                min_time = min(times)
                max_time = max(times)
                
                print(f"    ✅ Tiempo promedio: {avg_time:.2f} ms (min: {min_time:.2f}, max: {max_time:.2f})")
                
                image_results[config['name']] = {
                    "avg_time_ms": avg_time,
                    "min_time_ms": min_time,
                    "max_time_ms": max_time,
                    "original_size": result["original_size"],
                    "processed_size": result["processed_size"],
                    "dimensions": result["dimensions"],
                    "reduction_ratio": result["processed_size"] / result["original_size"]
                }
        
        results[label] = image_results
    
    return results

def run_rescale_benchmark(images, test_dir, iterations=3):
    """Ejecuta benchmark de reescalado"""
    print("\nEjecutando benchmark de reescalado...")
    
    results = {}
    
    # Para cada imagen
    for label, image_path in images.items():
        print(f"Procesando imagen {label}...")
        
        # Diferentes configuraciones de reescalado
        configs = [
            {"scale_factor": 0.5, "name": "rescale_half"},
            {"scale_factor": 1.5, "name": "rescale_1_5x"},
            {"scale_factor": 2.0, "name": "rescale_2x"},
            {"scale_factor": 0.25, "name": "rescale_quarter"}
        ]
        
        image_results = {}
        
        # Para cada configuración
        for config in configs:
            print(f"  - Config: {config['name']}")
            
            times = []
            result = None
            
            # Ejecutar múltiples iteraciones para obtener tiempos promedio
            for i in range(iterations):
                output_file = os.path.join(test_dir, f"bench_{label}_{config['name']}_{i}.jpg")
                
                start_time = time.time()
                result = image_processor.rescale_image(
                    image_path,
                    output_file,
                    config["scale_factor"]
                )
                end_time = time.time()
                
                if not result['success']:
                    print(f"    ❌ Error: {result.get('error', 'desconocido')}")
                    break
                
                times.append((end_time - start_time) * 1000)  # ms
            
            if result and result['success']:
                # Calcular estadísticas
                avg_time = statistics.mean(times)
                min_time = min(times)
                max_time = max(times)
                
                print(f"    ✅ Tiempo promedio: {avg_time:.2f} ms (min: {min_time:.2f}, max: {max_time:.2f})")
                
                image_results[config['name']] = {
                    "avg_time_ms": avg_time,
                    "min_time_ms": min_time,
                    "max_time_ms": max_time,
                    "original_size": result["original_size"],
                    "processed_size": result["processed_size"],
                    "dimensions": result["dimensions"],
                    "scale_factor": result["scale_factor"],
                    "reduction_ratio": result["processed_size"] / result["original_size"]
                }
        
        results[label] = image_results
    
    return results

def compare_quality(images, test_dir):
    """Compara la calidad de la imagen con diferentes algoritmos"""
    print("\nComparando calidad de redimensionamiento...")
    
    # Usaremos solo la imagen más grande
    largest_image = None
    largest_size = 0
    
    for label, image_path in images.items():
        width, height = map(int, label.split('x'))
        size = width * height
        if size > largest_size:
            largest_size = size
            largest_image = image_path
    
    if not largest_image:
        print("No se encontraron imágenes para comparar")
        return {}
    
    print(f"Usando imagen: {largest_image}")
    
    # Algoritmos de redimensionamiento disponibles en PIL
    methods = {
        "NEAREST": Image.NEAREST,
        "BOX": Image.BOX,
        "BILINEAR": Image.BILINEAR,
        "HAMMING": Image.HAMMING,
        "BICUBIC": Image.BICUBIC,
        "LANCZOS": Image.LANCZOS
    }
    
    results = {}
    
    # Objetivo de redimensionamiento
    target_size = (800, 600)
    
    for method_name, method in methods.items():
        print(f"  - Método: {method_name}")
        output_file = os.path.join(test_dir, f"quality_comparison_{method_name}.jpg")
        
        # Redimensionar con este método
        with Image.open(largest_image) as img:
            start_time = time.time()
            resized = img.resize(target_size, method)
            end_time = time.time()
            
            # Guardar con alta calidad
            resized.save(output_file, format="JPEG", quality=95)
            
            # Obtener tamaño del archivo
            file_size = os.path.getsize(output_file)
            
            time_ms = (end_time - start_time) * 1000
            
            print(f"    - Tiempo: {time_ms:.2f} ms")
            print(f"    - Tamaño: {file_size/1024:.1f} KB")
            
            results[method_name] = {
                "time_ms": time_ms,
                "file_size": file_size,
                "dimensions": target_size,
                "output_file": output_file
            }
    
    return results

def main():
    """Función principal del benchmark"""
    parser = argparse.ArgumentParser(description='Benchmark del procesador de imágenes')
    parser.add_argument('--output-dir', default='benchmark_output',
                        help='Directorio de salida para los resultados')
    parser.add_argument('--iterations', type=int, default=3,
                        help='Número de iteraciones para cada prueba')
    
    args = parser.parse_args()
    
    # Crear directorio de salida
    test_dir = os.path.join(os.path.dirname(__file__), args.output_dir)
    os.makedirs(test_dir, exist_ok=True)
    
    # Tamaños de imagen para pruebas
    test_sizes = [
        (640, 480),      # VGA
        (1280, 720),     # HD
        (1920, 1080),    # Full HD
        (3840, 2160),    # 4K
    ]
    
    # Crear imágenes de prueba
    images = create_test_images(test_dir, test_sizes)
    
    # Ejecutar benchmarks
    resize_results = run_resize_benchmark(images, test_dir, args.iterations)
    rescale_results = run_rescale_benchmark(images, test_dir, args.iterations)
    quality_results = compare_quality(images, test_dir)
    
    # Consolidar resultados
    all_results = {
        "resize": resize_results,
        "rescale": rescale_results,
        "quality_comparison": quality_results,
        "metadata": {
            "iterations": args.iterations,
            "timestamp": time.time(),
            "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
            "pillow_version": Image.__version__
        }
    }
    
    # Guardar resultados
    results_file = os.path.join(test_dir, "benchmark_results.json")
    with open(results_file, 'w') as f:
        json.dump(all_results, f, indent=2)
    
    print(f"\nResultados guardados en: {results_file}")
    
    # Generar informe simple
    print("\n=== INFORME DE RENDIMIENTO ===")
    
    # Tiempo promedio por tamaño de imagen
    print("\nTiempo promedio de redimensionamiento (ms):")
    for size, size_results in resize_results.items():
        times = [result["avg_time_ms"] for result in size_results.values()]
        avg_time = statistics.mean(times)
        print(f"  - Imagen {size}: {avg_time:.2f} ms")
    
    print("\nTiempo promedio de reescalado (ms):")
    for size, size_results in rescale_results.items():
        times = [result["avg_time_ms"] for result in size_results.values()]
        avg_time = statistics.mean(times)
        print(f"  - Imagen {size}: {avg_time:.2f} ms")
    
    print("\nComparación de métodos de redimensionamiento:")
    for method, result in quality_results.items():
        print(f"  - {method}: {result['time_ms']:.2f} ms, {result['file_size']/1024:.1f} KB")

if __name__ == "__main__":
    import sys
    main()
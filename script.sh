#!/bin/bash
# Script para depurar el procesamiento de imágenes

echo "=== Verificando configuración ==="

# Comprobar Python
echo "Verificando Python..."
python_cmd=""
if command -v python3 &> /dev/null; then
    python_cmd="python3"
    echo "✅ Python 3 encontrado"
elif command -v python &> /dev/null; then
    python_cmd="python"
    echo "✅ Python encontrado"
else
    echo "❌ Python no encontrado, por favor instálalo"
    exit 1
fi

# Comprobar Pillow
echo "Verificando Pillow..."
$python_cmd -c "import PIL; print(f'✅ Pillow versión {PIL.__version__} encontrada')" 2>/dev/null || {
    echo "❌ Pillow no encontrado, intentando instalar..."
    $python_cmd -m pip install pillow
}

# Verificar script Python
script_path="src/python/image_processor.py"
echo "Verificando script Python en $script_path..."
if [ -f "$script_path" ]; then
    echo "✅ Script Python encontrado"
else
    echo "❌ Script Python no encontrado en $script_path"
    exit 1
fi

# Verificar directorio temporal
temp_dir="public/temp"
echo "Verificando directorio temporal en $temp_dir..."
if [ -d "$temp_dir" ]; then
    echo "✅ Directorio temporal encontrado"
else
    echo "❌ Directorio temporal no encontrado, creándolo..."
    mkdir -p "$temp_dir"
fi

# Probar script Python directamente
echo -e "\n=== Probando script Python ==="

# Crear imagen de prueba si no existe
test_img="$temp_dir/test.jpg"
if [ ! -f "$test_img" ]; then
    echo "Creando imagen de prueba..."
    $python_cmd -c "from PIL import Image; img = Image.new('RGB', (300, 300), color=(73, 109, 137)); img.save('$test_img')"
fi

# Ejecutar script con parámetros de prueba
echo "Ejecutando prueba de redimensionamiento..."
test_output="$temp_dir/test_output.jpg"

# Argumentos de prueba
test_args="{\"operation\":\"resize\",\"input_path\":\"$test_img\",\"output_path\":\"$test_output\",\"width\":200,\"height\":200,\"keep_aspect_ratio\":false}"

# Ejecutar el script
echo "Ejecutando: $python_cmd $script_path '$test_args'"
$python_cmd "$script_path" "$test_args"

# Verificar resultado
if [ -f "$test_output" ]; then
    echo "✅ Prueba exitosa - archivo de salida creado"
    
    # Obtener información de la imagen
    echo "Información de la imagen de salida:"
    $python_cmd -c "from PIL import Image; img = Image.open('$test_output'); print(f'Dimensiones: {img.size}')"
else
    echo "❌ Prueba fallida - no se creó el archivo de salida"
fi

echo -e "\n=== Diagnóstico completado ==="
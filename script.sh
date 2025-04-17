#!/bin/bash
# Script para verificar y crear la estructura de carpetas correcta

echo "Verificando estructura de carpetas del proyecto..."

# Crear directorios de utilidades y servicios si no existen
mkdir -p src/lib/utils
mkdir -p src/lib/validators
mkdir -p src/lib/services
mkdir -p src/app/api/image
mkdir -p public/temp

# Asegurarse de que .gitkeep existe en temp
touch public/temp/.gitkeep

echo "Estructura de carpetas verificada y corregida."

# Verificar si los archivos existen
check_and_report() {
  if [ -f "$1" ]; then
    echo "✅ $1 existe"
  else
    echo "❌ $1 no existe"
  fi
}

echo "Verificando archivos críticos:"
check_and_report "src/lib/utils/api-utils.ts"
check_and_report "src/lib/utils/file-utils.ts"
check_and_report "src/lib/validators/api-validators.ts"
check_and_report "src/lib/services/image-service.ts"
check_and_report "src/app/api/image/route.ts"
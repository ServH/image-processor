# Procesador de Imágenes

Una aplicación web moderna para el procesamiento de imágenes con alta calidad, desarrollada con Next.js, TypeScript y Python.

## Características

- **Redimensionamiento de imágenes** con preservación de calidad
- **Reescalado proporcional** con algoritmos optimizados
- **Interfaz de usuario intuitiva** y responsive
- **Comparación visual** entre imágenes originales y procesadas
- **Procesamiento en el servidor** mediante Python y Pillow
- **Limpieza automática** de archivos temporales

## Tecnologías

### Frontend
- Next.js 14 (App Router)
- TypeScript
- React
- TailwindCSS
- react-hook-form + Zod

### Backend
- Next.js API Routes
- Python 3.x
- Pillow (PIL)
- child_process para comunicación Node.js-Python

## Requisitos

- Node.js 18.x o superior
- Python 3.8 o superior
- npm o yarn

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/procesador-imagenes.git
cd procesador-imagenes
```

### 2. Instalar dependencias de Node.js

```bash
npm install
# o
yarn install
```

### 3. Configurar entorno Python

```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# Instalar dependencias Python
pip install pillow
```

## Estructura del Proyecto

```
procesador-imagenes/
├── public/                   # Archivos estáticos
│   └── temp/                 # Imágenes procesadas temporalmente
├── src/
│   ├── app/                  # Estructura Next.js App Router
│   │   ├── api/              # API Routes
│   │   │   └── image/        # Endpoint para procesamiento de imágenes
│   │   ├── layout.tsx        # Layout principal
│   │   └── page.tsx          # Página principal
│   ├── components/           # Componentes React
│   │   ├── forms/            # Formularios de operaciones
│   │   ├── ui/               # Componentes de UI reutilizables
│   │   ├── ImageComparison.tsx  # Comparador visual de imágenes
│   │   └── ImageProcessor.tsx   # Componente principal de procesamiento
│   ├── lib/                  # Utilidades y servicios
│   │   ├── app-init.ts       # Inicialización de la aplicación
│   │   ├── services/         # Servicios
│   │   ├── utils/            # Utilidades
│   │   └── validators/       # Esquemas de validación
│   └── python/               # Scripts Python
│       ├── image_processor.py      # Procesador de imágenes
│       ├── benchmark.py            # Pruebas de rendimiento
│       └── test_processor.py       # Pruebas de funcionalidad
└── venv/                     # Entorno virtual Python (gitignore)
```

## Desarrollo

### Iniciar servidor de desarrollo

```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

### Pruebas del procesador Python

```bash
cd src/python
python test_processor.py
```

### Benchmarks

```bash
cd src/python
python benchmark.py
```

## Despliegue

### Construir para producción

```bash
npm run build
# o
yarn build
```

### Iniciar servidor de producción

```bash
npm start
# o
yarn start
```

## Arquitectura

### Flujo de Procesamiento

1. El usuario sube una imagen a través de la interfaz web
2. El componente `ImageProcessor` gestiona las operaciones y formularios
3. La solicitud se envía a la API Route `/api/image`
4. La API valida los parámetros y llama al script Python
5. El script Python procesa la imagen y devuelve el resultado
6. El resultado se muestra al usuario con el componente `ImageComparison`

### Algoritmos de Procesamiento

Para el procesamiento de imágenes se utilizan principalmente dos técnicas:

#### Redimensionamiento

- Algoritmo LANCZOS para preservar la calidad en el escalado
- Opción para mantener la relación de aspecto
- Post-procesamiento para mejorar la nitidez después del redimensionamiento

#### Reescalado

- Algoritmo LANCZOS para el reescalado básico
- Técnicas adicionales para ampliaciones (desenfoque + nitidez)
- Preservación de metadatos importantes como EXIF e ICC

### Comunicación Frontend-Backend

- Las solicitudes se envían como `FormData` a la API
- La API se comunica con Python mediante `child_process`
- Los resultados se pasan como JSON

### Limpieza Automática

- Un servicio de limpieza elimina archivos temporales periódicamente
- Se ejecuta cada 15 minutos y elimina archivos más antiguos de 1 hora

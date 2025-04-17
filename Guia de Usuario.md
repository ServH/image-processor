# Guía de Usuario - Procesador de Imágenes

## Introducción

Bienvenido a la aplicación Procesador de Imágenes, una herramienta eficiente y fácil de usar para redimensionar y reescalar tus imágenes manteniendo la máxima calidad posible. Esta guía te ayudará a sacar el máximo provecho de la aplicación.

## Características Principales

- **Redimensionamiento de Alta Calidad**: Cambia el tamaño de tus imágenes a dimensiones específicas.
- **Reescalado Proporcional**: Aplica un factor de escala uniforme a tus imágenes.
- **Preservación de Calidad**: Algoritmos optimizados para mantener la máxima calidad de imagen.
- **Comparación Visual**: Compara las imágenes originales y procesadas con un control deslizante interactivo.
- **Estadísticas Detalladas**: Visualiza la reducción de tamaño y otros datos relevantes.

## Cómo Usar la Aplicación

### 1. Subir una Imagen

1. En la sección "Imagen Original", haz clic en el área de carga o arrastra y suelta una imagen.
2. Se admiten formatos JPG, PNG, GIF y WebP con un tamaño máximo de 5MB.
3. Una vista previa de la imagen se mostrará una vez cargada.

### 2. Seleccionar una Operación

Elige entre dos tipos de operaciones:

- **Redimensionar**: Cambia la imagen a dimensiones específicas.
- **Reescalar**: Aplica un factor de escala uniforme a toda la imagen.

### 3. Configurar Parámetros

#### Para Redimensionar:

1. Introduce el **ancho** deseado en píxeles.
2. Introduce el **alto** deseado en píxeles.
3. Activa o desactiva la opción **Mantener proporción** según necesites.

#### Para Reescalar:

1. Ajusta el **factor de escala** usando el control deslizante o introduce un valor directamente.
2. Valores menores a 1 reducen el tamaño, valores mayores a 1 lo aumentan.

### 4. Procesar la Imagen

1. Haz clic en el botón "Redimensionar Imagen" o "Reescalar Imagen".
2. Espera mientras se procesa la imagen.
3. Los resultados se mostrarán en la sección inferior.

### 5. Revisar Resultados

En la sección de resultados encontrarás:

- **Comparador interactivo**: Desliza para comparar la imagen original con la procesada.
- **Estadísticas**: Dimensiones, tamaño de archivo y porcentaje de reducción.
- **Tiempo de procesamiento**: Cuánto tardó en procesarse la imagen.
- **Acciones**: Botones para descargar la imagen procesada o verla en tamaño completo.

### 6. Procesar Otra Imagen

Para procesar otra imagen, haz clic en "Procesar otra imagen" o simplemente sube una nueva imagen en la sección "Imagen Original".

## Consejos para Obtener Mejores Resultados

### Para Redimensionamiento:

- **Mantener proporción activado**: Evita la distorsión de la imagen.
- **Reducir gradualmente**: Para grandes reducciones, considera hacerlo en pasos.
- **Dimensiones adecuadas**: Elige dimensiones apropiadas para el uso que le darás a la imagen.

### Para Reescalado:

- **Factores menores a 2x**: Las ampliaciones funcionan mejor con factores menores a 2x.
- **Reducción óptima**: Los factores entre 0.3 y 0.8 suelen ofrecer buenos resultados.

## Preguntas Frecuentes

### ¿Se pierde calidad al procesar las imágenes?

La aplicación utiliza algoritmos avanzados (LANCZOS) para minimizar la pérdida de calidad. Sin embargo, toda reducción de tamaño implica cierta pérdida de información. Para ampliaciones, se aplican técnicas de mejora para obtener el mejor resultado posible.

### ¿Dónde se guardan las imágenes procesadas?

Las imágenes se procesan en el servidor y se almacenan temporalmente. Puedes descargarlas a tu dispositivo usando el botón "Descargar". Las imágenes temporales se eliminan automáticamente después de una hora.

### ¿Qué formatos de imagen admite la aplicación?

La aplicación admite los formatos más comunes: JPG, PNG, GIF y WebP.

### ¿Hay un límite de tamaño para las imágenes?

Sí, el tamaño máximo es de 5MB por imagen.

## Solución de Problemas

### La imagen no se carga

- Verifica que el formato sea compatible (JPG, PNG, GIF, WebP).
- Asegúrate de que el tamaño del archivo sea menor a 5MB.
- Intenta con otra imagen para descartar problemas específicos.

### El procesamiento falla

- Asegúrate de introducir valores válidos en los campos.
- Para redimensionar, los valores deben estar entre 1 y 10,000 píxeles.
- Para reescalar, el factor debe estar entre 0.1 y 10.

### La comparación no funciona

- Asegúrate de que tu navegador esté actualizado.
- Intenta refrescar la página.
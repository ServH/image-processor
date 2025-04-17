import { z } from 'zod';

/**
 * Esquema base para todas las solicitudes de procesamiento de imágenes
 */
export const baseRequestSchema = z.object({
  operation: z.enum(['resize', 'rescale']),
  file: z.instanceof(File).refine((file) => {
    // Validar tipo de archivo
    return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
  }, {
    message: 'Formato de archivo no soportado. Solo se permiten JPG, PNG, GIF y WEBP',
  }).refine((file) => {
    // Validar tamaño de archivo (max 10MB)
    return file.size <= 10 * 1024 * 1024;
  }, {
    message: 'El archivo es demasiado grande. El tamaño máximo es 10MB',
  }),
});

/**
 * Esquema para solicitudes de redimensionamiento
 */
export const resizeRequestSchema = z.object({
  width: z
    .string()
    .refine((val) => !isNaN(parseInt(val)), { message: 'Width debe ser un número' })
    .transform((val) => parseInt(val))
    .refine((val) => val > 0 && val <= 10000, { 
      message: 'Width debe estar entre 1 y 10000 píxeles' 
    }),
  height: z
    .string()
    .refine((val) => !isNaN(parseInt(val)), { message: 'Height debe ser un número' })
    .transform((val) => parseInt(val))
    .refine((val) => val > 0 && val <= 10000, { 
      message: 'Height debe estar entre 1 y 10000 píxeles' 
    }),
  keepAspectRatio: z
    .string()
    .transform((val) => val === 'true'),
});

/**
 * Esquema para solicitudes de reescalado
 */
export const rescaleRequestSchema = z.object({
  scaleFactor: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), { message: 'Scale factor debe ser un número' })
    .transform((val) => parseFloat(val))
    .refine((val) => val >= 0.1 && val <= 10, { 
      message: 'Scale factor debe estar entre 0.1 y 10' 
    }),
});

/**
 * Esquema completo para validar solicitudes de procesamiento de imágenes
 * Utiliza discriminated union basado en el campo 'operation'
 */
export const imageProcessingRequestSchema = baseRequestSchema.and(
  z.discriminatedUnion('operation', [
    z.object({ operation: z.literal('resize') }).merge(resizeRequestSchema),
    z.object({ operation: z.literal('rescale') }).merge(rescaleRequestSchema),
  ])
);

/**
 * Esquema para respuestas de procesamiento exitoso
 */
export const imageProcessingResponseSchema = z.object({
  success: z.literal(true),
  url: z.string(),
  originalSize: z.number(),
  processedSize: z.number(),
  dimensions: z.tuple([z.number(), z.number()]),
});

/**
 * Esquema para respuestas de error
 */
export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z.record(z.any()).optional(),
});

/**
 * Tipo para solicitudes de redimensionamiento validadas
 */
export type ResizeRequest = z.infer<typeof resizeRequestSchema> & {
  operation: 'resize';
  file: File;
};

/**
 * Tipo para solicitudes de reescalado validadas
 */
export type RescaleRequest = z.infer<typeof rescaleRequestSchema> & {
  operation: 'rescale';
  file: File;
};

/**
 * Tipo unión para todas las solicitudes de procesamiento validadas
 */
export type ImageProcessingRequest = z.infer<typeof imageProcessingRequestSchema>;

/**
 * Tipo para respuestas de procesamiento exitoso
 */
export type ImageProcessingResponse = z.infer<typeof imageProcessingResponseSchema>;

/**
 * Tipo para respuestas de error
 */
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
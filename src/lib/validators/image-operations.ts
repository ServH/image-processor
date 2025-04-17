import { z } from 'zod';

/**
 * Esquema base para todas las operaciones de imágenes
 */
export const baseOperationSchema = z.object({
  operation: z.enum(['resize', 'rescale']),
});

/**
 * Esquema para la operación de redimensionamiento
 */
export const resizeOperationSchema = baseOperationSchema.extend({
  operation: z.literal('resize'),
  width: z.number()
    .int()
    .positive()
    .max(10000, 'El ancho máximo permitido es 10000px'),
  height: z.number()
    .int()
    .positive()
    .max(10000, 'El alto máximo permitido es 10000px'),
  keepAspectRatio: z.boolean().default(true),
});

/**
 * Esquema para la operación de reescalado
 */
export const rescaleOperationSchema = baseOperationSchema.extend({
  operation: z.literal('rescale'),
  scaleFactor: z.number()
    .positive()
    .min(0.1, 'El factor de escala mínimo es 0.1')
    .max(10, 'El factor de escala máximo es 10'),
});

/**
 * Unión discriminada para todas las operaciones posibles
 */
export const operationSchema = z.discriminatedUnion('operation', [
  resizeOperationSchema,
  rescaleOperationSchema,
]);

/**
 * Tipos inferidos de los esquemas
 */
export type BaseOperation = z.infer<typeof baseOperationSchema>;
export type ResizeOperation = z.infer<typeof resizeOperationSchema>;
export type RescaleOperation = z.infer<typeof rescaleOperationSchema>;
export type Operation = z.infer<typeof operationSchema>;
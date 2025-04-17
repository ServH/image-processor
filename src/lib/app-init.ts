import { CleanupService } from './services/cleanup-service';

/**
 * Inicializa servicios necesarios para la aplicación
 * Esta función debe ser llamada una sola vez al inicio de la aplicación
 */
export function initializeApp(): void {
  // Iniciar el servicio de limpieza automática
  CleanupService.startCleanupService();
  
  console.log('Aplicación inicializada correctamente');
}

/**
 * Limpia recursos y servicios al cerrar la aplicación
 * Esta función debe ser llamada antes de cerrar la aplicación
 */
export function shutdownApp(): void {
  // Detener el servicio de limpieza
  CleanupService.stopCleanupService();
  
  console.log('Aplicación cerrada correctamente');
}
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

interface ProcessImageParams {
  file: File;
  operation: 'resize' | 'rescale';
  options: ResizeOptions | RescaleOptions;
}

interface ResizeOptions {
  width: number;
  height: number;
  keepAspectRatio: boolean;
}

interface RescaleOptions {
  scaleFactor: number;
}

interface ProcessResult {
  success: boolean;
  error?: string;
  filePath?: string;
  originalSize?: number;
  processedSize?: number;
  dimensions?: [number, number];
  scaleFactor?: number;
}

// Esta clase se implementará en la Fase 3
export class ImageService {
  private static readonly TEMP_DIR = path.join(process.cwd(), 'public', 'temp');
  private static readonly PYTHON_SCRIPT = path.join(process.cwd(), 'src', 'python', 'image_processor.py');

  // Métodos a implementar posteriormente
}

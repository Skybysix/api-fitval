import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Extensiones permitidas según el tipo MIME del archivo
const EXTENSIONS: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
};

@Injectable()
export class PhotosService {
  // Genera un nombre único para evitar colisiones
  private newFileName(file: Express.Multer.File): string {
    return randomUUID() + EXTENSIONS[file.mimetype];
  }

  // Guarda la imagen y devuelve su URL pública
  async saveLocal(file: Express.Multer.File): Promise<string> {
    const fileName = this.newFileName(file);

    await mkdir('uploads', { recursive: true });
    await writeFile(join('uploads', fileName), file.buffer);

    return `/uploads/${fileName}`;
  }
}

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadService {
  async uploadPdf(
    file: Express.Multer.File,
    groupId: number,
  ): Promise<{ url: string; publicId: string }> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo fornecido');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Apenas arquivos PDF são permitidos');
    }

    const now = new Date();
    const baseName = `report_${
      now
        .toISOString()
        .replace(/T/, '_')
        .replace(/\..+/, '')
        .replace(/:/g, '-') + '.pdf'
    }`;

    const publicId = `reports/${groupId}/${baseName}`;

    return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', public_id: publicId },
        (error, result) => {
          if (error) {
            reject(
              new InternalServerErrorException(
                'Falha ao fazer upload para o Cloudinary: ' + error.message,
              ),
            );
            return;
          }

          if (!result) {
            reject(
              new InternalServerErrorException(
                'Resultado do upload indefinido',
              ),
            );
            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}

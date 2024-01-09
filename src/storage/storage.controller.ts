import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res, Logger, StreamableFile
} from "@nestjs/common";
import { StorageService } from './storage.service';
import { createReadStream } from 'fs';
import { Response } from 'express';

@Controller('storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  private readonly logger = new Logger(StorageController.name)

  @Get(':filename')
  getFile(@Param('filename') filename: string, @Res() res: Response) {
    this.logger.log(`Buscando fichero ${filename}`)
    const filePath = this.storageService.findFile(filename)
    this.logger.log(`Fichero encontrado ${filePath}`)
    return res.sendFile(filePath)
  }

}

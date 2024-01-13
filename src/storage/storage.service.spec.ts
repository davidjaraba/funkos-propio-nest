import { Test, TestingModule } from '@nestjs/testing'
import { StorageService } from './storage.service'
import * as fs from 'fs'
import { join } from 'path'

describe('StorageService', () => {
  let service: StorageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService],
    }).compile()

    service = module.get<StorageService>(StorageService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findFile', () => {
    it('buscar un fichero en nuestra carpeta de almacenamiento', () => {
      const fileName: string = 'hola.png'

      jest.spyOn(fs, 'existsSync').mockReturnValue(true)

      expect(service.findFile(fileName)).toEqual(
        join(
          join(
            process.cwd(),
            process.env.UPLOADS_DIR || './storage-dir',
            fileName,
          ),
        ),
      )
    })
  })

  describe('removeFile', () => {
    it('elimina un fichero en nuestra carpeta de almacenamiento', () => {
      const fileName: string = 'hola.png'

      jest.spyOn(fs, 'existsSync').mockReturnValue(true)
      jest.spyOn(fs, 'unlinkSync').mockReturnThis()

      service.removeFile(fileName)

      expect(fs.existsSync).toHaveBeenCalled()
      expect(fs.unlinkSync).toHaveBeenCalled()
    })
  })
})

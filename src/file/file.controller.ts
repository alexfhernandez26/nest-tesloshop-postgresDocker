import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helper/fileFilter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helper/fileNamer.helper';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('file')
export class FileController {

  constructor
  (
    private readonly fileService: FileService,
    private readonly configService: ConfigService
  ) {}

  @Get('product/:imageName')
  findImageName(
    @Res() res: Response,
    @Param('imageName') imageName:string
  ){
    const image = this.fileService.getStaticproducImage(imageName)

    res.sendFile(image)
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file',{
  fileFilter:fileFilter,
  storage:diskStorage({
    destination:'./static/product',
    filename:fileNamer
  })
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File){

    if(!file){
       throw new BadRequestException('File cant be empty')
    }
   
    const secretUrl =`${this.configService.get('HOST_API')}/${file.filename}` 
    return {secretUrl};
  }
  
}

  /*@Res() res: Response, En lugar de regresar el path queremos regresar la imagen, para ello  @Res() que es una response
  que utiliza Response de express, con solo esto   res.sendFile(image) nos traera la imagen que 
  genera el path*/
import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';


@Injectable()
export class FileService {

    getStaticproducImage(imageName:string){
        const path = join(__dirname, '../../static/products', imageName)

        if(!existsSync(path)){
            throw new BadRequestException('no exist pat with name',imageName)
        }

        return path;
    }
}

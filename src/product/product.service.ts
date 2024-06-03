import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validate as uuidValidate } from 'uuid';
import { ProductImage } from './entities/product-image.entity';
import { User } from 'src/auth/entities/user.entity';
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    
    @InjectRepository(ProductImage)
    private productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ) {}

  private readonly logger = new Logger("ProductService")

 async create(createProductDto: CreateProductDto,user:User) {
  const {images = [], ...productDetails} = createProductDto;

  try {
    const product = this.productRepository.create({
      ...productDetails,
      user,
      images:images.map(image => this.productImageRepository.create({url: image}))
    });
    await this.productRepository.save(product);
    return {...product,images};

  } catch (error) {
    this.handleDbExeption(error);
    
  }
  }

  //Paginacion con los argumentos take y skip

  async findAll(paginationDto: PaginationDto) :Promise<any[]> {

    const {limit=10,offset=0} = paginationDto
    const products = await this.productRepository.find({
      take:limit,
      skip:offset,
      relations:{
        images:true,
      }
    })
    return products.map( ({images,...product}) =>({
      ...product,
        images: images.map(img => img.url)
    }))
  }

  async findOne(term: string) : Promise<any| null> {
    let product : Product;
    if(uuidValidate(term)){
      product = await this.productRepository.findOneBy({ 
        id:term,
        
      });
    }else{
      var queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
      .where(`title =:title or slug =:slug`,{
        title:term,
        slug:term
      }).leftJoinAndSelect('prod.images','prodImg').getOne();
    }

    if(!product){
      throw new NotFoundException(`product with ${term} not found`);
    }

    return {...product,images:product.images.map(img => img.url)};
   
  }

  async update(id: string, updateProductDto: UpdateProductDto,user:User) {

    const {images, ...toupdate} = updateProductDto
    const product = await this.productRepository.preload({
      id,
      ...toupdate,
    })

    if(!product) throw new NotFoundException(`id ${id} dosent exist `);

    /**El uso de DataSource y createQueryRunner() es útil cuando necesitas más control sobre la ejecución de consultas,
     *  como ejecutar múltiples consultas en una transacción, ejecutar consultas con opciones específicas, etc.
     * podemos ejecutar transacciones que impacten en la db, eliminar,actualizar,insertar etc...
     * 
     * cada vez que se utilize una transaccion hay que asegurarse de 1-hacer commit de la transaccion o el rolback de la 
     * transaccion y tambien liberar el queryRunner porque si no, mantiene ese conexion en el queryRunner
     * / */
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();


      if(images){
        await queryRunner.manager.delete(ProductImage,{product: {id}})
        product.images = images.map(image => this.productImageRepository.create({url:image}))
      }else{
        product.images= await this.productImageRepository.findBy({product:{id}})
      }
      product.user = user;
      await queryRunner.manager.save(product);

      //commitTransaction() lo que hace es que si ninguna de las transacciones a dado error, aplica el commit, pero si alguna
      //da error va al catch y ahi hacemos un rollbackTransaction()
      await queryRunner.commitTransaction();
      await queryRunner.release();
      // await this.productRepository.save(product)
      return {...product,images:product.images.map(image => image.url)};     

    } catch (error) {
      await queryRunner.rollbackTransaction()
      await queryRunner.release();
      this.handleDbExeption(error);
    }
  }

  async remove(id: string) : Promise<void> {

    const queryrunner = this.dataSource.createQueryRunner();
    
    try {
      await queryrunner.connect();
      await queryrunner.startTransaction();
      const prod = await this.findOne(id)

      if(prod.images){
        await queryrunner.manager.delete(ProductImage,{product:{id}})
      }
      await queryrunner.manager.remove(Product,prod);
      await queryrunner.commitTransaction();
      await queryrunner.release();
      //await this.productRepository.remove(prod);

    } catch (error) {
      await queryrunner.rollbackTransaction();
      await queryrunner.release();
      this.handleDbExeption(error)
    }
   
  }

  private handleDbExeption(error:any){
    console.log(error)
    if(error.code === '23505')
    throw new BadRequestException(error.detail)

    this.logger.error("Error desde el logger",error)
    throw new InternalServerErrorException("Unexpectect error, check logs",error.detail)
  }

  async deleteAllProducts(){
    /*El método createQueryBuilder() en NestJS con TypeORM se utiliza para crear un objeto de tipo QueryBuilder 
    que te permite construir  consultas SQL de manera programática.*/
    var query = this.productRepository.createQueryBuilder();
    try {
      return query
             .delete()
             .where({})
             .execute()
    } catch (error) {
      this.handleDbExeption(error);
    }
  }
}

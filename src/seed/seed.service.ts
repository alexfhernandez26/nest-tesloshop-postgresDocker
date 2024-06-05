import { Injectable } from '@nestjs/common';
import { ProductService } from 'src/product/product.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { privateDecrypt } from 'crypto';
import { Repository } from 'typeorm';


@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async runSeed(){
    await this.deleteTables();
    //antes de insertar productos, insertamos usuarios
    const adminUser = await this.insertUsers()
    this.insertNewProducts(adminUser);
    return 'seed Executed'
  }

  private async deleteTables()
  {
    await this.productService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
          .delete()
          .where({})
          .execute()
  }

  private async insertUsers(){
    const seedUsers = initialData.users;
    const insertUsers: User[] = [];

    seedUsers.forEach(user => {
      insertUsers.push(this.userRepository.create(user));
    })
    const userDb = await this.userRepository.save(seedUsers);

    return userDb[0];
  }
  
  private async insertNewProducts(user: User){
    const respose = await this.productService.deleteAllProducts();
    const products = initialData.products;
    const insertPromise = [];

     products.forEach( product => insertPromise.push(this.productService.create(product,user)));

    await Promise.all(insertPromise)

    //insert all products
    return true
  }
}

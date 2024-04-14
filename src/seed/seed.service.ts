import { Injectable } from '@nestjs/common';
import { ProductService } from 'src/product/product.service';
import { initialData } from './data/seed-data';


@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductService
  ) {}

  async runSeed(){
    this.insertNewProducts();
    return 'seed Executed'
  }

  private async insertNewProducts(){
    const respose = await this.productService.deleteAllProducts();
    const products = initialData.products;
    const insertPromise = [];

    products.forEach( product => insertPromise.push(this.productService.create(product)));

    await Promise.all(insertPromise)

    //insert all products
    return true
  }
}

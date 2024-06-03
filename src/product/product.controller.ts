import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, NotFoundException, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { VALID_ROLES } from 'src/auth/interfaces/valid-roles.interface';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Auth()
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user : User
  ) {
  
    return this.productService.create(createProductDto,user);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productService.findAll(paginationDto);
  }

  @Get(':term')
  @Auth()
  async findOne(@Param('term',) term: string) {
    const result = await this.productService.findOne(term);
   
    return result;
  }

  @Patch(':id')
  @Auth(VALID_ROLES.admin)
  update(@Param('id',ParseUUIDPipe) 
          id: string,
          @Body() updateProductDto: UpdateProductDto,
          @GetUser() user: User
        ) {
    return this.productService.update(id, updateProductDto,user);
  }

  @Delete(':id')
  @Auth(VALID_ROLES.admin)
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.productService.remove(id);
  }
}

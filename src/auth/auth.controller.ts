import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { GetRowHeader } from './decorators/get-rowheaders.decorator';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { VALID_ROLES } from './interfaces/valid-roles.interface';
import { RolProtected } from './decorators/rol-protected/rol-protected.decorator';
import { Auth } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get("private")
  @UseGuards(AuthGuard())
  privateRoute(
    @Req() request:any,
    @GetUser() user : User,
    @GetUser('email') userEmail : string,
    @GetRowHeader() rowHeader: string
  ){
    return {
      ok:true,
      message:"Hola desde ruta privada",
      user
    }
  }

  @Get("private2")
 // @SetMetadata('roles',['admin','super-user'])
  @RolProtected(VALID_ROLES.admin,VALID_ROLES.user)
  @UseGuards(AuthGuard(),UserRoleGuard)
  privateRoute2(
    @GetUser() user : User,
  ){
    return{
      ok:true,
      user
    }
  }

  @Get("private3")
  @Auth(VALID_ROLES.admin)
   privateRoute3(
     @GetUser() user : User,
   ){
     return{
       ok:true,
       user
     }
   }
}

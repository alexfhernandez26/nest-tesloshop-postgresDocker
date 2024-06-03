import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from "bcrypt";
import { LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private userRepository : Repository<User>,
    private jwtService: JwtService,
  ){}

  async create(createUserDto: CreateUserDto) {
    try {
      console.log("data del usuario:", createUserDto.fullname)
      const {password, ...userData} = createUserDto;
     const user = this.userRepository.create({
      ...userData,
      password: bcrypt.hashSync(password,10)
     })
     await this.userRepository.save(user)
     console.log("data del usuario 2:", user)
     return {
      ...user,
      token: this.getJwtToken({id: user.id, email : user.email})
     };
     //TODO: RETORNAR JWT
     
    } catch (error) {
     this.handleDbError(error)
      console.log(error)
    }
  }

  async login(loginUserDto:LoginUserDto){
    try {
      const {email,password} = loginUserDto;
      const user = await this.userRepository.findOne({
        where:{email},
        select:{email:true,password:true,id:true}
      })

      if(!user)
        throw new UnauthorizedException('Credentials are not valid (email)')
      
      if(!bcrypt.compareSync(password,user.password))
        throw new UnauthorizedException('Credentials are not valid (password)')

      return {
        ...user,
        token: this.getJwtToken({id : user.id})
       };
       
    } catch (error) {
      this.handleDbError(error)
    }
  }

  private getJwtToken(payload: JwtPayload){
    const token = this.jwtService.sign(payload);
    return token;
  }
  private handleDbError(error:any)
  {
    console.log("Este es el error", error)
    if(error.code === '23505')
    {
      throw new BadRequestException(error.detail);    
    }
   
    throw new InternalServerErrorException('please cheks logs')
  }
}

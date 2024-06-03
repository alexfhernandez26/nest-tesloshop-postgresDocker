import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        configService : ConfigService
    ) {
        super({
            
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration:false,
            
        })
    }
    async validate(payload:JwtPayload) : Promise<User>{
        console.log("payload en strategi",payload)
        const {id} = payload;
        const user = await this.userRepository.findOneBy({id});
        console.log("user desde strategi",user)
        if(!user)
            throw new UnauthorizedException('Invalid Token ');
        if(!user.isActive)
            throw new UnauthorizedException('Invalid Token, user is inactive');

        return user;
    }
}
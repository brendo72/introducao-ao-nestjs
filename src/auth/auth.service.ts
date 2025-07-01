import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {

    constructor(
        // private jwt: JwtService, 
        private prisma: PrismaService
    ){}

    async registerUser(userData: RegisterUserDto) {
        const userExists = await this.prisma.user.findUnique({
            where: {email: userData.email}
        })

        if(userExists){
            throw new ConflictException("Email já está em uso!")
        }

        const hashedPassword = await bcrypt.hash(
            userData.password, 10)


        const newUser = await this.prisma.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                password: hashedPassword
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        })
        
        return newUser;
    }




}

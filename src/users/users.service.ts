import { Injectable, Post } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { User } from "@prisma/client";
@Injectable()
export class UserService {

    constructor(private prisma: PrismaService){}

    async create(data: Prisma.UserCreateInput): Promise<User>{
        return this.prisma.user.create({data})
    }

    

}
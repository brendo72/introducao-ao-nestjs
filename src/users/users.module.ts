import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { Userservice } from "./users.service";
import { PrismaModule } from "src/prisma/prisma.module";
@Module({
    controllers:[UsersController],
    providers:[Userservice],
    imports:[PrismaModule]
})
export class userModule{}

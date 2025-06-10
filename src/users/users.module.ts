import { Module } from "@nestjs/common";
import { usercontroller } from "./users.controller";
import { Userservice } from "./users.service";
@Module({
    controllers:[usercontroller],
    providers:[Userservice]
})
export class userModule{}
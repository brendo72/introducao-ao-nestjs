import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Userservice, } from "./users.service";



@Controller("/users")
export class usercontroller{
    private userservice:Userservice
    constructor(userservice: Userservice){
        this.userservice = userservice
    }
    @Get()
    findAllusers(){
        return this.userservice.findAll()
    }
    @Get(':id')
    findOneUser(@Param('id') id:string){
        return this.userservice.findOne(parseInt(id))
    }
    @Post()
    createUser(@Body() user:{name:string,email:string}){
        return this.userservice.create(user)
    }
}
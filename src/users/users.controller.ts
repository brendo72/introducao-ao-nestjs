import {Body, Controller, Get, Param, Post, Put} from '@nestjs/common'
import { UserService } from './users.service'

@Controller('/user')
export class UsersController {

    private userService: UserService

    constructor(userService: UserService){
        this.userService = userService
    }

    @Get()
    findAllUsers(){
        return this.userService.findAll()
    }

    @Get(':id')
    findOneUser(@Param('id') id:string){
        return this.userService.findOne(parseInt(id))
    }

    @Post()
    createUser(@Body() user: {name:string, email:string}){
        return this.userService.create(user)
    }

    /**Exercício rápido: 
        Crie uma rota para atualizar usuário, recebendo 
        o Id do usuário a ser atualizado e as novas
        informações de usuário.  */


}
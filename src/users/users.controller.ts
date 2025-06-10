import {Body, Controller, Get, Param, Post, Put} from '@nestjs/common'
import { UserService } from './users.service'

@Controller('/user')
export class UsersController {

    private userService: UserService

    constructor(userService: UserService){
        this.userService = userService
    }

    // Rota criar usuário
    @Post()
    create(@Body() data: any){
        return this.userService.create(data)
    }

    


}
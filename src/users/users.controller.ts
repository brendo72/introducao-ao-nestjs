import {Body, Controller, Get, Param, Post, Put, Delete} from '@nestjs/common'
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

    @Get()
    findAll(){
        return this.userService.findAll()
    }

    @Get(':id')
    findOne( @Param('id') id: string) {
        return this.userService.findOne(id)
    }

    @Put(':id')
    update( @Param('id') id: string, @Body() data:any){
        return this.userService.update(id, data)
    }

    @Delete(':id')
    remove( @Param('id') id: string){
        return this.userService.remove(id)
    }

}
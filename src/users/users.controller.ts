import {Body, Controller, Get, Param, Post, Put, Delete, UseGuards} from '@nestjs/common'
import { UserService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { ApiOperation, ApiBody, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger'
import { UpdateUserDto } from './dto/update-user.dto'
import { JwtAuthGuard } from 'src/auth/jwt.guard'

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('/user')
export class UsersController {

    private userService: UserService

    constructor(userService: UserService){
        this.userService = userService
    }

    // Rota criar usuário
    // @Post()
    // @ApiOperation({summary: 'Criar um novo usuário'})
    // @ApiBody({type: CreateUserDto})
    // @ApiResponse({status:201, description: 'Usuário criado com sucesso!'})
    // create(@Body() data: CreateUserDto){
    //     return this.userService.create(data)
    // }

    @Get()
    findAll(){
        return this.userService.findAll()
    }

    @Get(':id')
    findOne( @Param('id') id: string) {
        return this.userService.findOne(id)
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar um usuário' })
    @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
    @ApiParam({ name: 'id', type: Number, description: 'ID do usuário' })
    @ApiBody({ type: UpdateUserDto })
    @Put(':id')
    update( @Param('id') id: string, @Body() data:any){
        return this.userService.update(id, data)
    }

    @Delete(':id')
    remove( @Param('id') id: string){
        return this.userService.remove(id)
    }

}
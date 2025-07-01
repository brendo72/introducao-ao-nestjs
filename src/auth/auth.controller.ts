import { Body, Controller, Post } from '@nestjs/common';
import { RegisterUserDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { ApiBody, ApiConflictResponse, ApiCreatedResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService){}
    
    @Post('register')
    @ApiBody({type: RegisterUserDto})
    @ApiCreatedResponse({
        description: "Usuário registrado com sucesso!"
    })
    @ApiConflictResponse({
        description: "Email já em uso!"
    })
    async registerUser(@Body() userData: RegisterUserDto){
        return this.authService.registerUser(userData)
    }



}

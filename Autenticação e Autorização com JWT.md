## Tutorial: Módulo de Autenticação com NestJS, Prisma e AuthGuard

### Introdução
Neste tutorial, vamos implementar um sistema de autenticação completo com NestJS, Prisma e AuthGuard. O objetivo é criar um módulo de autenticação que permita o registro de usuários, login e proteção de rotas.
#### Etapas da implementação:
1. Atualizar o modelo User no Prisma Schema

2. Rodar a migração

3. Instalar dependências necessárias

4. Criar o módulo de autenticação

5. Criar os DTOs de autenticação

6. Criar o AuthService

7. Criar o AuthController

8. Implementar AuthGuard com JWT

9. Proteger rotas por Role

### 1. Atualizar o modelo User no Prisma Schema
Abra o arquivo `prisma/schema.prisma` e adicione os campos `password` e `role` ao modelo `User`:

```prisma
model User {
  id       Int    @id @default(autoincrement())
  name     String
  email    String @unique
  password String
  role     Role   @default(TURISTA)
}

enum Role {
  ADMIN
  TURISTA
}
```
 #### 1.1 Rode o comando para fazer a migração:
```bash
npx prisma migrate dev --name add_password_and_role_to_user
```

### 2. Instalar dependências necessárias
Instale as dependências necessárias para autenticação e criptografia de senhas:
```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt
```

### 3. Criar o módulo de autenticação
Crie o módulo de autenticação com o comando:
```bash
nest g module auth
nest g service auth
nest g controller auth
```

### 4. Criar os DTOs de autenticação
Crie os DTOs para o registro e login de usuários. Crie um diretório `dto` dentro do módulo `auth` e adicione os seguintes arquivos:
#### `login.dto.ts`
```typescript
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```
#### `login-response.dto.ts`
```typescript 
export class LoginResponseDto {
  access_token: string;
}
```
#### `register.dto.ts`
```typescript
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'User name',
    example: 'John Doe'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'jonas@gmail.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    minLength: 6,
    example: 'password123'
  })
  @IsString()
  @MinLength(6)
  password: string;

}
```


### 5. Implementar o AuthService
Abra o arquivo `auth.service.ts` e implemente os métodos de registro e login. O serviço também deve lidar com a geração de tokens JWT.
```typescript
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(private jwt: JwtService, private prisma: PrismaService) { }

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new UnauthorizedException('Credenciais inválidas');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedException('Credenciais inválidas');

        return user;
    }

    async login(dto: LoginDto) {
        const user = await this.validateUser(dto.email, dto.password);

        const payload = {
            sub: user.id,
            role: user.role,
            email: user.email,
        };

        return {
            access_token: this.jwt.sign(payload),
        };
    }

    async register(dto: RegisterDto) {
        const userExists = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (userExists) {
            throw new ConflictException('Email já está em uso');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        return user;
    }
}
```

### 6. Implementar o AuthController
Abra o arquivo `auth.controller.ts` e implemente os endpoints de registro e login. Utilize os DTOs criados anteriormente.
```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { ApiTags, ApiBody, ApiCreatedResponse, ApiConflictResponse, ApiParam } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @ApiBody({ type: LoginDto })
    async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
        return this.authService.login(dto);
    }

    @Post('register')
    @ApiBody({ type: RegisterDto })
    @ApiCreatedResponse({ description: 'Usuário registrado com sucesso' })
    @ApiConflictResponse({ description: 'Email já em uso' })
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }
}
```

### 7. Implementar o JWT Guard e Strategy
Crie um arquivo `jwt.strategy.ts` dentro do diretório `auth` e implemente a estratégia JWT para autenticação.
```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'jwt_secret', // ideal usar env
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
```
Então, crie o arquivo `jwt.guard.ts` para proteger as rotas usando o AuthGuard do NestJS.
```typescript
import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```


### 8. Crie um guard para validar se um usuário é TURISTA
Crie um arquivo `turista.guard.ts` para proteger as rotas que exigem o papel de TURISTA.
```typescript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class TuristaGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user?.role === 'TURISTA';
  }
}
```
### 9. Crie um guard para validar se um usuário é ADMIN
Crie um arquivo `admin.guard.ts` para proteger as rotas que exigem o papel de ADMIN.
```typescript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user?.role === 'ADMIN';
  }
}
```
### 10. Protegendo rotas com os guards
Agora, você pode proteger suas rotas usando os guards criados. No controller de user, você pode fazer algo assim:
```typescript
@ApiTags('users') 
@UseGuards(JwtAuthGuard) // Protege todas as rotas deste controller com JWT
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({ summary: 'Criar um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiBody({ type: CreateUserDto })
  @ApiBearerAuth() // Protege esta rota com autenticação JWT na documentação Swagger
  @UseGuards(AdminGuard) // Apenas usuários com papel de ADMIN podem criar novos usuários
  create(@Body() data: CreateUserDto) {
    return this.usersService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso.' })
  @ApiBearerAuth()
  @UseGuards(TuristaGuard) // Permite acesso a usuários com papel de TURISTA
  findAll() {
    return this.usersService.findAll();
  }
  
```
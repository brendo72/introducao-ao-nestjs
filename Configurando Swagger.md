# Configurando Swagger
O Swagger é uma ferramenta poderosa para documentar APIs RESTful. Ele permite que você visualize e interaja com a API diretamente do navegador, facilitando o entendimento e o teste das rotas disponíveis.

### 1. Instalação do Swagger
Para configurar o Swagger no seu projeto NestJS, você precisa instalar o pacote `@nestjs/swagger` e o `swagger-ui-express`. Execute o seguinte comando:

```bash
npm install @nestjs/swagger swagger-ui-express
```

### 2. Configuração do Swagger
No arquivo principal do seu aplicativo (geralmente `main.ts`), você precisa importar e configurar o Swagger. Aqui está um exemplo de como fazer isso:

```typescript
    import { NestFactory } from '@nestjs/core';
    import { AppModule } from './app.module';
    import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

    async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Configurações da documentação Swagger
    const config = new DocumentBuilder()
        .setTitle('API de Usuários')
        .setDescription('Documentação da API de usuários com NestJS + Prisma + Swagger')
        .setVersion('1.0')
        .addTag('users') // Tag opcional para categorizar as rotas
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document); // Acessível em http://localhost:3000/api

    await app.listen(3000);
    }
    bootstrap();
```
#### Explicação do Código:
- **DocumentBuilder**: Usado para construir a configuração do Swagger, incluindo título, descrição e versão da API.
    - **setTitle**: Define o título da documentação.
    - **setDescription**: Fornece uma descrição detalhada da API.
    - **setVersion**: Define a versão da API.
    - **addTag**: Permite categorizar as rotas, facilitando a navegação na documentação.
- **SwaggerModule.createDocument**: Cria o documento Swagger com base no módulo da aplicação e na configuração definida.
- **SwaggerModule.setup**: Configura o Swagger para ser acessível em uma rota específica (neste caso, `/api`).

### 3. Criação de DTOs e Decoradores para Documentação
Para que o Swagger possa gerar a documentação corretamente, você deve usar Data Transfer Objects (DTOs) e decoradores (como `@ApiProperty`) para descrever as propriedades dos objetos que serão enviados e recebidos nas requisições.

**DTOs são usados para definir a estrutura dos dados que serão enviados e recebidos nas requisições.
Por exemplo, se você tiver um endpoint para criar um usuário, você pode definir um DTO que descreva os campos esperados, o que serve para validar os dados e gerar a documentação automaticamente.**
  
Aqui está um exemplo de como criar um DTO e usar decoradores do Swagger:

- 3.1 Crie o arquivo `users/dto/create-user.dto.ts` e implemente o seguinte código:

```typescript
    import { ApiProperty } from '@nestjs/swagger';

    export class CreateUserDto {
    @ApiProperty({ example: 'Jonas Fortes', description: 'Nome completo do usuário' })
    name: string;

    @ApiProperty({ example: 'jonas@example.com', description: 'Email do usuário' })
    email: string;
    }

```
- 3.2 crie o arquivo `users/dto/update-user.dto.ts` e implemente o seguinte código:

```typescript
    import { PartialType } from '@nestjs/swagger';
    import { CreateUserDto } from './create-user.dto';

    export class UpdateUserDto extends PartialType(CreateUserDto) {}
```
#### Explicação do Código:
- **ApiProperty**: Decorador usado para descrever as propriedades do DTO. Ele aceita um objeto com `example` e `description`, que serão usados pelo Swagger para gerar a documentação.
- **PartialType**: Utilizado para criar um DTO de atualização que herda as propriedades do DTO de criação, tornando todas as propriedades opcionais.



### 4. Uso dos DTOs no Controller
Agora, você pode usar os DTOs nos seus controladores para documentar as rotas. Aqui está um exemplo de como fazer isso no seu `users.controller.ts`:

```typescript
    import { 
    Controller, Get, Post, Body, Param, Put, Delete 
    } from '@nestjs/common';
    import { UsersService } from './users.service';
    import { CreateUserDto } from './dto/create-user.dto';
    import { UpdateUserDto } from './dto/update-user.dto';
    import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

    @ApiTags('users') // Tag para agrupar essas rotas no Swagger
    @Controller('users')
    export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @ApiOperation({ summary: 'Criar um novo usuário' })
    @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
    @ApiBody({ type: CreateUserDto })
    create(@Body() data: CreateUserDto) {
        return this.usersService.create(data);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todos os usuários' })
    @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso.' })
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar um usuário por ID' })
    @ApiResponse({ status: 200, description: 'Usuário encontrado.' })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
    @ApiParam({ name: 'id', type: Number, description: 'ID do usuário' })
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar um usuário' })
    @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
    @ApiParam({ name: 'id', type: Number, description: 'ID do usuário' })
    @ApiBody({ type: UpdateUserDto })
    update(@Param('id') id: string, @Body() data: UpdateUserDto) {
        return this.usersService.update(+id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remover um usuário' })
    @ApiResponse({ status: 200, description: 'Usuário removido com sucesso.' })
    @ApiParam({ name: 'id', type: Number, description: 'ID do usuário' })
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }
    }
```

#### Anotações Swagger usadas no Controller:
- **@ApiTags**: Agrupa as rotas sob uma tag específica no Swagger.
- **@ApiOperation**: Descreve a operação de cada rota, fornecendo um resumo.
- **@ApiResponse**: Define as respostas esperadas para cada rota, incluindo status e
descrição.
- **@ApiParam**: Documenta os parâmetros de rota, como o ID do usuário
- **@ApiBody**: Especifica o tipo de corpo esperado para as requisições POST e PUT, referenciando o DTO correspondente.

### 5. Acessando a Documentação Swagger
Após configurar o Swagger, você pode acessar a documentação da sua API no navegador. Inicie o servidor NestJS e abra o seguinte URL:

```
http://localhost:3000/api
```
Você verá uma interface interativa onde pode explorar as rotas, ver os detalhes dos parâmetros e testar as requisições diretamente.
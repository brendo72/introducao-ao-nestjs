## Validação com Class-validator no NestJS

### 1. Instalação

Para utilizar o `class-validator` no NestJS, você precisa instalar os pacotes necessários. Execute o seguinte comando:

```bash
npm install class-validator class-transformer
```

### 2. Configuração

No arquivo `main.ts`, você precisa habilitar a validação globalmente. Adicione o seguinte código:

```typescript
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita a validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não decoradas no DTO
      forbidNonWhitelisted: true, // Retorna erro se enviar propriedades não permitidas
      transform: true, // Transforma os tipos automaticamente (ex: string para number)
    })
  );

  await app.listen(3000);
}
bootstrap();
```

### 3. Criação de um DTO (Data Transfer Object)

Agora você pode adicionar validações aos seus DTOs. Por exemplo, no arquivo `create-user.dto.ts`:

```typescript
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsNotEmpty } from "class-validator";

export class CreateUserDto {
  @ApiProperty({
    example: "Jonas Fortes",
    description: "Nome completo do usuário",
  })
  @IsString({ message: "O nome deve ser uma string" })
  @IsNotEmpty({ message: "O nome é obrigatório" })
  name: string;

  @ApiProperty({
    example: "jonas@example.com",
    description: "Email do usuário",
  })
  @IsEmail({}, { message: "O email deve ser um endereço de email válido" })
  email: string;
}
```

## 4. Exemplos de Anotações de Validação:
Aqui está uma lista das principais notações disponíveis:
### Validações Básicas:
- `@IsString()`: Verifica se o valor é uma string.
- `@IsInt()`: Verifica se o valor é um número inteiro.
- `@IsNumber()`: Verifica se o valor é um número.
- `@IsBoolean()`: Verifica se o valor é um booleano.
- `@IsDate()`: Verifica se o valor é uma data.
- `@IsEmail()`: Verifica se o valor é um email válido.
- `@IsUrl()`: Verifica se o valor é uma URL válida.

### Validações de String:
- `@IsNotEmpty()`: Verifica se o valor não está vazio.
- `@Length(min, max)`: Verifica se o comprimento da string está dentro dos limites especificados.
- `@MinLength(length)`: Verifica se o comprimento mínimo da string é o especificado.
- `@MaxLength(length)`: Verifica se o comprimento máximo da string é o especificado.
- `@Matches(regex, { message: "Mensagem de erro" })`: Verifica se a string corresponde a uma expressão regular.
- `@IsAlpha()`: Verifica se a string contém apenas letras.
- `@IsAlphanumeric()`: Verifica se a string contém apenas letras e números.
- `@IsLowercase()`: Verifica se a string está em minúsculas.
- `@IsUppercase()`: Verifica se a string está em maiúsculas.

### Validações de Número:
- `@IsPositive()`: Verifica se o número é positivo.
- `@IsNegative()`: Verifica se o número é negativo.
- `@Min(value)`: Verifica se o número é maior ou igual ao valor especificado.
- `@Max(value)`: Verifica se o número é menor ou igual ao valor especificado.
- `@IsIn([value1, value2, ...])`: Verifica se o número está dentro de um conjunto de valores permitidos.
- `@IsNotIn([value1, value2, ...])`: Verifica se o número não está em um conjunto de valores proibidos.
- `@IsDivisibleBy(value)`: Verifica se o número é divisível pelo valor especificado.

### Validações de Array:
- `@IsArray()`: Verifica se o valor é um array.
- `@ArrayNotEmpty()`: Verifica se o array não está vazio.
- `@ArrayMinSize(size)`: Verifica se o array tem um tamanho mínimo.
- `@ArrayMaxSize(size)`: Verifica se o array tem um tamanho máximo.
- `@ArrayContains([value1, value2, ...])`: Verifica se o array contém todos os valores especificados.
- `@ArrayNotContains([value1, value2, ...])`: Verifica se o array não contém nenhum dos valores especificados.
- `@ArrayUnique()`: Verifica se todos os valores do array são únicos.
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule)
  const config = new DocumentBuilder()
  .setTitle('API de Users')
  .setDescription(
    'Documentação da API de usuários com NestJS + Prisma + Swagger'
  )
  .setVersion('1.0')
  .addTag('users')
  .build() // Construir a configuração

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  await app.listen(3000)
}
bootstrap();

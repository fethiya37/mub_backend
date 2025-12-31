import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  const config = new DocumentBuilder()
    .setTitle(process.env.APP_NAME ?? 'MUB Foreign Employment Agent System')
    .setDescription('MUB Foreign Employment Agent System API')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer'
    )
    .addApiKey(
      { type: 'apiKey', name: 'X-Draft-Token', in: 'header', description: 'Raw draft token value' },
      'draft'
    )
    .build();


  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.APP_PORT ? Number(process.env.APP_PORT) : 3000);
}
bootstrap();

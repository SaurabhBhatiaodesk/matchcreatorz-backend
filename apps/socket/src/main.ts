import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { HttpExceptionFilter } from 'common/filters';
import { ResponseInterceptor } from 'common/interceptors';
import * as fs from 'fs'
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { JwtUtility } from 'common/utils';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // Load environment variables from .env file
  dotenv.config({ path: '.env.socket' });
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    process.env.SERVER_MODE === 'https'
      ? {
          httpsOptions: {
            key: fs.readFileSync(process.env.SSL_KEY_PATH, 'utf8'),
            cert: fs.readFileSync(process.env.SSL_CERT_PATH, 'utf8'),
            ca: fs.readFileSync(process.env.SSL_CA_PATH, 'utf8'),
          },
        }
      : undefined, // Use HTTP in development
  );
  //swagger configuration
  const options = new DocumentBuilder()
    .setTitle('Socket API')
    .setDescription('Socket related operations')
    .setVersion('1.0')
    .addServer(`http://192.168.0.16:${process.env.PORT}/`, 'Local')
    .addServer(`http://192.168.0.107:${process.env.PORT}/`, 'Local')
    .addServer(`https://konstantlab.com:${process.env.PORT}/`, 'Staging')
    .addServer(`https://chat.matchcreatorz.com:3180/`, 'Live')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('socket-docs', app, document);

  // view config
  app.setBaseViewsDir(join(__dirname, 'views'));
  app.setViewEngine('ejs');
  // global filters
  app.useGlobalFilters(new HttpExceptionFilter());
  // global interceptors
  app.useGlobalInterceptors(new ResponseInterceptor());
  // jwt config
  const configService = app.get(ConfigService);
  JwtUtility.init(configService);
  app.enableCors();
  await app.listen(process.env.PORT);
}
bootstrap();

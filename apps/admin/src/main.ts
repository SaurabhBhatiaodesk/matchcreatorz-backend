import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { HttpExceptionFilter } from 'common/filters';
import { ResponseInterceptor } from 'common/interceptors';
import * as fs from 'fs';
import { JwtUtility } from 'common/utils';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // Load environment variables from .env file
  dotenv.config({ path: '.env.admin' });
  const app = await NestFactory.create(
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
    .setTitle('Admin API')
    .setDescription('Admin related operations')
    .setVersion('1.0')
    .addServer(`http://192.168.0.16:${process.env.PORT}/`, 'Local')
    .addServer(`http://192.168.0.107:${process.env.PORT}/`, 'Local')
    .addServer(`https://konstantlab.com:${process.env.PORT}/`, 'Staging')
    .addServer(`https://api.matchcreatorz.com:3170/`, 'Live')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);
  //global filters
  app.useGlobalFilters(new HttpExceptionFilter());
  //global interceptors
  app.useGlobalInterceptors(new ResponseInterceptor());
  //jwt config
  const configService = app.get(ConfigService);
  JwtUtility.init(configService);
  
  await app.listen(process.env.PORT);
}
bootstrap();

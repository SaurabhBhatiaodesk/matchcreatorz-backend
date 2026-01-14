import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { HttpExceptionFilter } from 'common/filters';
import { ResponseInterceptor } from 'common/interceptors';
import * as fs from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { JwtUtility } from 'common/utils';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // Load environment variables from .env file
  dotenv.config({ path: '.env.user' });
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
  // Simple request logger to debug issues like "Failed to fetch" from Swagger / clients
  app.use((req, res, next) => {
    // Basic request info
    console.log('--- Incoming Request ---');
    console.log('URL:', req.method, req.originalUrl || req.url);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));

    // Log body only for non‑GET to avoid noise; body parser may not yet have run for very large streams
    if (req.method !== 'GET') {
      console.log('Body:', req.body);
    }
    console.log('------------------------');
    next();
  });
  //swagger configuration
  const options = new DocumentBuilder()
    .setTitle('User API')
    .setDescription('User related operations')
    .setVersion('1.0')
    .addServer(`http://192.168.0.16:${process.env.PORT}/`, 'Local')
    .addServer(`http://192.168.0.107:${process.env.PORT}/`, 'Local')
    .addServer(`https://konstantlab.com:${process.env.PORT}/`, 'Staging')
    .addServer(`https://api.matchcreatorz.com/`, 'Live')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

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

  await app.listen(process.env.PORT);
}
bootstrap();

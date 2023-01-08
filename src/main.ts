import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { InitLogger } from './logger/initializer';
import * as displayRoutes from 'express-routemap';
import LOGGER_CONFIG from './config/logger.config';

import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { InitProducer } from './rabbit-mq/initializer';

async function initFastify(): Promise<NestFastifyApplication> {
  const isFastifyLogger: boolean = process.env.FASTIFY_FM_LOGGER === 'enabled';
  const configFastify = { logger: isFastifyLogger };
  return NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(configFastify)
  );
}

async function initExpress(): Promise<NestExpressApplication> {
  return NestFactory.create<NestExpressApplication>(AppModule);
}

/**
 * Se deja elegir fastify o express como FM vars de entorno
 */
async function bootstrap() {
  InitLogger.setConfig(LOGGER_CONFIG);

  const isFastify: boolean = process.env.FASTIFY_FM_HTTP === 'enabled';

  const app = await (isFastify ? initFastify() : initExpress());

  const configService = app.get(ConfigService);
  InitLogger.addTracing(
    app,
    LOGGER_CONFIG.nameSpaceHook,
    configService.get<string>('appConfig.app_name')
  );
  const options = new DocumentBuilder()
    .setTitle(configService.get<string>('appConfig.app_name'))
    .setDescription('Failed transaction query engine due to timeout')
    .setVersion(configService.get<string>('appConfig.app_version'))
    .addTag('')
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('swagger', app, document);

  const appPort: number = isFastify
    ? configService.get<number>('appConfig.fastify_port')
    : configService.get<number>('appConfig.express_port');

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages:
        configService.get<string>('appConfig.env') == 'PROD' ? true : false
    })
  );
  await InitProducer.init(configService.get<any>('appConfig.rabbitConfig'));
  await app.listen(appPort, () => {
    /* eslint-disable */
    console.log(`\x1b[33m starting  the microservice [ ${configService.get('appConfig.app_name')} ]. at ${Date().toString()}`);
    console.log(`\x1b[34m listening on port ${appPort}`);
    console.log(`\x1b[32m running environment NODE_ENV=${configService.get('appConfig.env')}`);
    /* eslint-enable */
    const server = app.getHttpServer();
    const router = server._events.request._router;
    displayRoutes(router);
  });
}
bootstrap();

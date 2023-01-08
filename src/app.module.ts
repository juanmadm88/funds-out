import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configValidationSchema } from './schemas/app.schema';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appConfig } from './config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { InterceptorMiddleware } from './middlewares/interceptor.middleware';
import { FundOutModule } from './fund-out/fund-out.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      load: [appConfig]
    }),
    FundOutModule,
    CacheModule.register({ isGlobal: true })
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: InterceptorMiddleware }
  ]
})
export class AppModule {}

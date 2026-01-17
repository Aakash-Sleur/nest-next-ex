import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bullmq';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
        },
      }),
    }),
    EmailModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

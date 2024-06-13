import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './user/user.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/accounting'),
    UsersModule,
    RabbitMQModule,
  ],
})
export class AppModule {}
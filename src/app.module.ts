import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerModule } from './customer/customer.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/learning'),
    CustomerModule,
    RabbitMQModule,
  ],
})
export class AppModule {}


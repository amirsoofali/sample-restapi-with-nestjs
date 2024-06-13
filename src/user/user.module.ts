import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { User, UserSchema } from './user.schema';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import {HttpModule} from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    HttpModule,
    RabbitMQModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

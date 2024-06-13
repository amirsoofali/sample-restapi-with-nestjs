import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection;
  private channelWrapper;

  onModuleInit() {
    this.connection = amqp.connect(['amqp://localhost:5672']);
    this.channelWrapper = this.connection.createChannel({
      setup: channel => channel.assertQueue('users_queue', { durable: true })
    });
  }

  async sendToQueue(message: any) {
    await this.channelWrapper.sendToQueue('users_queue', Buffer.from(JSON.stringify(message)), {
      contentType: 'application/json',
    });
  }

  async onModuleDestroy() {
    await this.connection.close();
  }
}
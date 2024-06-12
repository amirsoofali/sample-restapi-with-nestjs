import { Controller, Get, Post, Body } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { Customer } from './customer.schema';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Controller('customer')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly rabbitMQService: RabbitMQService
  ) {}

  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = await this.customerService.create(createCustomerDto);
    await this.rabbitMQService.sendToQueue(customer);
    return customer;
  }

  @Get()
  async findAll(): Promise<Customer[]> {
    return this.customerService.findAll();
  }
}
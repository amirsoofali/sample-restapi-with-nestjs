import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from './customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomerService {
  constructor(@InjectModel(Customer.name) private customerModel: Model<Customer>) { }

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const createdCustomer = new this.customerModel(createCustomerDto);
    return createdCustomer.save();
  }

  async findAll(): Promise<Customer[]> {
    return this.customerModel.find().exec();
  }
}
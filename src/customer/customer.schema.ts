import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Customer extends Document {
  @Prop()
  firtName: string;

  @Prop()
  lastName: string;

  @Prop()
  mobileNo: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
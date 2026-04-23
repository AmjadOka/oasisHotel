import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Employee extends Document {
  @Prop({ type: String, required: true })
  fullName: string;

  @Prop({ type: String, required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String })
  role: string;

  @Prop({ type: String })
  gender?: string;

  @Prop({ type: String })
  avatar?: string;

  @Prop({ type: String })
  phoneNumber?: string;

  @Prop({ type: String })
  address?: string;

  @Prop({ type: String })
  resetTokenHash?: string;

  @Prop({ type: String })
  resetCode?: string;

  @Prop({ type: Date })
  resetExpires?: Date;

  @Prop({ type: Boolean, default: false })
  isResetVerified?: boolean;

  @Prop({ type: Boolean, default: true })
  active?: boolean;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

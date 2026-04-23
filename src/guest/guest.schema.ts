import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Guest extends Document {
  @Prop({ type: String, required: true })
  fullName: string;

  @Prop({ type: String, required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ type: String })
  nationality: string;

  @Prop({ type: String })
  nationalID: string;

  @Prop({ type: String })
  countryFlag: string;
}

export const GuestSchema = SchemaFactory.createForClass(Guest);

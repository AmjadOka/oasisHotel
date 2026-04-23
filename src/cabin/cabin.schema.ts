import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Cabin extends Document {
  @Prop({ type: String, required: true, unique: true, trim: true })
  name: string;

  @Prop({ type: Number, required: true, min: 1 })
  maxCapacity: number;

  @Prop({ type: Number, required: true, min: 0 })
  regularPrice: number;

  @Prop({ type: Number, default: 0, min: 0 })
  discount: number;

  @Prop({ type: String, required: true })
  image: string;

  @Prop({ type: String, required: true, trim: true })
  description: string;
}

export const CabinSchema = SchemaFactory.createForClass(Cabin);

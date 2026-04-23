import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Cabin } from "src/cabin/cabin.schema";
import { Guest } from "src/guest/guest.schema";
import { UUID } from "typeorm/driver/mongodb/bson.typings.js";

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Cabin.name,
    required: true,
  })
  cabinId: Cabin;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Guest.name,
    required: true,
  })
  guestId: Guest;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ type: Number, required: true })
  numNights: number;

  @Prop({ type: Number, required: true })
  numGuests: number;

  @Prop({ type: Number, required: true })
  cabinPrice: number;

  @Prop({ type: Number, default: 0 })
  extrasPrice: number;

  @Prop({ type: Number, required: true })
  totalPrice: number;

  @Prop({
    type: String,
    default: "unconfirmed",
    enum: ["unconfirmed", "checked-in", "checked-out"],
  })
  status: string;

  @Prop({ type: Boolean, default: false })
  hasBreakfast: boolean;

  @Prop({ type: Boolean, default: false })
  isPaid: boolean;

  @Prop()
  observations: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: UUID, required: true })
  bookingGroupId: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
BookingSchema.index({ cabinId: 1, date: 1 }, { unique: true });
BookingSchema.index({ guestId: 1, date: 1 }, { unique: true });

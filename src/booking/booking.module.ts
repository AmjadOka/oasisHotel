import { Module } from "@nestjs/common";
import { BookingService } from "./booking.service";
import { BookingController } from "./booking.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Booking, BookingSchema } from "./booking.schema";
import { Cabin, CabinSchema } from "src/cabin/cabin.schema";
import { Guest, GuestSchema } from "src/guest/guest.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Cabin.name, schema: CabinSchema },
      { name: Guest.name, schema: GuestSchema },
    ]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}

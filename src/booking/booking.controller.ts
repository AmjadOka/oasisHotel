import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { BookingService } from "./booking.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { AuthGuard } from "src/employee/guard/Auth.guard";
import { Roles } from "src/employee/decorator/employee.docerator";

interface updateBookingDto {
  cabinId: string;
  guestId: string;
  startDate: string;
  endDate: string;
  numGuests: number;
  status?: string;
  isPaid?: boolean;
  observations?: string;
  hasBreakfast: boolean;
}
@Controller("/bookings")
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Roles(["employee", "manager"])
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createBookingDto: CreateBookingDto) {
    console.log(createBookingDto, "create bok");
    return this.bookingService.create(createBookingDto);
  }

  @Roles(["manager"])
  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.bookingService.findAll(query);
  }

  @Roles(["manager"])
  @UseGuards(AuthGuard)
  @Get()
  findAllForAdmin() {
    return this.bookingService.findAllForAdmin();
  }

  @Roles(["employee", "manager"])
  @UseGuards(AuthGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.bookingService.findGuestBookings(id);
  }

  @Roles(["employee"])
  @UseGuards(AuthGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateBookingDto: updateBookingDto) {
    return this.bookingService.updateBooking(id, updateBookingDto);
  }
  @Roles(["employee", "manager"])
  @UseGuards(AuthGuard)
  @Patch("/checkin/:id")
  @Patch("/checkin/:id")
  checkIn(@Param("id") id: string, @Body("breakfast") breakfast: boolean) {
    console.log("checkin", id, breakfast);
    return this.bookingService.checkIn(id, breakfast);
  }

  @Roles(["employee", "manager"])
  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.bookingService.cancelBooking(id);
  }
}

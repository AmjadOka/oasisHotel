import { HttpException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Booking } from "./booking.schema";
import { Cabin } from "src/cabin/cabin.schema";
import { Guest } from "src/guest/guest.schema";
import { randomUUID } from "crypto";

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(Cabin.name) private cabinModel: Model<Cabin>,
    @InjectModel(Guest.name) private guestModel: Model<Guest>
  ) {}

  // 🔹 get all dates between range
  private getDates(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    let current = new Date(start);

    while (current < end) {
      dates.push(new Date(current));
      current = new Date(current);
      current.setUTCDate(current.getUTCDate() + 1);
    }

    return dates;
  }
  async create(dto: CreateBookingDto) {
    const {
      cabinId,
      guestId,
      startDate,
      endDate,
      numGuests,
      hasBreakfast,
      observations,
    } = dto;

    //  validation date
    if (new Date(startDate) >= new Date(endDate)) {
      throw new HttpException("End date must be after start date", 400);
    }
    //  generate dates
    const dates = this.getDates(new Date(startDate), new Date(endDate));
    //normalize dates to avoid time conflicts (e.g. 2024-06-01T00:00:00.000Z vs 2024-06-01T12:00:00.000Z)
    const normalize = (d: Date) =>
      new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const normalizedDates = dates.map(normalize);
    console.log(normalizedDates);
    const existingConflict = await this.bookingModel.findOne({
      cabinId,
      date: {
        $gte: normalize(new Date(startDate)),
        $lt: normalize(new Date(endDate)),
      },
    });

    console.log(existingConflict, "conflict");
    if (existingConflict) {
      throw new HttpException(
        "Cabin is already booked for one or more selected dates",
        400
      );
    }
    //  fetch cabin (for price)
    const cabin = await this.cabinModel.findById(cabinId);
    if (!cabin) throw new HttpException("Cabin not found", 404);
    if (numGuests > cabin.maxCapacity) {
      throw new HttpException(
        `Too many guests for this cabin, the max is ${numGuests}`,
        400
      );
    }

    const guest = await this.guestModel.findById(guestId);
    if (!guest) throw new NotFoundException("guest not found");

    //  calculate nights
    const nights = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    console.log(nights);
    //  pricing
    const cabinPrice = cabin.regularPrice * nights;

    const breakfastPrice = hasBreakfast ? 5 * numGuests * nights : 0; // example

    const totalPrice = cabinPrice + breakfastPrice;

    //  create docs per day
    const bookingGroupId = randomUUID();

    const docs = dates.map((date) => ({
      bookingGroupId,
      cabinId,
      guestId,
      startDate,
      endDate,
      numNights: nights,
      numGuests,
      cabinPrice,
      extrasPrice: breakfastPrice,
      totalPrice,
      hasBreakfast,
      observations,
      date: normalize(date),
    }));

    try {
      await this.bookingModel.insertMany(docs);

      return {
        message: "Booking created successfully",
        status: 200,
        totalPrice,
        nights,
        bookingGroupId,
      };
    } catch (err) {
      if (err.code === 11000) {
        throw new HttpException(
          "Booking conflict: cabin or guest already booked in this date range",
          400
        );
      }
      throw err;
    }
  }

  async findAllForAdmin() {
    return this.bookingModel.aggregate([
      {
        $group: {
          _id: "$bookingGroupId",

          cabinId: { $first: "$cabinId" },
          guestId: { $first: "$guestId" },

          startDate: { $first: "$startDate" },
          endDate: { $first: "$endDate" },

          numNights: { $first: "$numNights" },
          numGuests: { $first: "$numGuests" },

          totalPrice: { $first: "$totalPrice" },
          status: { $first: "$status" },

          createdAt: { $first: "$createdAt" },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
  }

  async findAll(query: any) {
    const {
      range,
      status,
      sortField = "createdAt",
      sortDirection = "desc",
    } = query;

    const matchStage: any = {};
    const now = new Date();

    // ✅ Range filter
    if (range) {
      let start: Date;

      switch (range) {
        case "today":
          start = new Date(
            Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
          );
          break;

        case "7":
        case "30":
        case "90":
          start = new Date(now);
          start.setDate(start.getDate() - Number(range));
          break;

        default:
          start = new Date(
            Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
          );
      }

      if (start) {
        matchStage.createdAt = { $gte: start };
      }
    }

    // ✅ Status filter
    if (status) {
      matchStage.status = { $in: status.split(",") };
    }

    return this.bookingModel.aggregate([
      { $match: matchStage },

      {
        $group: {
          _id: "$bookingGroupId",
          mainBookingId: { $first: "$_id" },
          bookingIds: { $push: "$_id" },
          cabinId: { $first: "$cabinId" },
          guestId: { $first: "$guestId" },
          startDate: { $first: "$startDate" },
          endDate: { $first: "$endDate" },
          numNights: { $first: "$numNights" },
          numGuests: { $first: "$numGuests" },
          totalPrice: { $first: "$totalPrice" },
          status: { $first: "$status" },
          createdAt: { $first: "$createdAt" },
        },
      },

      {
        $lookup: {
          from: "guests",
          localField: "guestId",
          foreignField: "_id",
          as: "guest",
        },
      },
      {
        $lookup: {
          from: "cabins",
          localField: "cabinId",
          foreignField: "_id",
          as: "cabin",
        },
      },

      { $unwind: "$guest" },
      { $unwind: "$cabin" },

      {
        $project: {
          _id: 1,
          mainBookingId: 1,
          bookingIds: 1,
          startDate: 1,
          endDate: 1,
          numNights: 1,
          numGuests: 1,
          totalPrice: 1,
          status: 1,
          createdAt: 1,
          guest: {
            _id: "$guest._id",
            fullName: "$guest.fullName",
            email: "$guest.email",
          },
          cabin: {
            _id: "$cabin._id",
            name: "$cabin.name",
          },
        },
      },

      {
        $sort: {
          [sortField]: sortDirection === "asc" ? 1 : -1,
        },
      },
    ]);
  }
  async findGuestBookings(id: string) {
    return this.bookingModel
      .findOne({ bookingGroupId: id })
      .populate("guestId", "fullName email nationality countryFlag nationalID")
      .populate("cabinId", "name")
      .sort({ createdAt: -1 })
      .select("-__v");
  }

  async updateBooking(bookingGroupId: string, dto) {
    const {
      cabinId,
      startDate,
      endDate,
      numGuests,
      hasBreakfast,
      observations,
    } = dto;

    // 1. Get existing booking
    const existing = await this.bookingModel.findOne({ bookingGroupId });

    if (!existing) {
      throw new HttpException("Booking not found", 404);
    }

    // 2. Business rule: guestId is immutable
    const guestId = existing.guestId;

    // 3. Prevent cabin change if checked-in or paid
    const isLocked = existing.isPaid;

    let finalCabinId = existing.cabinId;

    if (cabinId && cabinId.toString() !== existing.cabinId.toString()) {
      if (isLocked) {
        throw new HttpException(
          "Cannot change cabin after payment or check-in",
          400
        );
      }
      finalCabinId = cabinId;
    }

    const newStartDate = startDate ? new Date(startDate) : existing.startDate;
    const newEndDate = endDate ? new Date(endDate) : existing.endDate;

    // Validate real dates
    if (isNaN(newStartDate.getTime()) || isNaN(newEndDate.getTime())) {
      throw new HttpException("Invalid date format", 400);
    }

    // Validate range
    if (newStartDate.getTime() >= newEndDate.getTime()) {
      throw new HttpException("Invalid date range", 400);
    }
    // 5. Validate date logic

    // 6. Fetch cabin (only if needed)
    const cabin = await this.cabinModel.findById(finalCabinId);
    if (!cabin) throw new HttpException("Cabin not found", 404);

    // 7. Nights calculation
    const nights = Math.ceil(
      (newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 8. Pricing
    const finalNumGuests = numGuests ?? existing.numGuests;

    const cabinPrice = cabin.regularPrice * nights;
    const extrasPrice =
      (hasBreakfast ?? existing.hasBreakfast) ? 5 * finalNumGuests * nights : 0;

    const totalPrice = cabinPrice + extrasPrice;

    // 9. Generate booking dates
    const dates = this.getDates(newStartDate, newEndDate);

    try {
      // 10. Remove old booking entries
      await this.bookingModel.deleteMany({ bookingGroupId });

      // 11. Recreate updated booking
      const docs = dates.map((date) => ({
        bookingGroupId,
        cabinId: finalCabinId,
        guestId, // immutable
        startDate: newStartDate,
        endDate: newEndDate,
        numNights: nights,
        numGuests: finalNumGuests,
        cabinPrice,
        extrasPrice,
        totalPrice,
        hasBreakfast: hasBreakfast ?? existing.hasBreakfast,
        observations: observations ?? existing.observations,
        date,
      }));

      await this.bookingModel.insertMany(docs);

      return {
        message: "Booking updated successfully",
        totalPrice,
        nights,
        cabinId: finalCabinId,
      };
    } catch (err) {
      if (err.code === 11000) {
        throw new HttpException("Booking conflict (dates already taken)", 400);
      }

      throw err;
    }
  }
  async checkIn(id: string, breakfast: boolean = false) {
    const result = await this.bookingModel.findOne({
      bookingGroupId: id,
    });
    if (!result) {
      throw new NotFoundException("Booking not found");
    }
    if (result.status === "checked-in") {
      throw new HttpException("Already checked in", 400);
    }

    const updated = await this.bookingModel.findOneAndUpdate(
      { bookingGroupId: id },
      {
        $set: {
          status: "checked-in",
          hasBreakfast: breakfast,
          isPaid: true,
          totalPrice:
            result.totalPrice +
            (breakfast ? 5 * result.numGuests * result.numNights : 0),
        },
      },
      { returnDocument: "after" }
    );
    console.log(updated);
    return {
      message: "Checked in successfully",
      status: "checked-in",
      data: updated,
    };
  }
  async cancelBooking(id: string) {
    const result = await this.bookingModel.findOne({
      _id: id,
    });

    if (!result) {
      throw new HttpException("Booking not found", 404);
    }
    const deletedgroub = await this.bookingModel.deleteMany({
      _id: result?._id,
    });
    console.log(deletedgroub);
    return { message: "Booking cancelled successfully" };
  }
}

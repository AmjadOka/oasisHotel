import { HttpException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateGuestDto } from "./dto/create-guest.dto";
import { UpdateGuestDto } from "./dto/update-guest.dto";
import { Guest } from "./guest.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class GuestService {
  constructor(@InjectModel(Guest.name) private guestModel: Model<Guest>) {}
  async create(createGuestDto: CreateGuestDto) {
    const guest = await this.guestModel.findOne({
      email: createGuestDto.email,
    });
    if (guest) {
      throw new HttpException("guest Exist", 400);
    }

    return {
      status: 200,
      message: "guest created successfuly",
      data: await this.guestModel.create(createGuestDto),
    };
  }

  async findAll(query: {
    limit?: number;
    skip?: number;
    sort?: string;
    name?: string;
    email?: string;
  }) {
    const { limit = 1000, skip = 0, sort = "asc", name, email } = query;

    if (Number.isNaN(+limit)) {
      throw new HttpException("Invalid limit", 400);
    }

    if (Number.isNaN(+skip)) {
      throw new HttpException("Invalid skip", 400);
    }

    if (!["asc", "desc"].includes(sort)) {
      throw new HttpException("Invalid sort", 400);
    }

    const filter: any = {};

    if (name) filter.name = new RegExp(name, "i");
    if (email) filter.email = new RegExp(email, "i");

    const guests = await this.guestModel
      .find(filter)
      .skip(+skip)
      .limit(+limit)
      .sort({ name: sort as "asc" | "desc" })
      .select("-password -__v")
      .exec();

    return {
      status: 200,
      message: "Users fetched successfully",
      length: guests.length,
      data: guests,
    };
  }

  async findOne(id: string): Promise<{ status: number; data: Guest }> {
    const guest = await this.guestModel.findById(id).select("-__v");
    if (!guest) {
      throw new NotFoundException("guest not found");
    }
    return { status: 200, data: guest };
  }

  async update(
    id: string,
    updateGuestDto: UpdateGuestDto
  ): Promise<{ status: number; message: string; data: Guest }> {
    const guestExists = await this.guestModel
      .findById(id)
      .select("-password -__v");
    if (!guestExists) {
      throw new NotFoundException("guest not found");
    }

    return {
      status: 200,
      message: "guest updated successfully",
      data:
        (await this.guestModel.findByIdAndUpdate(id, updateGuestDto, {
          returnDocument: "after",
        })) ||
        (() => {
          throw new NotFoundException("guest not found after update");
        })(),
    };
  }
  async remove(id: number) {
    const guest = await this.guestModel.findById(id).select("-__v");
    if (!guest) {
      throw new NotFoundException("guest not found");
    }
    await this.guestModel.findByIdAndDelete(id);
    return { status: 200, message: "guest DELETED" };
  }
}

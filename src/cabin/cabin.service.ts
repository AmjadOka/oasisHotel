import { HttpException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateCabinDto } from "./dto/create-cabin.dto";
import { UpdateCabinDto } from "./dto/update-cabin.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Cabin } from "./cabin.schema";
import { Model } from "mongoose";

@Injectable()
export class CabinService {
  constructor(@InjectModel(Cabin.name) private cabinModel: Model<Cabin>) {}
  async create(createCabinDto: CreateCabinDto) {
    const cabin = await this.cabinModel.findOne({ name: createCabinDto.name });
    if (cabin) throw new HttpException("cabin already exist", 400);

    return {
      status: 200,
      message: "cabin added successfully",
      data: await this.cabinModel.create(createCabinDto),
    };
  }

  async findAll() {
    const cabins = await this.cabinModel.find().select("-__v");
    return {
      status: 200,
      length: cabins.length,
      message: "cabins found",
      isEmpty: cabins.length > 0 ? "false" : "true",
      data: cabins,
    };
  }

  async findOne(_id: string) {
    const cabin = await this.cabinModel.findById(_id).select("-__v");
    if (!cabin) throw new NotFoundException("no cabin found with specific id");
    return {
      status: 200,
      message: "cabin found",
      data: cabin,
    };
  }

  async update(_id: string, updateCabinDto: UpdateCabinDto) {
    const cabin = await this.cabinModel.findById(_id);
    if (!cabin) throw new NotFoundException("no cabin found with specific id");

    const updatacabin = await this.cabinModel
      .findByIdAndUpdate({ _id }, updateCabinDto, { returnDocument: "after" })
      .select("-__v");

    return {
      status: 200,
      message: "cabiin updated successfully",
      data: updatacabin,
    };
  }

  async remove(_id: string) {
    const cabin = await this.cabinModel.findOne({ _id });
    if (!cabin) {
      throw new NotFoundException("cabin not found");
    }
    await this.cabinModel.deleteOne({ _id });
    return {
      status: 200,
      message: "cabin deleted successfully",
    };
  }
}

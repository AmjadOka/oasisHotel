import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { CabinService } from "./cabin.service";
import { CreateCabinDto } from "./dto/create-cabin.dto";
import { UpdateCabinDto } from "./dto/update-cabin.dto";
import { AuthGuard } from "src/employee/guard/Auth.guard";
import { Roles } from "src/employee/decorator/employee.docerator";

@Controller("cabins")
export class CabinController {
  constructor(private readonly cabinService: CabinService) {}

  @Roles(["manager"])
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createCabinDto: CreateCabinDto) {
    return this.cabinService.create(createCabinDto);
  }

  @Get()
  findAll() {
    return this.cabinService.findAll();
  }

  @Roles(["manager", "employee"])
  @UseGuards(AuthGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    console.log(id);
    return this.cabinService.findOne(id);
  }

  @Roles(["manager"])
  @UseGuards(AuthGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateCabinDto: UpdateCabinDto) {
    return this.cabinService.update(id, updateCabinDto);
  }

  @Roles(["manager"])
  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.cabinService.remove(id);
  }
}

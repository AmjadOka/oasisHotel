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
import { GuestService } from "./guest.service";
import { CreateGuestDto } from "./dto/create-guest.dto";
import { UpdateGuestDto } from "./dto/update-guest.dto";
import { AuthGuard } from "src/employee/guard/Auth.guard";
import { Roles } from "src/employee/decorator/employee.docerator";

@Controller("guests")
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Post()
  @Roles(["employee"])
  @UseGuards(AuthGuard)
  create(@Body() createGuestDto: CreateGuestDto) {
    return this.guestService.create(createGuestDto);
  }

  @Get()
  @Roles(["manager"])
  @UseGuards(AuthGuard)
  findAll(@Query() Query) {
    return this.guestService.findAll(Query);
  }

  @Get(":id")
  @Roles(["manager", "employee"])
  @UseGuards(AuthGuard)
  findOne(@Param("id") id: string) {
    return this.guestService.findOne(id);
  }

  @Roles(["employee", "manager"])
  @UseGuards(AuthGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateGuestDto: UpdateGuestDto) {
    return this.guestService.update(id, updateGuestDto);
  }

  @Roles(["manager", "employee"])
  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.guestService.remove(+id);
  }
}

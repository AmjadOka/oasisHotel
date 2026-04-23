import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { EmployeeService } from "./Employee.service";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { AuthGuard } from "./guard/Auth.guard";
import { Roles } from "./decorator/employee.docerator";

@Controller("Employee")
export class EmployeeController {
  constructor(private readonly EmployeeService: EmployeeService) {}

  @Post()
  @Roles(["manager"])
  @UseGuards(AuthGuard)
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.EmployeeService.create(createEmployeeDto);
  }

  @Get()
  @Roles(["manager"])
  @UseGuards(AuthGuard)
  findAll(@Query() query) {
    return this.EmployeeService.findAll(query);
  }

  @Roles(["manager", "employee"])
  @UseGuards(AuthGuard)
  @Get(":id")
  findOne(@Param("id") id: string, @Req() req) {
    return this.EmployeeService.findOne(id, req);
  }

  @Roles(["manager", "employee"])
  @UseGuards(AuthGuard)
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Req() req
  ) {
    return this.EmployeeService.update(id, updateEmployeeDto, req);
  }

  @Roles(["manager"])
  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.EmployeeService.remove(id);
  }
}

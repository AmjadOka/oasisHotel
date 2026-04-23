import {
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { Employee } from "./Employee.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from "bcrypt";
const saltOrRounds = 10;
@Injectable()
export class EmployeeService {
  @InjectModel(Employee.name) private employeeModel: Model<Employee>;

  async create(
    createEmployeeDto: CreateEmployeeDto
  ): Promise<{ status: number; message: string; data: Employee }> {
    //bussiness logic
    const employeeExists = await this.employeeModel.find({
      email: createEmployeeDto.email,
    });
    //if employee exists return
    if (employeeExists) throw new HttpException("employee already exists", 400);

    //create new employee

    const password = await bcrypt.hash(
      createEmployeeDto.password,
      saltOrRounds
    );
    const employee = {
      password,
      role: createEmployeeDto.role === "manager" ? "manager" : "employee",
      active: true,
    };
    return {
      status: 200,
      message: "employee created successfuly",
      data: await this.employeeModel.create({
        ...createEmployeeDto,
        ...employee,
      }),
    };
  }

  //find all by manager
  async findAll(query: {
    _limit?: number;
    skip?: number;
    sort?: string;
    name?: string;
    email?: string;
    role?: string;
  }) {
    const { _limit = 1000, skip = 0, sort = "asc", name, email, role } = query;

    if (Number.isNaN(Number(+_limit))) {
      throw new HttpException("Invalid limit", 400);
    }
    if (Number.isNaN(Number(+skip))) {
      throw new HttpException("Invalid skip", 400);
    }
    if (!["asc", "desc"].includes(sort)) {
      throw new HttpException("Invalid sort", 400);
    }

    // or=> whare by all keyword, RegExp=> whare by any keyword
    const users = await this.employeeModel
      .find()
      .skip(skip)
      .limit(_limit)
      .where("name", name ? new RegExp(name, "i") : undefined)
      .where("email", email ? new RegExp(email, "i") : undefined)
      .where("role", role ? new RegExp(role, "i") : undefined)
      .sort({ name: sort as "asc" | "desc" })
      .select(" -password -__v")
      .exec();
    return {
      status: 200,
      message: "user found successfully",
      length: users.length,
      data: users,
    };
  }

  async findOne(id: string, req) {
    const employee = await this.employeeModel
      .findById(id)
      .select("-password -__v");
    if (!employee) {
      throw new NotFoundException("employee not found");
    }
    if (req.user.email === employee.email || req.user.role === "manager") {
      return { status: 200, data: employee };
    } else throw new ForbiddenException();
  }
  //update by id only admin
  async update(id: string, updateEmployeeDto: UpdateEmployeeDto, req) {
    const employeeExists = await this.employeeModel
      .findById(id)
      .select("-password -__v");
    if (!employeeExists) {
      throw new NotFoundException("employee not found");
    }
    if (
      req.user.email === employeeExists.email ||
      req.user.role === "manager"
    ) {
      let employee = { ...updateEmployeeDto };

      if (updateEmployeeDto.password) {
        const password = await bcrypt.hash(
          updateEmployeeDto.password,
          saltOrRounds
        );
        employee = { ...employee, password };
      }

      return {
        status: 200,
        message: "employee updated successfully",
        data:
          (await this.employeeModel.findByIdAndUpdate(id, employee, {
            returnDocument: "after",
          })) ||
          (() => {
            throw new NotFoundException("employee not found after update");
          })(),
      };
    }
  }
  //recive id and delete user
  async remove(id: string): Promise<{ status: number; message: string }> {
    const employee = await this.employeeModel
      .findById(id)
      .select("-password -__v");
    if (!employee) {
      throw new NotFoundException("employee not found");
    }
    await employee.updateOne({ active: false });
    return { status: 200, message: "employee DELETED" };
  }
}

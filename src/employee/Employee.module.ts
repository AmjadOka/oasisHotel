import { Module } from "@nestjs/common";
import { EmployeeService } from "./Employee.service";
import { Employee, EmployeeSchema } from "./Employee.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { EmployeeController } from "./Employee.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
    ]),
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
})
export class EmployeeModule {}

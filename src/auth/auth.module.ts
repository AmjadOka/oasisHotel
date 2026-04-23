/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Employee, EmployeeSchema } from "src/employee/Employee.schema";
import { MailerModule } from "@nestjs-modules/mailer";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
    ]),
    MailerModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

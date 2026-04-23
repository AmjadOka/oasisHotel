/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Employee } from "src/employee/Employee.schema";
import * as bcrypt from "bcrypt";
import { ResetPasswordDto, SignInDto, SignUpDto } from "./Dto/auth.dto";
import { JwtService } from "@nestjs/jwt";
import { MailerService } from "@nestjs-modules/mailer";
import * as crypto from "crypto";
const saltOrRounds = 10;
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Employee.name) private EmployeeModel: Model<Employee>,
    private jwtService: JwtService,
    private readonly mailService: MailerService
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const Employee = await this.EmployeeModel.findOne({
      email: signUpDto.email,
    });
    if (Employee) {
      throw new HttpException("Employee already exist", 400);
    }
    const password = await bcrypt.hash(signUpDto.password, saltOrRounds);
    const EmployeeCreated = {
      password,
      role: "manager",
      active: true,
      fullName: signUpDto.name,
    };
    const newEmployee = await this.EmployeeModel.create({
      ...signUpDto,
      ...EmployeeCreated,
    });

    const payload = {
      _id: newEmployee._id,
      email: newEmployee.email,
      role: newEmployee.role,
    };
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });
    return {
      status: 200,
      message: "Employee created successfully",
      data: newEmployee,
      access_token: token,
    };
  }

  async signIn(signInDto: SignInDto) {
    const Employee = await this.EmployeeModel.findOne({
      email: signInDto.email,
    });
    if (!Employee) {
      throw new NotFoundException("Employee not found");
    }
    const isMatch = await bcrypt.compare(signInDto.password, Employee.password);
    if (!isMatch) {
      throw new UnauthorizedException();
    }
    const payload = {
      _id: Employee._id,
      email: Employee.email,
      role: Employee.role,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });
    return {
      status: 200,
      message: "Employee logged successfully",
      data: Employee,
      access_token: token,
    };
  }
  async resetPassword({ email }: ResetPasswordDto) {
    const Employee = await this.EmployeeModel.findOne({ email });
    console.log(email, "ds");
    if (!Employee) {
      throw new NotFoundException("Employee not found");
    }

    const rawToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    Employee.resetTokenHash = tokenHash;
    Employee.resetCode = code;
    Employee.resetExpires = new Date(Date.now() + 10 * 60 * 1000);
    Employee.isResetVerified = false;

    await Employee.save();

    // 🔥 link
    const resetLink = `http://localhost:3000/reset-password?token=${rawToken}`;

    //  sending via nodeMailer
    await this.mailService.sendMail({
      from: "e-commerce NestJs",
      to: Employee.email,
      subject: "Password Reset",
      html: `
      <h3>Password Reset Request</h3>
      <p>Your verification code is:</p>
      <h2>${code}</h2>
      <p>Click the link below to continue:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link expires in 10 minutes</p>
    `,
    });

    return {
      status: 200,
      message: "Reset email sent successfully",
    };
  }

  async verifyResetCode({ email, code }) {
    const Employee = await this.EmployeeModel.findOne({
      email,
      resetExpires: { $gt: new Date() },
    });

    if (!Employee || Employee.resetCode !== code) {
      throw new BadRequestException("Invalid or expired code");
    }

    Employee.isResetVerified = true;
    await Employee.save();

    return {
      status: 200,
      message: "Code verified successfully",
    };
  }

  async changePassword(token, newPassword) {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const Employee = await this.EmployeeModel.findOne({
      resetTokenHash: tokenHash,
      resetExpires: { $gt: new Date() },
      isResetVerified: true,
    });

    if (!Employee) {
      throw new BadRequestException("Invalid or expired request");
    }

    Employee.password = await bcrypt.hash(newPassword, 10);

    // 🧨 delete reset data
    Employee.resetTokenHash = undefined;
    Employee.resetCode = undefined;
    Employee.resetExpires = undefined;
    Employee.isResetVerified = false;

    await Employee.save();

    return {
      message: "Password changed successfully",
    };
  }
}

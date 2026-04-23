import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  MinLength,
  MaxLength,
} from "class-validator";

export class CreateEmployeeDto {
  @IsString({ message: "Name must be a text string" })
  @IsNotEmpty({ message: "User name is required" })
  @MinLength(3, { message: "Name is too short (minimum 3 characters)" })
  @MaxLength(30, { message: "Name is too long (maximum 30 characters)" })
  name: string;

  @IsEmail({}, { message: "Please provide a valid email address" })
  @IsNotEmpty({ message: "Email is required" })
  email: string;

  @IsString({ message: "Password must be a string" })
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(3, { message: "Password must be at least 3 characters" })
  @MaxLength(20, { message: "Password cannot exceed 20 characters" })
  password: string;

  @IsEnum(["manager", "worker"], {
    message: 'Role must be either "user" or "admin"',
  })
  @IsNotEmpty({ message: "User role is required" })
  role: string;

  @IsEnum(["male", "female"], { message: 'Gender must be "male" or "female"' })
  @IsOptional()
  gender?: string;

  @IsString({ message: "Avatar path must be a string" })
  @IsOptional()
  avatar?: string;

  @IsString({ message: "Phone number must be a string" })
  @IsOptional()
  phoneNumber?: string;

  @IsString({ message: "Address must be a string" })
  @IsOptional()
  address?: string;

  @IsBoolean({ message: "Active status must be a boolean" })
  @IsOptional()
  active?: boolean;
}

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUrl,
  IsOptional,
} from "class-validator";

export class CreateGuestDto {
  @IsString({ message: "Full name must be a valid string" })
  @IsNotEmpty({ message: "The guest full name is required" })
  fullName: string;

  @IsEmail(
    {},
    {
      message: "Please provide a valid email address (e.g., guest@example.com)",
    }
  )
  @IsNotEmpty({ message: "An email address is required for check-in" })
  email: string;

  @IsString({ message: "Nationality must be a string" })
  @IsNotEmpty({ message: "Please provide the guest nationality" })
  nationality: string;

  @IsString({ message: "National ID must be a string" })
  @IsNotEmpty({ message: "A National ID or Passport number is required" })
  nationalID: string;

  @IsUrl({}, { message: "The country flag must be a valid URL to an image" })
  @IsOptional()
  countryFlag?: string;
}

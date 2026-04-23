import {
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsMongoId,
  Min,
  IsString,
} from "class-validator";

export class CreateBookingDto {
  @IsMongoId({ message: "The cabinId must be a valid MongoDB ObjectId" })
  @IsNotEmpty({ message: "Cabin ID is required" })
  cabinId: string;

  @IsMongoId({ message: "The guestId must be a valid MongoDB ObjectId" })
  @IsNotEmpty({ message: "Guest ID is required" })
  guestId: string;

  @IsDateString(
    {},
    { message: "startDate must be a valid ISO date string (YYYY-MM-DD)" }
  )
  @IsNotEmpty({ message: "Check-in date is required" })
  startDate: string;

  @IsDateString(
    {},
    { message: "endDate must be a valid ISO date string (YYYY-MM-DD)" }
  )
  @IsNotEmpty({ message: "Check-out date is required" })
  endDate: string;

  @IsNumber({}, { message: "numGuests must be a number" })
  @Min(1, { message: "There must be at least 1 guest" })
  @IsNotEmpty()
  numGuests: number;

  @IsEnum(["unconfirmed", "checked-in", "checked-out"], {
    message: "Status must be: unconfirmed, checked-in, or checked-out",
  })
  @IsOptional()
  status?: string;

  @IsBoolean({ message: "hasBreakfast must be a boolean value" })
  @IsOptional()
  hasBreakfast?: boolean;

  @IsBoolean({ message: "isPaid must be a boolean value" })
  @IsOptional()
  isPaid?: boolean;

  @IsString({ message: "Observations must be a string" })
  @IsOptional()
  observations?: string;
}

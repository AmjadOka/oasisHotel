import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from "class-validator";

export class CreateCabinDto {
  @IsString({ message: "Cabin name must be a string" })
  @IsNotEmpty({ message: 'Cabin name (e.g., "001") is required' })
  name: string;

  @IsNumber({}, { message: "Maximum capacity must be a number" })
  @Min(1, { message: "Capacity must be at least 1 guest" })
  @Max(20, { message: "Capacity cannot exceed 20 guests" })
  @IsNotEmpty()
  maxCapacity: number;

  @IsNumber({}, { message: "Regular price must be a number" })
  @Min(1, { message: "Price cannot be zero or negative" })
  @IsNotEmpty()
  regularPrice: number;

  @IsNumber({}, { message: "Discount must be a number" })
  @Min(0, { message: "Discount cannot be negative" })
  @IsOptional()
  discount?: number;

  @IsString()
  @IsNotEmpty({ message: "A description is required for the website" })
  description: string;

  @IsUrl({}, { message: "Image must be a valid URL string" })
  @IsNotEmpty({ message: "An image URL is required" })
  image: string;
}

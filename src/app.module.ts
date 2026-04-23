import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { GuestModule } from "./guest/guest.module";
import { BookingModule } from "./booking/booking.module";
import { CabinModule } from "./cabin/cabin.module";
import { EmployeeModule } from "./employee/Employee.module";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule } from "./auth/auth.module";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule } from "@nestjs/config";
import { UploadFilesModule } from "./upload-files/upload-files.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    JwtModule.register({
      global: true,
      secret: process.env.SECRET,
      signOptions: { expiresIn: "1d" },
    }),

    MongooseModule.forRoot("mongodb://localhost:27017/HotelOasis"),
    MailerModule.forRoot({
      transport: {
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    }),
    GuestModule,
    CabinModule,
    BookingModule,
    EmployeeModule,
    AuthModule,
    UploadFilesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Cabin, CabinSchema } from "./cabin.schema";
import { CabinController } from "./cabin.controller";
import { CabinService } from "./cabin.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cabin.name, schema: CabinSchema }]),
  ],
  controllers: [CabinController],
  providers: [CabinService],
})
export class CabinModule {}

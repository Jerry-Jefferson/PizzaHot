import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PizzaSnapshot } from "./pizza-snapshot.entity.ts";
import { PizzaSnapshotRepository } from "./pizza-snapshot.repository.ts";

@Module({
  imports: [TypeOrmModule.forFeature([PizzaSnapshot])],
  providers: [PizzaSnapshotRepository],
  exports: [PizzaSnapshotRepository],
})
export class SnapshotsModule {}

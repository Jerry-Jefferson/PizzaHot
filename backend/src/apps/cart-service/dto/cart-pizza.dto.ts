import { ApiProperty } from "@nestjs/swagger";
import type { PizzaSnapshot } from "../snapshots/pizza-snapshot.entity.ts";

export class CartPizzaDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id: string;

  @ApiProperty({ example: "Margherita" })
  name: string;

  @ApiProperty({ example: 12.5 })
  price: number;

  @ApiProperty({ example: "/uploads/pizzas/abc.png", nullable: true })
  image: string | null;

  static fromSnapshot(snapshot: PizzaSnapshot): CartPizzaDto {
    const dto = new CartPizzaDto();
    dto.id = snapshot.id;
    dto.name = snapshot.name;
    dto.price = Number(snapshot.price);
    dto.image = snapshot.image;
    return dto;
  }
}

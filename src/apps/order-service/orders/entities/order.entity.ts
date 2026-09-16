import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from "typeorm";
import type { OrderItem } from "./order-item.entity.ts";
import { DeliveryType } from "../constants/delivery-type.constant.ts";
import { PaymentMethod } from "../constants/payment-method.constant.ts";
import { OrderStatus } from "../constants/order-status.constant.ts";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", name: "user_id", nullable: true })
  userId: string | null;

  @Column({ type: "uuid", name: "promocode_id", nullable: true })
  promocodeId: string | null;

  @Column({ type: "varchar" })
  address: string;

  @Column({
    type: "enum",
    enum: DeliveryType,
  })
  delivery: DeliveryType;

  @Column({
    type: "enum",
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  totalPrice: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value !== null ? parseFloat(value) : 0),
    },
  })
  discountAmount: number | null;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  finalPrice: number;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: "text", nullable: true, default: null })
  comment: string | null;

  @Column({ type: "varchar", nullable: true, default: null })
  codeApplied: string | null;

  @OneToMany("OrderItem", (orderItem: OrderItem) => orderItem.order, {
    cascade: true,
  })
  orderItems: Relation<OrderItem[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

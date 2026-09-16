import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("user_facts")
export class UserFact {
  @PrimaryColumn({ type: "uuid" })
  userId: string;

  @Column({ type: "varchar" })
  email: string;

  @Column({ type: "varchar", nullable: true })
  name: string | null;

  @Column({ type: "boolean", default: false })
  isDeleted: boolean;
}

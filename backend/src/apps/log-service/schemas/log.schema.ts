import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type HydratedDocument, Schema as MongooseSchema } from "mongoose";
import { LogLevel } from "../../../libs/logging/log-level.constant.ts";

export type LogDocument = HydratedDocument<Log>;

@Schema({ timestamps: true, collection: "logs" })
export class Log {
  @Prop({ type: String, required: true, enum: LogLevel, index: true })
  level: LogLevel;

  @Prop({ required: true })
  message: string;

  @Prop({ index: true })
  context?: string;

  @Prop()
  trace?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, unknown>;

  @Prop({ default: Date.now, index: { expires: 2592000 } })
  timestamp: Date;
}

export const LogSchema = SchemaFactory.createForClass(Log);

LogSchema.index({ level: 1, timestamp: -1 });
LogSchema.index({ timestamp: -1 });

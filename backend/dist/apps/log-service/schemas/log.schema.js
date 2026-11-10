var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema } from "mongoose";
import { LogLevel } from "../../../libs/logging/log-level.constant.js";
let Log = class Log {
    level;
    message;
    context;
    trace;
    metadata;
    timestamp;
};
__decorate([
    Prop({ type: String, required: true, enum: LogLevel, index: true }),
    __metadata("design:type", String)
], Log.prototype, "level", void 0);
__decorate([
    Prop({ required: true }),
    __metadata("design:type", String)
], Log.prototype, "message", void 0);
__decorate([
    Prop({ index: true }),
    __metadata("design:type", String)
], Log.prototype, "context", void 0);
__decorate([
    Prop(),
    __metadata("design:type", String)
], Log.prototype, "trace", void 0);
__decorate([
    Prop({ type: MongooseSchema.Types.Mixed }),
    __metadata("design:type", Object)
], Log.prototype, "metadata", void 0);
__decorate([
    Prop({ default: Date.now, index: { expires: 2592000 } }),
    __metadata("design:type", Date)
], Log.prototype, "timestamp", void 0);
Log = __decorate([
    Schema({ timestamps: true, collection: "logs" })
], Log);
export { Log };
export const LogSchema = SchemaFactory.createForClass(Log);
LogSchema.index({ level: 1, timestamp: -1 });
LogSchema.index({ timestamp: -1 });
//# sourceMappingURL=log.schema.js.map
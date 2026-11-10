import { type HydratedDocument, Schema as MongooseSchema } from "mongoose";
import { LogLevel } from "../../../libs/logging/log-level.constant.ts";
export type LogDocument = HydratedDocument<Log>;
export declare class Log {
    level: LogLevel;
    message: string;
    context?: string;
    trace?: string;
    metadata?: Record<string, unknown>;
    timestamp: Date;
}
export declare const LogSchema: MongooseSchema<Log, import("mongoose").Model<Log, any, any, any, any, any, Log>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Log, import("mongoose").Document<unknown, {}, Log, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Log & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    level?: import("mongoose").SchemaDefinitionProperty<LogLevel, Log, import("mongoose").Document<unknown, {}, Log, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Log & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    message?: import("mongoose").SchemaDefinitionProperty<string, Log, import("mongoose").Document<unknown, {}, Log, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Log & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    context?: import("mongoose").SchemaDefinitionProperty<string, Log, import("mongoose").Document<unknown, {}, Log, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Log & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    trace?: import("mongoose").SchemaDefinitionProperty<string, Log, import("mongoose").Document<unknown, {}, Log, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Log & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    metadata?: import("mongoose").SchemaDefinitionProperty<Record<string, unknown>, Log, import("mongoose").Document<unknown, {}, Log, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Log & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    timestamp?: import("mongoose").SchemaDefinitionProperty<Date, Log, import("mongoose").Document<unknown, {}, Log, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Log & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, Log>;

import { MongoRxCollection } from './MongoRxCollection';
import { MongoClient, MongoClientOptions } from "mongodb";
import { MongoRxOptions, MongoUriBuilderConfig } from "./index";
export declare class MongoRx {
    options: MongoRxOptions;
    static instance: any;
    client: MongoClient;
    defaultDb: string;
    clientOptions: MongoClientOptions;
    setClientOptions(options?: MongoClientOptions): void;
    static client(): MongoClient;
    static getInstance(): MongoRx;
    init(builder: MongoUriBuilderConfig, clientOptions?: MongoClientOptions): Promise<void>;
    setDefaultDb(db: string): void;
    getClient(): MongoClient;
    strToMongoNamespace(param: string, onlyDb?: boolean): {
        db: string;
        collection: string;
    };
    getCollection<T>(ns: string | {
        db: string;
        collection: string;
    }): MongoRxCollection<T>;
    dispose(): Promise<void>;
}

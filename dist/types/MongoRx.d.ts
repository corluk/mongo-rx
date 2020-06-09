import { MongoRxCollection } from './MongoRxCollection';
import { MongoClient, MongoClientOptions } from "mongodb";
import { MongoRxOptions, MongoUriBuilderConfig } from "./index";
import { CollectionRegistry } from '.';
export declare class MongoRx {
    options: MongoRxOptions;
    static instance: any;
    client: MongoClient;
    defaultDb: string;
    clientOptions: MongoClientOptions;
    registry: {
        key: string;
        collection: MongoRxCollection<unknown>;
    }[];
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
    addToRegistry<T extends MongoRxCollection<unknown>>(collectionRx: T): void;
    getCollection<T extends MongoRxCollection<any>>(ns: string | CollectionRegistry): T;
    dispose(): Promise<void>;
}

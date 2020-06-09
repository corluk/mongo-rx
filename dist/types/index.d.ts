import { Collection } from 'mongodb';
import { Observable } from 'rxjs';
import { MongoClientOptions, UpdateQuery, FilterQuery, UpdateOneOptions, UpdateManyOptions, FindOneOptions, Cursor } from 'mongodb';
import { mongoUriBuilder } from './MongUriBuilder';
import { MongoRxCSV } from './MongoRxCsv';
import { MongoRxCollection, AbstractRxCollection } from './MongoRxCollection';
import { MongoRx } from "./MongoRx";
export default MongoRx;
export { MongoRxCSV, MongoRxCollection, mongoUriBuilder, AbstractRxCollection };
export interface MongoRxOptions {
    MongoClientOptions: MongoClientOptions;
}
export interface UpdateParams<T> {
    updateQuery: UpdateQuery<T>;
    filterQuery: FilterQuery<T>;
    updateOneOptions?: UpdateOneOptions;
    updateManyOptions?: UpdateManyOptions;
}
export interface Find<T, R> {
    filter: FilterQuery<T>;
    findOneOptions?: FindOneOptions;
    execute?: (cursor: Cursor<T>) => Observable<R>;
}
export interface FindAnd<T> {
    filter: FilterQuery<T>;
    replacement?: object;
    updateQuery?: UpdateQuery<T>;
}
export interface CursorPrepare<T> {
    prepare: (collection: Collection<any>) => Cursor<T>;
}
export interface CursorOnly<T> {
    just: (collection: Collection<T>) => Cursor<T>;
}
export interface CursorQuery<T, R> {
    prepare: (collection: Collection<any>) => Cursor<T> | Promise<T>;
    execute?: (cursor: Cursor<T>) => R;
}
export interface MongoUriBuilderConfigOptions {
    tls?: boolean;
    ssl?: boolean;
    tlsCertificateKeyFile?: string;
    tlsCertificateKeyFilePassword?: string;
    tlsCAFile?: string;
    tlsAllowInvalidCertificates?: string;
    tlsAllowInvalidHostnames?: boolean;
    tlsInsecure?: boolean;
    connectTimeoutMS?: number;
    socketTimeoutMS?: number;
    compressors?: string;
    zlibCompressionLevel?: number;
    maxPoolSize?: number;
    minPoolSize?: number;
    maxIdleTimeMS?: number;
    waitQueueMultiple?: number;
    waitQueueTimeoutMS?: number;
    w?: number | string;
    wtimeoutMS?: number;
    journal?: boolean;
    readConcernLevel?: string;
    readPreference?: string;
    maxStalenessSeconds?: number;
    readPreferenceTags?: string;
    authSource?: string;
    authMechanism?: string;
    authMechanismProperties?: string;
    gssapiServiceName?: string;
    localThresholdMS?: number;
    serverSelectionTimeoutMS?: number;
    serverSelectionTryOnce?: boolean;
    heartbeatFrequencyMS?: number;
    appName?: string;
    retryWrites?: boolean;
    uuidRepresentation?: string;
}
export interface MongoUriBuilderConfigReplica {
    host: string;
    port: number;
}
export interface MongoUriBuilderConfig {
    username?: string;
    password?: string;
    host: string;
    port?: number;
    replicas?: MongoUriBuilderConfigReplica[];
    database?: string;
    options?: MongoUriBuilderConfigOptions;
}
export declare const strToMongoNamespace: (params: string, onlyDb?: boolean) => {
    db: string;
    collection: string;
};
export declare const operator: <T>(fn: (collection: Collection<T>) => Promise<T>) => (source: Observable<Collection<T>>) => Observable<T>;

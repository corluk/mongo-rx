import { from } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { Collection } from 'mongodb';
import { Observable } from 'rxjs';
import { MongoClientOptions, UpdateQuery, FilterQuery, UpdateOneOptions, UpdateManyOptions, FindOneOptions, Cursor } from 'mongodb';
import { mongoUriBuilder } from './MongUriBuilder';
import { MongoRxCSV } from './MongoRxCsv';
import { MongoRxCollection , AbstractRxCollection } from './MongoRxCollection';
import {MongoRx} from "./MongoRx" 
 
export default MongoRx 

export {MongoRxCSV,MongoRxCollection ,  mongoUriBuilder, AbstractRxCollection}


export interface MongoRxOptions {

    MongoClientOptions: MongoClientOptions
}

export interface UpdateParams<T> {
    updateQuery: UpdateQuery<T>,
    filterQuery: FilterQuery<T>,
    updateOneOptions?: UpdateOneOptions,
    updateManyOptions?: UpdateManyOptions
}
 
export interface Find<T, R> {
    filter: FilterQuery<T>,
    findOneOptions?: FindOneOptions,
    execute?: (cursor: Cursor<T>) => Observable<R>
}
export interface FindAnd<T> {
    filter: FilterQuery<T>,
    replacement?: object,
    updateQuery?: UpdateQuery<T>
}
export interface CursorPrepare<T> {
    prepare: (collection: Collection<any>) => Cursor<T>
}
export interface CursorOnly<T> {
    just: (collection: Collection<T>) => Cursor<T>
}
export interface CursorQuery<T, R> {
    prepare: (collection: Collection<any>) => Cursor<T> | Promise<T>
    execute?: (cursor: Cursor<T>) => R
}
export interface MongoUriBuilderConfigOptions {

    tls?: boolean,
    ssl?: boolean,
    tlsCertificateKeyFile?: string,
    tlsCertificateKeyFilePassword?: string,
    tlsCAFile?: string,
    tlsAllowInvalidCertificates?: string,
    tlsAllowInvalidHostnames?: boolean,
    tlsInsecure?: boolean,
    connectTimeoutMS?: number,
    socketTimeoutMS?: number,
    compressors?: string,
    zlibCompressionLevel?: number,
    maxPoolSize?: number,
    minPoolSize?: number,
    maxIdleTimeMS?: number,
    waitQueueMultiple?: number,
    waitQueueTimeoutMS?: number,
    w?: number | string,
    wtimeoutMS?: number,
    journal?: boolean,
    readConcernLevel?: string,
    readPreference?: string,
    maxStalenessSeconds?: number,
    readPreferenceTags?: string,
    authSource?: string,
    authMechanism?: string,
    authMechanismProperties?: string,
    gssapiServiceName?: string,
    localThresholdMS?: number,
    serverSelectionTimeoutMS?: number,
    serverSelectionTryOnce?: boolean,
    heartbeatFrequencyMS?: number,
    appName?: string,
    retryWrites?: boolean,
    uuidRepresentation?: string,


}
export interface MongoUriBuilderConfigReplica {
    host: string
    port: number
}
export interface MongoUriBuilderConfig {
    username?: string,
    password?: string,
    host: string,
    port?: number,
    replicas?: MongoUriBuilderConfigReplica[]
    database?: string,
    options?: MongoUriBuilderConfigOptions

}

export const strToMongoNamespace = (params: string  , onlyDb: boolean = false): { db: string, collection: string } =>{

     
        let db = "temp"
        let collection = params
        let returnValue = {
            db: db,
            collection: collection
        }
        if (/[\w\d]+\.[\w\d]+/.test(params)) {
            returnValue.collection = null
            let _param = params.split(".")

            returnValue.db = _param[0]
            returnValue.collection = _param[1]
        }


        if (typeof returnValue.db != "string") {
            throw new Error(` typeof db is not a string possibly {db}.{colllection} isn't proper : check ${params}  sent as first argument of this function `)
        }
        if (!onlyDb && typeof returnValue.collection != "string") {
            throw new Error("you must set collection with namespace as db.collection or setDefaultDb first then collection as param")
        }


        return returnValue
  
 
}

export const  operator= <T>(fn: (collection: Collection<T>) => Promise<T>): (source: Observable<Collection<T>>) => Observable<T> => {
    const _fn = (source: Observable<Collection>) => {
        return source.pipe(flatMap(collection => {
            return from(fn(collection))
        }))
    }
    return _fn
}
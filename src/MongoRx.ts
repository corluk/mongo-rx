import { MongoRxCollection } from './MongoRxCollection';
import { operatorMongoCollection, operatorMongoDB } from './MongoOperators';
import { MongoClient, MongoClientOptions, MongoCallback, Db, Collection, IndexOptions, InsertWriteOpResult, InsertOneWriteOpResult } from "mongodb"
import { Observable, from, of } from "rxjs"
import { map, flatMap } from "rxjs/operators"
import { MongoUriBuilderConfig, mongoUriBuilder } from "./MongUriBuilder"

import { connect } from "http2"

export enum MongoInsertType {

    ONE,
    MANY,
    BULKWRITE
}

export interface MongoRxOptions {

    MongoClientOptions: MongoClientOptions
}

export class MongoRx {
    options: MongoRxOptions
    static instance
    client: MongoClient
    defaultDb: string
    clientOptions: MongoClientOptions
    // connection : 
    // uri: string
    public setClientOptions(options) {
        this.clientOptions = options
    }


    public static getInstance(): MongoRx {

        if (!(MongoRx.instance instanceof MongoRx)) {

            MongoRx.instance = new MongoRx
        }
        return MongoRx.instance
    }
    public async init(builder: MongoUriBuilderConfig) {
        let uri = mongoUriBuilder(builder).toString()
        this.client = new MongoClient(uri, this.clientOptions)
        await this.client.connect()

    }

    public setDefaultDb(db: string) {
        this.defaultDb = db
    }
    public getClient() {
        return this.client
    }


    private parseNamespace(param: string, onlyDb: boolean = false): { db: string, collection: string } {

        let db = this.defaultDb
        let collection = param
        let returnValue = {
            db: db,
            collection: collection
        }
        if (/[\w\d]+\.[\w\d]+/.test(param)) {
            returnValue.collection = null
            let _param = param.split(".")

            returnValue.db = _param[0]
            returnValue.collection = _param[1]
        }


        if (typeof returnValue.db != "string") {
            throw new Error("you must ")
        }
        if (!onlyDb && typeof returnValue.collection != "string") {
            throw new Error("you must set collection with namespace as db.collection or setDefaultDb first then collection as param")
        }


        return returnValue

    }

   /* public getCollection$(dbOrNamespace?: string): Observable<Collection> {


        return of(this.client).pipe(map((client: MongoClient) => {

            let ns = this.getNamespace(dbOrNamespace)
            let collection = client.db(ns.db).collection(ns.collection)
            return collection



        }))

    }

    public getDb$(namespace?: string) {
        return of(this.client).pipe(map((client: MongoClient) => {

            let ns = this.getNamespace(namespace, true)
            let db = client.db(ns.db)
            return db

        }))


    }
    public insert$<T,E>(collectionName: string, values: E): Observable<T>  {

        let fn = (collection: Collection) => collection.insertOne(values)

        let obs$ = this.getCollection$(collectionName)
        if (Array.isArray(values)) {
            let fnMany = (collection: Collection) => collection.insertMany(values)

            return obs$.pipe(operatorMongoCollection(fnMany))
        }

        return obs$.pipe(operatorMongoCollection(fn))
    }
    public async insert<T,E> (collectionName: string, values: E): Promise<T>  {

        let fn = (collection: Collection) => collection.insertOne(values)

        let obs$ = this.getCollection$(collectionName)
        if (Array.isArray(values)) {
            let fnMany = (collection: Collection) => collection.insertMany(values)

            return obs$.pipe(operatorMongoCollection(fnMany)).toPromise()
        }

         obs$.pipe(operatorMongoCollection(fn)).toPromise()
    }
    */ 
    public getCollection <T>(ns:string ) : MongoRxCollection<T>{
        let params  =   this.parseNamespace(ns)
        return new MongoRxCollection(params.db,params.collection,this.client)
    
    }
     /*
    public operateOnCollection<T, R>(collectionName: string, fn: <T, R>(collection: Collection) =>
        Promise<any>) {

        return this.getCollection$(collectionName).pipe(operatorMongoCollection(fn))
    }

    public operateOnDb(fn: <T>(db: Db) => Promise<T>, db?: string) {

        return this.getDb$(db).pipe(operatorMongoDB(fn))
    }
*/
    static doOperation<T>(obs: Observable<MongoClient>, promise: Promise<T>) {

        return obs.pipe(flatMap(client => {

            return from(promise)
        }))
    }
    async dispose() {
        await this.client.close()
    }
    static getNamespace (name:string){

        
    }

}


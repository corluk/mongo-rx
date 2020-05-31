import { MongoRxCollection } from './MongoRxCollection';
 
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
    public setClientOptions(options?: MongoClientOptions) {
        if(!options)
            options = {}
        let defaultOptions =  { useUnifiedTopology: true } 
        options = {...options , ...defaultOptions}
        this.clientOptions = options
    }


    public static getInstance(): MongoRx {
        
        if (!(MongoRx.instance instanceof MongoRx)) {

            MongoRx.instance = new MongoRx
        }
        return MongoRx.instance
    }
    public async init(builder: MongoUriBuilderConfig,clientOptions?:MongoClientOptions) {
        this.setClientOptions(clientOptions)
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

  

    public getCollection <T>(ns:string ) : MongoRxCollection<T>{
        let params  =   this.parseNamespace(ns)
        return new MongoRxCollection(params.db,params.collection,this.client)
    
    }
   
    static doOperation<T>(obs: Observable<MongoClient>, promise: Promise<T>) {

        return obs.pipe(flatMap(client => {

            return from(promise)
        }))
    }
    async dispose() {
        await this.client.close()
    }
     

}


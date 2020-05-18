import { MongoClient, MongoClientOptions, MongoCallback, Db, Collection, IndexOptions } from "mongodb"
import { Observable, from, of, bindCallback, Observer, observable } from "rxjs"
import { map, flatMap } from "rxjs/operators"
import {MongoUriBuilderConfig , mongoUriBuilder} from "./MongUriBuilder"
 
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
    public async init(builder : MongoUriBuilderConfig){
        let uri = mongoUriBuilder(builder).toString()
        this.client =  new MongoClient( uri, this.clientOptions) 
        await this.client.connect()
        
    }

    public setDefaultDb(db: string) {
        this.defaultDb = db
    }
    public getClient(){
        return this.client
    }


    private getNamespace(param: string, onlyDb: boolean = false): { db: string, collection: string } {

        let db = this.defaultDb
        let collection = param
        let returnValue = {
            db: db,
            collection: collection
        }
        if (/[\w\d]+\.[\w\d]+/.test(param)) {
            returnValue.collection = null
            let _param = param.split(".")

            returnValue.db = param[0]
            returnValue.collection = param[1]
        }


        if (typeof returnValue.db != "string") {
            throw new Error("you must ")
        }
        if (!onlyDb && typeof returnValue.collection != "string") {
            throw new Error("you must set collection with namespace as db.collection or setDefaultDb first then collection as param")
        }


        return returnValue

    }
    
    public getCollection$(dbOrNamespace?: string): Observable<Collection> {


        return of(this.client).pipe(map( (client:MongoClient) => {
            
                let ns = this.getNamespace(dbOrNamespace)
                let collection = client.db(ns.db).collection(ns.collection)
                return collection  
             
             

        }))

    }

    public getDb$(params:string ){
        return of(this.client).pipe(map( (client:MongoClient) => {
            
            let ns = this.getNamespace(params,true )
            let db = client.db(ns.db)
            return db   
         
        }))


    }
    
   static   doOperation<T> (obs : Observable<MongoClient> , promise: Promise<T>) {

        return obs.pipe(flatMap(client => {

            return from(promise)
        }))
   }
   async dispose(){
       await this.client.close()
   }


}


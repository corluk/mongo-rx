import { MongoRxCollection } from './MongoRxCollection';
 
import { MongoClient, MongoClientOptions} from "mongodb"
import { Observable, from,  } from "rxjs" 
import {   flatMap } from "rxjs/operators"
import {   mongoUriBuilder } from "./MongUriBuilder"
 import {MongoRxOptions,MongoUriBuilderConfig,strToMongoNamespace } from "./index"
import { AbstractRxCollection } from '.';

 



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

    public static client (){
        return MongoRx.getInstance().getClient()
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


    public  strToMongoNamespace (param: string, onlyDb: boolean = false): { db: string, collection: string } {

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
            throw new Error(` typeof db is not a string possibly {db}.{colllection} isn't proper : check ${param}  sent as first argument of this function `)
        }
        if (!onlyDb && typeof returnValue.collection != "string") {
            throw new Error("you must set collection with namespace as db.collection or setDefaultDb first then collection as param")
        }


        return returnValue

    }

  

    public  getCollection <T>(ns:string | {db:string, collection:string }  ) : MongoRxCollection<T>{
          
        let rxCollection = new MongoRxCollection<T>()
        if(typeof ns == "string") {
            ns = strToMongoNamespace (ns)
        }
        rxCollection.setDbInfo(ns)
        
        rxCollection.connect(this.getClient())
       
        return rxCollection
    
    }
  
    async dispose() {
        await this.client.close()
    }
    

}


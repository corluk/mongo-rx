import { MongoClient, MongoClientOptions, MongoCallback  , Db, Collection, IndexOptions} from "mongodb"
import { Observable, from, of, bindCallback, Observer, observable } from "rxjs"
import {map, flatMap } from "rxjs/operators"

export enum MongoInsertType {

    ONE , 
    MANY , 
    BULKWRITE  
}

export interface MongoRxOptions{

    MongoClientOptions : MongoClientOptions 
}

export class MongoRx  {
    options : MongoRxOptions
    static instance  
    client : MongoClient

    private constructor(options? : MongoRxOptions){

        let defaultOpts : MongoRxOptions = {

            MongoClientOptions : {
                connectTimeoutMS : 1000 
            }
        }

        this.options = { ...defaultOpts , ...options }
    }

    public static getInstance() : MongoRx{

        if(! (MongoRx.instance instanceof MongoRx )){

            MongoRx.instance = new MongoRx  
        }
        return MongoRx.instance
    }
    public initCient(uri , options : MongoClientOptions) {
        options = this.options.MongoClientOptions
        this.client = new MongoClient(uri,options)
    }
    public getClient(uri? , options? : MongoClientOptions){


        if(! this.client ){

            if(!uri) throw new Error("you must set uri ")
            this.initCient(uri,options)
             
        }

        return this.client 
        

    }
    getCollection(dbname :string , collectionName:string ) : Observable<Collection>{
        
      return   from(this.client.connect()).pipe(
            map( (client ) => { 
                let db = client.db(dbname)
               
               if(!db) throw new Error(`${dbname} not exists`) 
                let collection = db.collection(collectionName)
               
                
                return collection
            }))


    }
    getIndexInfo(dbname: string  , collectionName  : string   ) {
            
       let r =  this.getCollection(dbname,collectionName).pipe(flatMap((collection : Collection,index) => {
           
          return  Observable.create((observer : Observer<any>) => {

                collection.indexInformation((err,result) => {

                    if(err) observer.error(err) 
                    else observer.next(result)
                    
                })
                
           })
            
         }))
        
     
     
     return r;
    }   
    insert(dbName : string , collectionName : string  , values: {}, type:MongoInsertType){
        let r =  this.getCollection(dbName,collectionName).pipe(flatMap((collection : Collection,index) => {



            return Observable.create((observer:Observer<any>) => {
                switch (type) {

                    case MongoInsertType.ONE : 
                        from(collection.insertOne(values)).pipe(result => observer.next(result))
                }

            })


        })
       
    }
}
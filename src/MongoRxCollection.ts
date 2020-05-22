import { MongoRx } from './MongoRx';
import { flatMap  , map } from 'rxjs/operators';
import { MongoClient, Collection, Cursor, FilterQuery, UpdateQuery } from 'mongodb';
import {of , Observable ,from } from "rxjs"
import {sink} from "rxjs-utils"

export interface CursorQuery<T,R>{
    prepare : (collection : Collection<any>) => Cursor<T> 
    execute : (cursor:Cursor<T>) => Observable<R>
}
export class MongoRxCollection<T> {

    static operator <T>(fn : (collection : Collection<T>) => Promise<T>) : (source : Observable<Collection<T>>) => Observable<T>   {

        const _fn = (source : Observable<Collection>) =>{
    
          return   source.pipe(flatMap (collection  => {
    
                    return from (fn(collection))
            }))
        }
        return _fn
    }

     
    collection : Collection<T>

   
    public constructor(collectionName  : string, db: string  ,client : MongoClient ){
       this.collection =  client.db(db).collection(collectionName )
        
    }
    public get (){
        return this.collection 
    }
    public get$(){
        
        return of(this.collection)
    }
    public update$( filterQuery : FilterQuery<T> , updateQuery  : UpdateQuery<T>,type?:string  ){


        let update = (collection : Collection ) => from(collection.update(filterQuery,updateQuery))
        

        return this.get$().pipe(flatMap(update))

    }
    public insert$(values: T)  {
        
        let fn = (collection: Collection) => collection.insertOne(values)

        let obs$ = this.get$() 
        if (Array.isArray(values)) {
            let fnMany = (collection: Collection) => collection.insertMany(values)

            return obs$.pipe(MongoRxCollection.operator(fnMany))
        }

        return obs$.pipe(MongoRxCollection.operator(fn))
    }

    public async insert( values:T) {

      return   await sink(this.insert$(values))
    }
     
    cursor$  <T,R>(prepare  : (collection : Collection<any>) => Cursor<T> , onCursor : (cursor:Cursor<T>) => Observable<R> ) : Observable<R>   {

        return this.get$().pipe(map(col => prepare(col)), flatMap(cursor => onCursor(cursor) ))    
         
    }

    async cursor <T,R>(prepare  : (collection : Collection<any>) => Cursor<T> , onCursor : (cursor:Cursor<T>) => Observable<R> )   {

       return await  sink(this.cursor$(prepare,onCursor))
    }

}

import { flatMap } from 'rxjs/operators';
import { Observable ,from , of   } from 'rxjs';
import { MongoClient, Collection, MongoCallback, ObjectId, Db } from 'mongodb';

// usegage 


export const operatorMongoCollection  = <T>(fn : (collection : Collection<T>) => Promise<T>) => {

    const _fn = (source : Observable<Collection>) =>{

      return   source.pipe(flatMap (collection  => {

                return from (fn(collection))
        }))
    }
    return _fn
}
let db : Db
  
export const operatorMongoDB = <R>(fn : (collection : Db) => Promise<R>) => {

    const _fn = (source : Observable<Db>) =>{

      return   source.pipe(flatMap (collection  => {

                return from (fn(collection))
        }))
    }
    return _fn
}
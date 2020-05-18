import { flatMap } from 'rxjs/operators';
import { Observable ,from , of   } from 'rxjs';
import { MongoClient, Collection, MongoCallback, ObjectId, Db } from 'mongodb';

// usegage 


export const mongoOperator = <T>(fn : (collection : Collection<T>|Db) => Promise<T>) => {

    const _fn = (source : Observable<Collection|Db>) =>{

      return   source.pipe(flatMap (collection  => {

                return from (fn(collection))
        }))
    }
    return _fn
}
 
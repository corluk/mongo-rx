import { MongoRxCollection } from './MongoRxCollection';
import { MongoRx } from './MongoRx';


export const callfor  =   <T,R>(cb: (collectionrx : MongoRxCollection<T>) => R ) :  (ns:string)=> R => { 

    const fn = (ns:string )=>{


     return   cb.call(null,MongoRx.getInstance().getCollection(ns))
    }
    return fn 

}

export const drop = (cb) =>{

    return callfor(cb)
}

export const createIndex = (indexes: )=>{

     callfor(collectionrx  => )
}



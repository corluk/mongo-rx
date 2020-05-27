
import { switchMap } from 'rxjs/operators';
import { MongoRx } from './MongoRx';
import { flatMap, map } from 'rxjs/operators';
import { MongoClient, Collection, Cursor, FilterQuery, UpdateQuery, InsertOneWriteOpResult, InsertWriteOpResult, UpdateOneOptions, UpdateManyOptions, FindOneOptions, CursorResult, OptionalId, CollectionMapFunction, CollectionReduceFunction } from 'mongodb';
import { of, Observable, from, OperatorFunction } from "rxjs"
import { sink } from "rxjs-utils"
import { WithId } from "mongodb"
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
export class MongoRxCollection<T> {
    collection: Collection<T>
    public constructor(public readonly collectionName: string, public readonly db: string, client: MongoClient) {
        this.collection = client.db(db).collection(collectionName)
    }
    static operator<T>(fn: (collection: Collection<T>) => Promise<T>): (source: Observable<Collection<T>>) => Observable<T> {
        const _fn = (source: Observable<Collection>) => {
            return source.pipe(flatMap(collection => {
                return from(fn(collection))
            }))
        }
        return _fn
    }

    public get() {

        return this.collection
    }
    public get$() {
        return of(this.collection)
    }
    public update$(params: UpdateParams<T>) {
        let update = (collection: Collection) => from(collection.updateOne(params.filterQuery, params.updateQuery, params.updateOneOptions))
        if (params.updateManyOptions) {
            update = (collection: Collection) => from(collection.updateMany(params.filterQuery, params.updateQuery, params.updateManyOptions))
        }
        return this.get$().pipe(flatMap(update))
    }
    public async update(params: UpdateParams<T>) {
        return this.update$(params).toPromise()
    }
    public insert$(values: T | T[]): Observable<InsertOneWriteOpResult<WithId<T>> | InsertWriteOpResult<WithId<T>>> {
        let fn = (collection: Collection) => collection.insertOne(values)
        let obs$ = this.get$()
        if (Array.isArray(values)) {
            let fnMany = (collection: Collection) => collection.insertMany(values)
            return obs$.pipe(MongoRxCollection.operator(fnMany))
        }
        return obs$.pipe(MongoRxCollection.operator(fn))
    }
    public async insert(values: T | T[]): Promise<InsertOneWriteOpResult<WithId<T>> | InsertWriteOpResult<WithId<T>>> {
        return this.insert$(values).toPromise()
    }
    cursorOp$<R>(params: CursorQuery<T, R>): (source: Observable<Collection<T>>) => Observable<T | R | Cursor<T>> {

        const fn = (source: Observable<Collection<T>>): Observable<T | R | Cursor<T>> => {
            let result: R
            return source.pipe(switchMap((collection: Collection) => {

                if (params.prepare && params.execute) {
                    let cursor = params.prepare(collection)
                    if (cursor instanceof Promise) return from(cursor)
                    let result = params.execute(cursor)
                    let obs$: Observable<any> = {} as Observable<any>
                    cursor.close(cb => {
                        if (result instanceof Promise) {
                            obs$ = from(result)
                        } else {
                            obs$ = of(result)
                        }
                    })
                    return obs$
                }
                let cursor = params.prepare(collection)
                if (cursor instanceof Promise) return from(cursor)
                return of(cursor)

            }))
        }
        return fn
    }
    getCursor$(fn: (collection: Collection<any>) => Cursor<T>): Observable<Cursor<T>> {
        return this.get$().pipe(flatMap(collection => of(fn(collection))))
    }
    async  getCursor(fn: (collection: Collection<any>) => Cursor<T>): Promise<Cursor<T>> {
        return this.getCursor$(fn).toPromise()
    }
    cursor$<R>(params: CursorQuery<T, R>): Observable<any> {
        return this.get$().pipe(this.cursorOp$(params))
    }
    async cursor<R>(params: CursorQuery<T, R>): Promise<any> {
        return await this.cursor$(params).toPromise()
    }
    find<R>(params: Find<T, R>): Observable<R> {
        if (params.findOneOptions) {
            let obs$ = this.get$()
            let fnOne = (collection: Collection) => collection.findOne(params.filter, params.findOneOptions)
            return obs$.pipe(flatMap(fnOne))
        }
        let execute = params.execute != null ? params.execute : (cursor) => cursor.count()
        let cursorQuery = {
            prepare: (collection: Collection) => collection.find(params.filter),
            execute: execute
        }
        return this.cursor$(cursorQuery)
    }
    findAnd$(params: FindAnd<T>) {
        let fn = (collection: Collection) => collection.findOneAndDelete(params.filter)
        if (params.updateQuery) {
            fn = (collection: Collection) => collection.findOneAndUpdate(params.filter, params.updateQuery)
        } else if (params.replacement) {
            fn = (collection: Collection) => collection.findOneAndReplace(params.filter, params.replacement)
        }
        return this.get$().pipe(MongoRxCollection.operator(fn))
    }
    async findAnd(params: FindAnd<T>) {
        return this.findAnd$(params).toPromise()
    }
    convertToRx(fn: string, args: any[])  {
       return  this.get$().pipe(switchMap((collection: Collection<T>) => {
            if (typeof collection[fn] == "function") {
                let value = (collection[fn] as Function).apply(collection, args)
                if (value instanceof Promise) return from(value)
                return of(value)
            }
            throw new Error(`${fn} : is not a function on collection `)

        }))
    }

    convert<R>(fn : (collection:Collection<T>)=> Observable<R>) :Observable<unknown>{

       return  this.get$().pipe(switchMap(collection => {

            return fn.call(null,collection) 
        }))
    }
}

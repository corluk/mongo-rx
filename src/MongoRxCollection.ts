

import { switchMap } from 'rxjs/operators';
import { MongoRx } from './MongoRx';
import { flatMap, map } from 'rxjs/operators';
import { MongoClient, Collection, Cursor, FilterQuery, UpdateQuery, InsertOneWriteOpResult, InsertWriteOpResult, UpdateOneOptions, UpdateManyOptions, FindOneOptions, CursorResult, OptionalId, CollectionMapFunction, CollectionReduceFunction } from 'mongodb';
import { of, Observable, from, OperatorFunction } from "rxjs"
import { UpdateParams, CursorQuery, Find, FindAnd , operator } from "./index"
import { WithId, IndexOptions } from "mongodb"


export class MongoRxCollection<T> {
    private collection: Collection<T>

    protected dbInfo: { db: string, collection: string }

   
    public setDbInfo(ns: { db: string, collection: string }) {
        this.dbInfo = ns

    }

    public getDbInfo() {
        return this.dbInfo
    }

    connect(mongoClient: MongoClient) {

        this.collection = mongoClient.db(this.dbInfo.db).collection(this.dbInfo.collection)
    }
 

    public get() {
        if (this.collection == null) {
            throw new Error("you must connect to collection by using connect method of this class ")
            //     this.collection =  this.mongoRx.getClient().db(this.dbInfo.db).collection(this.dbInfo.collection)
        }
        return this.collection
    }
    public get$() {
        return of(this.get())
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
            return obs$.pipe(operator(fnMany))
        }
        return obs$.pipe(operator(fn))
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
    find<R>(params: Find<T, R>): Promise<R> {

        return this.find$(params).toPromise()
    }
    /**
     * 
     * @param params 
     * @returns (cursor:Cursor) => any | cursor.count()
     *  
     */
    find$<R>(params: Find<T, R>): Observable<R> {
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
        return this.get$().pipe(operator(fn))
    }
    async findAnd(params: FindAnd<T>) {
        return this.findAnd$(params).toPromise()
    }
    toRx$<R>(fn: (collection: Collection<T>) => any): Observable<R> {

        return this.get$().pipe(switchMap(collection => {

            let value: R = fn.call(null, collection)
            if (value instanceof Promise)
                return from(value) as Observable<R>
            return of(value as {}) as Observable<R>
        }))


    }
    toRx<R>(fn: (collection: Collection<T>) => any): Promise<R> {

        return this.toRx$(fn).toPromise() as Promise<R>


    }
      
    safeDrop() {
        try {
            this.get().drop()
        }
        catch (err) { }

    }

    public createIndex$(index: any, options: IndexOptions): Observable<any> {



        if (Array.isArray(index)) {
            return this.toRx$(collection => collection.createIndexes(index))

        }
        return this.toRx$(collection => collection.createIndex(index, options))


    }
    public createIndex(index: any, options: IndexOptions): Promise<any> {


        return this.createIndex$(index, options).toPromise()

    }

    findAll$(){

        return this.find$({filter : {}})
    }
    findAll(){
        return this.findAll$().toPromise()
    }
}

export abstract class AbstractRxCollection<T> extends MongoRxCollection<T> {

    constructor(){
            super()
    }
    abstract async setup() :  Promise<void> 
     async init() {
         this.connect(MongoRx.client())
         await   this.setup()
    }


}
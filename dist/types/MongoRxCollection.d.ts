import { MongoClient, Collection, Cursor, InsertOneWriteOpResult, InsertWriteOpResult } from 'mongodb';
import { Observable } from "rxjs";
import { UpdateParams, CursorQuery, Find, FindAnd } from "./index";
import { WithId, IndexOptions } from "mongodb";
export declare class MongoRxCollection<T> {
    private collection;
    protected dbInfo: {
        db: string;
        collection: string;
    };
    setDbInfo(ns: {
        db: string;
        collection: string;
    }): void;
    getDbInfo(): {
        db: string;
        collection: string;
    };
    connect(mongoClient: MongoClient): void;
    get(): Collection<T>;
    get$(): Observable<Collection<T>>;
    update$(params: UpdateParams<T>): Observable<import("mongodb").UpdateWriteOpResult>;
    update(params: UpdateParams<T>): Promise<import("mongodb").UpdateWriteOpResult>;
    insert$(values: T | T[]): Observable<InsertOneWriteOpResult<WithId<T>> | InsertWriteOpResult<WithId<T>>>;
    insert(values: T | T[]): Promise<InsertOneWriteOpResult<WithId<T>> | InsertWriteOpResult<WithId<T>>>;
    cursorOp$<R>(params: CursorQuery<T, R>): (source: Observable<Collection<T>>) => Observable<T | R | Cursor<T>>;
    getCursor$(fn: (collection: Collection<any>) => Cursor<T>): Observable<Cursor<T>>;
    getCursor(fn: (collection: Collection<any>) => Cursor<T>): Promise<Cursor<T>>;
    cursor$<R>(params: CursorQuery<T, R>): Observable<any>;
    cursor<R>(params: CursorQuery<T, R>): Promise<any>;
    find<R>(params: Find<T, R>): Promise<R>;
    /**
     *
     * @param params
     * @returns (cursor:Cursor) => any | cursor.count()
     *
     */
    find$<R>(params: Find<T, R>): Observable<R>;
    findAnd$(params: FindAnd<T>): Observable<any>;
    findAnd(params: FindAnd<T>): Promise<any>;
    toRx$<R>(fn: (collection: Collection<T>) => any): Observable<R>;
    toRx<R>(fn: (collection: Collection<T>) => any): Promise<R>;
    safeDrop(): void;
    createIndex$(index: any, options: IndexOptions): Observable<any>;
    createIndex(index: any, options: IndexOptions): Promise<any>;
    findAll$(): Observable<unknown>;
    findAll(): Promise<unknown>;
}
export declare abstract class AbstractRxCollection<T> extends MongoRxCollection<T> {
    constructor();
    abstract setup(): Promise<void>;
    init(): Promise<void>;
}

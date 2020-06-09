import { InsertWriteOpResult } from 'mongodb';
import { Observable } from 'rxjs';
import { MongoRxCollection } from './MongoRxCollection';
export declare class MongoRxCSV<T> {
    static read$<T>(csvFile: string): Observable<T[]>;
    static insert$<T>(csvFile: string, mongoRxCollection: MongoRxCollection<T>): Observable<InsertWriteOpResult<any> | import("mongodb").InsertOneWriteOpResult<any>>;
    readCsv(csvFile: string): Promise<T[]>;
    readCsv$(csvFile: string): Observable<T[]>;
    insertCsv$(mongoRxCollection: MongoRxCollection<any>, csvFile: string): Observable<InsertWriteOpResult<any> | import("mongodb").InsertOneWriteOpResult<any>>;
    insertCsv(mongoRxCollection: MongoRxCollection<any>, csvFile: string): Promise<InsertWriteOpResult<any> | import("mongodb").InsertOneWriteOpResult<any>>;
}

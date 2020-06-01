import { InsertWriteOpResult } from 'mongodb';
import { switchMap } from 'rxjs/operators';
import {from  , Observable } from 'rxjs';
import { MongoRxCollection } from './MongoRxCollection';
import { MongoRx } from './MongoRx';
import { createReadStream } from 'fs';
import csvParser from "csv-parser"

export class MongoRxCSV<T> {

    static read$<T>(csvFile:string) {

        return new MongoRxCSV<T>().readCsv$(csvFile)
    }

    static insert$<T>(csvFile :string,mongoRxCollection : MongoRxCollection<T>) {
       return new MongoRxCSV<T>().insertCsv$(mongoRxCollection,csvFile)  
    
    }
    readCsv(csvFile:string) : Promise<T[]> {

        return new Promise( (resolve , reject )=>{
            let result :any[] = []
            let outdata = ""
            createReadStream(csvFile,{
                encoding:"utf-8"
            }).pipe(csvParser( )).on("data", (data:Buffer)=>{
              
                result.push(data)
                
            }).on("end",()=>{
                resolve(result)
            }).on("error",(err)=>{
                reject(err)
            })
            
    
    
        })
        
    }

    readCsv$( csvFile :string ) : Observable<T[]> {

        return from(this.readCsv(csvFile))
    }

    insertCsv$(mongoRxCollection : MongoRxCollection<any>, csvFile: string  ){

        return this.readCsv$(csvFile).pipe(switchMap(values => {

            return mongoRxCollection.insert$(values)
        }))

       

    }
    insertCsv(mongoRxCollection : MongoRxCollection<any>, csvFile: string  ) {
        return this.insertCsv$(mongoRxCollection,csvFile).toPromise()
    }
}
import { switchMap } from 'rxjs/operators';
import { from } from 'rxjs';
import { createReadStream } from 'fs';
import csvParser from "csv-parser";
var MongoRxCSV = /** @class */ (function () {
    function MongoRxCSV() {
    }
    MongoRxCSV.read$ = function (csvFile) {
        return new MongoRxCSV().readCsv$(csvFile);
    };
    MongoRxCSV.insert$ = function (csvFile, mongoRxCollection) {
        return new MongoRxCSV().insertCsv$(mongoRxCollection, csvFile);
    };
    MongoRxCSV.prototype.readCsv = function (csvFile) {
        return new Promise(function (resolve, reject) {
            var result = [];
            var outdata = "";
            createReadStream(csvFile, {
                encoding: "utf-8"
            }).pipe(csvParser()).on("data", function (data) {
                result.push(data);
            }).on("end", function () {
                resolve(result);
            }).on("error", function (err) {
                reject(err);
            });
        });
    };
    MongoRxCSV.prototype.readCsv$ = function (csvFile) {
        return from(this.readCsv(csvFile));
    };
    MongoRxCSV.prototype.insertCsv$ = function (mongoRxCollection, csvFile) {
        return this.readCsv$(csvFile).pipe(switchMap(function (values) {
            return mongoRxCollection.insert$(values);
        }));
    };
    MongoRxCSV.prototype.insertCsv = function (mongoRxCollection, csvFile) {
        return this.insertCsv$(mongoRxCollection, csvFile).toPromise();
    };
    return MongoRxCSV;
}());
export { MongoRxCSV };

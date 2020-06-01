"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoRxCSV = void 0;
var operators_1 = require("rxjs/operators");
var rxjs_1 = require("rxjs");
var fs_1 = require("fs");
var csv_parser_1 = __importDefault(require("csv-parser"));
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
            fs_1.createReadStream(csvFile, {
                encoding: "utf-8"
            }).pipe(csv_parser_1.default()).on("data", function (data) {
                result.push(data);
            }).on("end", function () {
                resolve(result);
            }).on("error", function (err) {
                reject(err);
            });
        });
    };
    MongoRxCSV.prototype.readCsv$ = function (csvFile) {
        return rxjs_1.from(this.readCsv(csvFile));
    };
    MongoRxCSV.prototype.insertCsv$ = function (mongoRxCollection, csvFile) {
        return this.readCsv$(csvFile).pipe(operators_1.switchMap(function (values) {
            return mongoRxCollection.insert$(values);
        }));
    };
    MongoRxCSV.prototype.insertCsv = function (mongoRxCollection, csvFile) {
        return this.insertCsv$(mongoRxCollection, csvFile).toPromise();
    };
    return MongoRxCSV;
}());
exports.MongoRxCSV = MongoRxCSV;

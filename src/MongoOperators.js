"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.operatorMongoDB = exports.operatorMongoCollection = void 0;
var operators_1 = require("rxjs/operators");
var rxjs_1 = require("rxjs");
// usegage 
exports.operatorMongoCollection = function (fn) {
    var _fn = function (source) {
        return source.pipe(operators_1.flatMap(function (collection) {
            return rxjs_1.from(fn(collection));
        }));
    };
    return _fn;
};
var db;
exports.operatorMongoDB = function (fn) {
    var _fn = function (source) {
        return source.pipe(operators_1.flatMap(function (collection) {
            return rxjs_1.from(fn(collection));
        }));
    };
    return _fn;
};

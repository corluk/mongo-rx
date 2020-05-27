"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoRxCollection = void 0;
var operators_1 = require("rxjs/operators");
var operators_2 = require("rxjs/operators");
var rxjs_1 = require("rxjs");
var MongoRxCollection = /** @class */ (function () {
    function MongoRxCollection(collectionName, db, client) {
        this.collectionName = collectionName;
        this.db = db;
        this.collection = client.db(db).collection(collectionName);
    }
    MongoRxCollection.operator = function (fn) {
        var _fn = function (source) {
            return source.pipe(operators_2.flatMap(function (collection) {
                return rxjs_1.from(fn(collection));
            }));
        };
        return _fn;
    };
    MongoRxCollection.prototype.get = function () {
        return this.collection;
    };
    MongoRxCollection.prototype.get$ = function () {
        return rxjs_1.of(this.collection);
    };
    MongoRxCollection.prototype.update$ = function (params) {
        var update = function (collection) { return rxjs_1.from(collection.updateOne(params.filterQuery, params.updateQuery, params.updateOneOptions)); };
        if (params.updateManyOptions) {
            update = function (collection) { return rxjs_1.from(collection.updateMany(params.filterQuery, params.updateQuery, params.updateManyOptions)); };
        }
        return this.get$().pipe(operators_2.flatMap(update));
    };
    MongoRxCollection.prototype.update = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.update$(params).toPromise()];
            });
        });
    };
    MongoRxCollection.prototype.insert$ = function (values) {
        var fn = function (collection) { return collection.insertOne(values); };
        var obs$ = this.get$();
        if (Array.isArray(values)) {
            var fnMany = function (collection) { return collection.insertMany(values); };
            return obs$.pipe(MongoRxCollection.operator(fnMany));
        }
        return obs$.pipe(MongoRxCollection.operator(fn));
    };
    MongoRxCollection.prototype.insert = function (values) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.insert$(values).toPromise()];
            });
        });
    };
    MongoRxCollection.prototype.cursorOp$ = function (params) {
        var fn = function (source) {
            var result;
            return source.pipe(operators_1.switchMap(function (collection) {
                if (params.prepare && params.execute) {
                    var cursor_1 = params.prepare(collection);
                    if (cursor_1 instanceof Promise)
                        return rxjs_1.from(cursor_1);
                    var result_1 = params.execute(cursor_1);
                    var obs$_1 = {};
                    cursor_1.close(function (cb) {
                        if (result_1 instanceof Promise) {
                            obs$_1 = rxjs_1.from(result_1);
                        }
                        else {
                            obs$_1 = rxjs_1.of(result_1);
                        }
                    });
                    return obs$_1;
                }
                var cursor = params.prepare(collection);
                if (cursor instanceof Promise)
                    return rxjs_1.from(cursor);
                return rxjs_1.of(cursor);
            }));
        };
        return fn;
    };
    MongoRxCollection.prototype.getCursor$ = function (fn) {
        return this.get$().pipe(operators_2.flatMap(function (collection) { return rxjs_1.of(fn(collection)); }));
    };
    MongoRxCollection.prototype.getCursor = function (fn) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getCursor$(fn).toPromise()];
            });
        });
    };
    MongoRxCollection.prototype.cursor$ = function (params) {
        return this.get$().pipe(this.cursorOp$(params));
    };
    MongoRxCollection.prototype.cursor = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cursor$(params).toPromise()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MongoRxCollection.prototype.find = function (params) {
        if (params.findOneOptions) {
            var obs$ = this.get$();
            var fnOne = function (collection) { return collection.findOne(params.filter, params.findOneOptions); };
            return obs$.pipe(operators_2.flatMap(fnOne));
        }
        var execute = params.execute != null ? params.execute : function (cursor) { return cursor.count(); };
        var cursorQuery = {
            prepare: function (collection) { return collection.find(params.filter); },
            execute: execute
        };
        return this.cursor$(cursorQuery);
    };
    MongoRxCollection.prototype.findAnd$ = function (params) {
        var fn = function (collection) { return collection.findOneAndDelete(params.filter); };
        if (params.updateQuery) {
            fn = function (collection) { return collection.findOneAndUpdate(params.filter, params.updateQuery); };
        }
        else if (params.replacement) {
            fn = function (collection) { return collection.findOneAndReplace(params.filter, params.replacement); };
        }
        return this.get$().pipe(MongoRxCollection.operator(fn));
    };
    MongoRxCollection.prototype.findAnd = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.findAnd$(params).toPromise()];
            });
        });
    };
    MongoRxCollection.prototype.convertToRx = function (fn, args) {
        return this.get$().pipe(operators_1.switchMap(function (collection) {
            if (typeof collection[fn] == "function") {
                var value = collection[fn].apply(collection, args);
                if (value instanceof Promise)
                    return rxjs_1.from(value);
                return rxjs_1.of(value);
            }
            throw new Error(fn + " : is not a function on collection ");
        }));
    };
    MongoRxCollection.prototype.convert = function (fn) {
        return this.get$().pipe(operators_1.switchMap(function (collection) {
            return fn.call(null, collection);
        }));
    };
    return MongoRxCollection;
}());
exports.MongoRxCollection = MongoRxCollection;

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
import { switchMap } from 'rxjs/operators';
import { MongoRx } from './MongoRx';
import { flatMap } from 'rxjs/operators';
import { of, from } from "rxjs";
import { operator } from "./index";
var MongoRxCollection = /** @class */ (function () {
    function MongoRxCollection() {
    }
    MongoRxCollection.prototype.setDbInfo = function (ns) {
        this.dbInfo = ns;
    };
    MongoRxCollection.prototype.getDbInfo = function () {
        return this.dbInfo;
    };
    MongoRxCollection.prototype.connect = function (mongoClient) {
        this.collection = mongoClient.db(this.dbInfo.db).collection(this.dbInfo.collection);
    };
    MongoRxCollection.prototype.get = function () {
        if (this.collection == null) {
            throw new Error("you must connect to collection by using connect method of this class ");
            //     this.collection =  this.mongoRx.getClient().db(this.dbInfo.db).collection(this.dbInfo.collection)
        }
        return this.collection;
    };
    MongoRxCollection.prototype.get$ = function () {
        return of(this.get());
    };
    MongoRxCollection.prototype.update$ = function (params) {
        var update = function (collection) { return from(collection.updateOne(params.filterQuery, params.updateQuery, params.updateOneOptions)); };
        if (params.updateManyOptions) {
            update = function (collection) { return from(collection.updateMany(params.filterQuery, params.updateQuery, params.updateManyOptions)); };
        }
        return this.get$().pipe(flatMap(update));
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
            return obs$.pipe(operator(fnMany));
        }
        return obs$.pipe(operator(fn));
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
            return source.pipe(switchMap(function (collection) {
                if (params.prepare && params.execute) {
                    var cursor_1 = params.prepare(collection);
                    if (cursor_1 instanceof Promise)
                        return from(cursor_1);
                    var result_1 = params.execute(cursor_1);
                    var obs$_1 = {};
                    cursor_1.close(function (cb) {
                        if (result_1 instanceof Promise) {
                            obs$_1 = from(result_1);
                        }
                        else {
                            obs$_1 = of(result_1);
                        }
                    });
                    return obs$_1;
                }
                var cursor = params.prepare(collection);
                if (cursor instanceof Promise)
                    return from(cursor);
                return of(cursor);
            }));
        };
        return fn;
    };
    MongoRxCollection.prototype.getCursor$ = function (fn) {
        return this.get$().pipe(flatMap(function (collection) { return of(fn(collection)); }));
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
        return this.find$(params).toPromise();
    };
    /**
     *
     * @param params
     * @returns (cursor:Cursor) => any | cursor.count()
     *
     */
    MongoRxCollection.prototype.find$ = function (params) {
        if (params.findOneOptions) {
            var obs$ = this.get$();
            var fnOne = function (collection) { return collection.findOne(params.filter, params.findOneOptions); };
            return obs$.pipe(flatMap(fnOne));
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
        return this.get$().pipe(operator(fn));
    };
    MongoRxCollection.prototype.findAnd = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.findAnd$(params).toPromise()];
            });
        });
    };
    MongoRxCollection.prototype.toRx$ = function (fn) {
        return this.get$().pipe(switchMap(function (collection) {
            var value = fn.call(null, collection);
            if (value instanceof Promise)
                return from(value);
            return of(value);
        }));
    };
    MongoRxCollection.prototype.toRx = function (fn) {
        return this.toRx$(fn).toPromise();
    };
    MongoRxCollection.prototype.safeDrop = function () {
        try {
            this.get().drop();
        }
        catch (err) { }
    };
    MongoRxCollection.prototype.createIndex$ = function (index, options) {
        if (Array.isArray(index)) {
            return this.toRx$(function (collection) { return collection.createIndexes(index); });
        }
        return this.toRx$(function (collection) { return collection.createIndex(index, options); });
    };
    MongoRxCollection.prototype.createIndex = function (index, options) {
        return this.createIndex$(index, options).toPromise();
    };
    MongoRxCollection.prototype.findAll$ = function () {
        return this.find$({ filter: {} });
    };
    MongoRxCollection.prototype.findAll = function () {
        return this.findAll$().toPromise();
    };
    return MongoRxCollection;
}());
export { MongoRxCollection };
var AbstractRxCollection = /** @class */ (function (_super) {
    __extends(AbstractRxCollection, _super);
    function AbstractRxCollection() {
        return _super.call(this) || this;
    }
    AbstractRxCollection.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.connect(MongoRx.client());
                        return [4 /*yield*/, this.setup()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return AbstractRxCollection;
}(MongoRxCollection));
export { AbstractRxCollection };

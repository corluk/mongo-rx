var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { MongoRxCollection } from './MongoRxCollection';
import { MongoClient } from "mongodb";
import { mongoUriBuilder } from "./MongUriBuilder";
import { strToMongoNamespace } from "./index";
var MongoRx = /** @class */ (function () {
    function MongoRx() {
        this.registry = [];
    }
    // connection : 
    // uri: string
    MongoRx.prototype.setClientOptions = function (options) {
        if (!options)
            options = {};
        var defaultOptions = { useUnifiedTopology: true };
        options = __assign(__assign({}, options), defaultOptions);
        this.clientOptions = options;
    };
    MongoRx.client = function () {
        return MongoRx.getInstance().getClient();
    };
    MongoRx.getInstance = function () {
        if (!(MongoRx.instance instanceof MongoRx)) {
            MongoRx.instance = new MongoRx;
        }
        return MongoRx.instance;
    };
    MongoRx.prototype.init = function (builder, clientOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var uri;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setClientOptions(clientOptions);
                        uri = mongoUriBuilder(builder).toString();
                        this.client = new MongoClient(uri, this.clientOptions);
                        return [4 /*yield*/, this.client.connect()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MongoRx.prototype.setDefaultDb = function (db) {
        this.defaultDb = db;
    };
    MongoRx.prototype.getClient = function () {
        return this.client;
    };
    MongoRx.prototype.strToMongoNamespace = function (param, onlyDb) {
        if (onlyDb === void 0) { onlyDb = false; }
        var db = this.defaultDb;
        var collection = param;
        var returnValue = {
            db: db,
            collection: collection
        };
        if (/[\w\d]+\.[\w\d]+/.test(param)) {
            returnValue.collection = null;
            var _param = param.split(".");
            returnValue.db = _param[0];
            returnValue.collection = _param[1];
        }
        if (typeof returnValue.db != "string") {
            throw new Error(" typeof db is not a string possibly {db}.{colllection} isn't proper : check " + param + "  sent as first argument of this function ");
        }
        if (!onlyDb && typeof returnValue.collection != "string") {
            throw new Error("you must set collection with namespace as db.collection or setDefaultDb first then collection as param");
        }
        return returnValue;
    };
    MongoRx.prototype.addToRegistry = function (collectionRx) {
        var ns = collectionRx.getDbInfo();
        this.registry.push({
            key: ns.db + "." + ns.collection,
            collection: collectionRx
        });
    };
    MongoRx.prototype.getCollection = function (ns) {
        if (typeof ns == "string") {
            ns = strToMongoNamespace(ns);
        }
        var namespace = ns;
        var strNamespace = namespace.db + "." + namespace.collection;
        if (this.registry.some(function (value) { return value.key == strNamespace; })) {
            var filtered = this.registry.filter(function (value) { return value.key == strNamespace; });
            var collectionRx = filtered[0].collection;
            if (!collectionRx.isConnected()) {
                collectionRx.connect(this.getClient());
            }
            return collectionRx;
        }
        var rxCollection = new MongoRxCollection();
        rxCollection.setDbInfo(namespace);
        rxCollection.connect(this.getClient());
        this.addToRegistry(rxCollection);
        return rxCollection;
    };
    MongoRx.prototype.dispose = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.close()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return MongoRx;
}());
export { MongoRx };

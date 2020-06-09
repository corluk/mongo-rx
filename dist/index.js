import { from } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { mongoUriBuilder } from './MongUriBuilder';
import { MongoRxCSV } from './MongoRxCsv';
import { MongoRxCollection } from './MongoRxCollection';
import { MongoRx } from "./MongoRx";
export default MongoRx;
export { MongoRxCSV, MongoRxCollection, mongoUriBuilder };
export var strToMongoNamespace = function (params, onlyDb) {
    if (onlyDb === void 0) { onlyDb = false; }
    var db = "temp";
    var collection = params;
    var returnValue = {
        db: db,
        collection: collection
    };
    if (/[\w\d]+\.[\w\d]+/.test(params)) {
        returnValue.collection = null;
        var _param = params.split(".");
        returnValue.db = _param[0];
        returnValue.collection = _param[1];
    }
    if (typeof returnValue.db != "string") {
        throw new Error(" typeof db is not a string possibly {db}.{colllection} isn't proper : check " + params + "  sent as first argument of this function ");
    }
    if (!onlyDb && typeof returnValue.collection != "string") {
        throw new Error("you must set collection with namespace as db.collection or setDefaultDb first then collection as param");
    }
    return returnValue;
};
export var operator = function (fn) {
    var _fn = function (source) {
        return source.pipe(flatMap(function (collection) {
            return from(fn(collection));
        }));
    };
    return _fn;
};

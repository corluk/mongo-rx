import { MongoRxCollection } from './MongoRxCollection';
export declare abstract class AbstractRxCollection<T> extends MongoRxCollection<T> {
    abstract setup(): Promise<void>;
    init(): Promise<void>;
}

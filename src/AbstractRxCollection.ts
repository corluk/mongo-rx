import { MongoRxCollection } from './MongoRxCollection';
import MongoRx from '.';




export abstract class AbstractRxCollection<T> extends MongoRxCollection<T> {

        
        abstract async setup() :  Promise<void> 
         async init() {
             this.connect(MongoRx.client())
             await   this.setup()
        }


}

import { MongoRxCSV } from './MongoRxCsv';
import { strToMongoNamespace } from './index';
import { resolve } from 'path';
import { MongoRx } from './MongoRx';
import { async } from 'rxjs/internal/scheduler/async';

beforeEach(async ()=>{
    await MongoRx.getInstance().init({
        host:"localhost"
        ,port : 27017
    })
 
})
afterEach(async ()=>{
    MongoRx.getInstance().dispose()

})
test("should connect to mongorx at localhost" ,  async()=>{ 

  
   expect(MongoRx.getInstance().client).not.toBeNull() 
   expect(MongoRx.getInstance().client.isConnected).toBeTruthy()

   
}) 

test("should collection ns :test.test1 add  value then drop ",async ()=>{
    let mongoRx = MongoRx.getInstance()
    let collectionRx = MongoRx.getInstance().getCollection("test.test1")

        
        expect(collectionRx.getDbInfo()).not.toBeNull()
    
        expect(collectionRx.getDbInfo().db).toBe("test") 
        await collectionRx.insert([{value:1},{value:2}])

       let count = await  collectionRx.find({
            filter : {}
        })

        expect(count).toBeGreaterThan(1)
 
})


test("should inserted csv file item gt 5 " , async ( ) =>{


    let csvFile = resolve(__dirname,"assets","test1.csv")
    let collectionRx = MongoRx.getInstance().getCollection("test.testcsv")
    let mongoRxCsv = new MongoRxCSV() 
    let inserted = await mongoRxCsv.insertCsv(collectionRx,csvFile) 
        expect(inserted).not.toBeNull()
    let found  = await collectionRx.find({filter: {}})
        expect(found).not.toBeNull() 
        expect(found).toBeGreaterThan(5)
})


test("should retook the same collection " , ()=>{

    let collectionRx = MongoRx.getInstance().getCollection("test.testcsv")

    let collectionRx2  =  MongoRx.getInstance().getCollection("test.testcsv")
        expect(collectionRx).toMatchObject(collectionRx2)

})
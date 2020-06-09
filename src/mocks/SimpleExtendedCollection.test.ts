import { SimpleExtendedCollection } from './SimpleExtendedCollection';
import { async } from 'rxjs/internal/scheduler/async';
import { MongoRx } from './../MongoRx';
import { MongoClient } from 'mongodb';



beforeEach(async() =>{

   await MongoRx.getInstance().init({
       host : "localhost"
   })

})

afterEach(async () =>{
    await MongoRx.getInstance().dispose()
})


test("should SimpleExtendedCollection have only one {name:'A'} find " ,async  ()=>{


    let newSimpleExtended = new SimpleExtendedCollection()
    newSimpleExtended.connect(MongoRx.client())
    await newSimpleExtended.setup()
    let found_count = await newSimpleExtended.findAll()
    expect(found_count).toBe(1)
})

test("should SimpleExtendedCollection instante only one time " ,async  ()=>{

  
    let newSimpleExtended = new SimpleExtendedCollection()

    newSimpleExtended.connect(MongoRx.client())
    await newSimpleExtended.setup()
    MongoRx.getInstance().addToRegistry(newSimpleExtended) 

    let newSimpleExtended2 = MongoRx.getInstance().getCollection(newSimpleExtended.getDbInfo())
    expect(newSimpleExtended2).toMatchObject(newSimpleExtended)
   
})
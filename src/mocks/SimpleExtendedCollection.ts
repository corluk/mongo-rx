import {AbstractRxCollection} from "../AbstractRxCollection" 
export interface Basic {
    name : string  
    value : number
}
export class SimpleExtendedCollection extends AbstractRxCollection<Basic>{
    dbInfo = {db:"test" , collection:"simple_extended"}
   async  setup(): Promise<void> {
        
        await this.createIndex({name:-1},{unique:true})
        try { 
           await this.insert([{name:"A", value:1}, {name:"A", value:1}])
        }catch(err){
            console.debug(err.message )
        }

    }


}
const moment = require('moment' )
const uuid = require('uuid'  )
// const low = require('lowdb')
const FileSync = require("lowdb/adapters/FileSync");

import low from 'lowdb'

enum TableInit {
    db_caidat       = "db_caidat",
    db_thidoikhang  = "db_thidoikhang",
    db_thiquyen     = "db_thiquyen",
    db_ban_quyen    = "db_ban_quyen"
}

interface ILowDB {
    initTable(table:string):Promise<any>
    getListTable(table:string):Promise<any>
    findAll(table:string):Promise<any>
    find(condition: object, table:string):Promise<any> 
    add(key:string, value:string,table:string, dataUpdate:any):Promise<any>
    update(record:any, table:string):Promise<any>
}
const table = ["db_caidat","db_thidoikhang","db_thiquyen","db_ban_quyen"]

class LowDbService implements ILowDB {
    constructor() {
        this.setup();
    }
    private db: low.LowdbAsync<any>;
    
    async setup (){
        const filename = process.env.DATABASE_JS || "database.json" 
        const adapter = new FileSync(filename);
        this.db = await low(adapter);
        console.log('this.db: ', this.db);
        // đọc file
        await this.db.read()
        // tạo table
        if(table.length > 0){
            for(let i =0; i< table.length;i++){
                let tb = await this.db.get(table[i]).value();
                if(!tb){
                    await this.db.set(table[i],{}).write();
                }
            }
        }
    }

    async initTable(table: string): Promise<any> {
        // const adapter = new FileSync(filename)
        // this.db = await lowdb(adapter)
    }
    getListTable(table: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    findAll(table: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    find(condition: object, table: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    add(key: string, value: string, table: string, dataUpdate: any): Promise<any> {
        throw new Error("Method not implemented.");
    }
    update(record: any, table: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    
}

module.exports = {LowDbService};

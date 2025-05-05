const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');


/// Bảng VĐV thi
class DBChampionEventService {
    constructor() {
        this.db = new sqlite3.Database('./database.sqlite');
        this.db.serialize(() => {
            // // table champ_event: 
            this.db.run(`
                CREATE TABLE IF NOT EXISTS champ_offical (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_name TEXT ,
                    num_member INTEGER DEFAULT 0,
                    category_id TEXT NOT NULL,
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now'))
                )
             `); 
        })
    }
}

const instance = new DBChampionEventService ();
module.exports = instance;

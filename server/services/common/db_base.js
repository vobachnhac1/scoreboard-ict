const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// age_group / competition_type / competition_event
/**
 *  Tạo API CRUD db_champion 
 *  age_group mapping db_champion
 *  Tạo CRUD API cho age_group nhóm tuổi
 *  Tạo CRUD API cho competition_type hình thức (biểu diễn/đối kháng)
 *  Tạo CRUD API cho competition_event hình thức nội dung thi (phân biệt giới tính)
 */

class DBCategoryService {
    constructor() {
        this.db = new sqlite3.Database(DB_SCHEME);
        this.db.serialize(() => {
            // // table champion_competition_type: HÌNH THỨC THI: ĐỐI KHÁNG/BIỂU DIỄN
            // this.db.run(`
            //     CREATE TABLE IF NOT EXISTS champion_competition_type (
            //         id INTEGER PRIMARY KEY AUTOINCREMENT,
            //         age_group_id INTEGER NOT NULL,
            //         type_name TEXT NOT NULL, -- 'Đối kháng' hoặc 'Biểu diễn'
            //         created_at TEXT DEFAULT (datetime('now')),
            //         updated_at TEXT DEFAULT (datetime('now')),
            //     FOREIGN KEY (age_group_id) REFERENCES age_group(id)
            //     )
            //  `); 
            // // table champion_competition_event: NỘI DUNG THI
            //  this.db.run(`
            //     CREATE TABLE IF NOT EXISTS champion_competition_event (
            //         id INTEGER PRIMARY KEY AUTOINCREMENT,
            //         competition_type_id INTEGER NOT NULL,
            //         event_number INTEGER NOT NULL, -- 1, 2, 3, 4
            //         gender TEXT CHECK (gender IN ('F', 'M')) NOT NULL,
            //         created_at TEXT DEFAULT (datetime('now')),
            //         updated_at TEXT DEFAULT (datetime('now')),
            //     FOREIGN KEY (competition_type_id) REFERENCES competition_type(id)
            //     )
            //  `); 
        })
    }
    

}

const instance = new DBCategoryService ();
module.exports = instance;

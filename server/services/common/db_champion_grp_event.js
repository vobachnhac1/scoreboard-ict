const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

class DBChampionEventGenderService {
    constructor() {
        this.db = new sqlite3.Database('./database.sqlite');
        this.db.serialize(() => {
            this.db.run(`
                CREATE TABLE IF NOT EXISTS champion_grp_event (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    champ_event_id TEXT NOT NULL,
                    gender_commons_key TEXT NOT NULL,
                    champ_grp_id TEXT NOT NULL,
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now'))
                )
             `); 
        })
    }

    createGrpEvent(body){
        return new Promise((resolve, reject) => {
            const { champ_event_id, gender_commons_key, champ_grp_id} = body
            const query = `
                INSERT INTO 
                    champion_grp_event (champ_event_id, gender_commons_key, champ_grp_id)
                VALUES (?, ?, ?)
            `;
            this.db.run(query, [champ_event_id, gender_commons_key, champ_grp_id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    }

      // Cập nhật
    updateGrpEvent(id, body){
        const { champ_event_id, gender_commons_key, champ_grp_id} = body
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE champion_grp_event
                SET champ_event_id = ?, gender_commons_key = ?, champ_grp_id = ?,  updated_at = datetime('now')
                WHERE id = ?
            `;
            this.db.run(query, [champ_event_id, gender_commons_key, champ_grp_id, id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    // Xoá
    deleteGrpEvent(id) {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM champion_grp_event WHERE id = ?`;
            this.db.run(query, [id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    // event_name: 'Thập Tự Quyền',
    // num_member: 1,
    // category_key: 'QU',
    // qu_type: 'DON',
    // description: 'Đơn luyện',

    // Lấy thông tin
    getGrpEvent(champ_grp_id, gender_id, qu_type) {
        return new Promise((resolve, reject) => {
            let input = []
            let query = ` 
                SELECT 
                    ch.tournament_name 'ten_giai',
                    gr.name 'nhom_thi',
                    ge.champ_event_id,
                    ge.gender_commons_key,
                    ge.champ_grp_id,
                    ge.id champ_grp_event_id,
                    en.category_key,
                    en.event_name,
                    en.num_member,
                    en.qu_type,
                    en.description
                FROM 
                    champion_grp_event ge,
                    champion_event en,
                    champion_group gr,
                    champion ch
                WHERE ge.champ_event_id = en.id
                AND ge.champ_grp_id = gr.id
                AND gr.tournament_id = ch.id
                AND ge.champ_grp_id = ?  ORDER BY ge.ID DESC`;
                input = [champ_grp_id]
            if(gender_id){
                query = `
                SELECT 
                    ch.tournament_name 'ten_giai',
                    gr.name 'nhom_thi',
                    ge.champ_event_id,
                    ge.gender_commons_key,
                    ge.champ_grp_id,
                    ge.id champ_grp_event_id,
                    en.category_key,
                    en.event_name,
                    en.num_member,
                    en.qu_type,
                    en.description
                FROM 
                    champion_grp_event ge,
                    champion_event en,
                    champion_group gr,
                    champion ch
                WHERE ge.champ_event_id = en.id
                AND ge.champ_grp_id = gr.id
                AND gr.tournament_id = ch.id
                AND ge.champ_grp_id = ?
                AND ge.gender_commons_key = ? ORDER BY ge.ID DESC`;
                input = [champ_grp_id, gender_id]
            }

            if(!gender_id && qu_type){
                query = `
                SELECT 
                    ch.tournament_name 'ten_giai',
                    gr.name 'nhom_thi',
                    ge.champ_event_id,
                    ge.gender_commons_key,
                    ge.champ_grp_id,
                    ge.id champ_grp_event_id,
                    en.category_key,
                    en.event_name,
                    en.num_member,
                    en.qu_type,
                    en.description
                FROM 
                    champion_grp_event ge,
                    champion_event en,
                    champion_group gr,
                    champion ch
                WHERE ge.champ_event_id = en.id
                AND ge.champ_grp_id = gr.id
                AND gr.tournament_id = ch.id
                AND ge.champ_grp_id = ?
                AND en.category_key = ? 
                ORDER BY ge.ID DESC`;
                input = [champ_grp_id, qu_type]

            }
            this.db.all(query, input, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    getGrpEventDistinct(champ_grp_id, gender_id, qu_type) {
        return new Promise((resolve, reject) => {
            let input = []
            let query = ` 
                SELECT 
                    DISTINCT ge.gender_commons_key gender_id
                FROM 
                    champion_grp_event ge,
                    champion_event en,
                    champion_group gr,
                    champion ch
                WHERE ge.champ_event_id = en.id
                AND ge.champ_grp_id = gr.id
                AND gr.tournament_id = ch.id
                AND ge.champ_grp_id = ?  ORDER BY ge.ID DESC`;
                input = [champ_grp_id]
            if(gender_id){
                query = `
                SELECT 
                    DISTINCT ge.gender_commons_key gender_id
                FROM 
                    champion_grp_event ge,
                    champion_event en,
                    champion_group gr,
                    champion ch
                WHERE ge.champ_event_id = en.id
                AND ge.champ_grp_id = gr.id
                AND gr.tournament_id = ch.id
                AND ge.champ_grp_id = ?
                AND ge.gender_commons_key = ? ORDER BY ge.ID DESC`;
                input = [champ_grp_id, gender_id]
            }

            if(!gender_id && qu_type){
                query = `
                SELECT 
                    DISTINCT ge.gender_commons_key gender_id
                FROM 
                    champion_grp_event ge,
                    champion_event en,
                    champion_group gr,
                    champion ch
                WHERE ge.champ_event_id = en.id
                AND ge.champ_grp_id = gr.id
                AND gr.tournament_id = ch.id
                AND ge.champ_grp_id = ?
                AND en.category_key = ? 
                ORDER BY ge.ID DESC`;
                input = [champ_grp_id, qu_type]

            }
            this.db.all(query, input, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }


    // Lấy nội dung thi theo giới tính 
    getEventByCategory(gender_commons_key) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM champion_grp_event WHERE gender_commons_key = ? ORDER BY ID DESC`;
            this.db.all(query, [gender_commons_key], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Lấy nội dung thi theo giới tính 
    getEventById(id) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    ge.* 
                FROM 
                    champion_grp_event ge,
                    champion_event en
                WHERE ge.id = ?
                AND ge.champ_event_id = en.id
                AND en.category_key = 'DK'
                `;
            this.db.get(query, [id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

const instance = new DBChampionEventGenderService ();
module.exports = instance;

const { BetterSQLiteWrapper } = require('./db_better_sqlite3');
const fs = require('fs');
const {DB_SCHEME, TABLE} = require('./constant_v1_sql')

class DBChampionEventGenderService {
    constructor() {
        this.db = new BetterSQLiteWrapper(DB_SCHEME);
        this.db.serialize(() => {
            this.db.run(TABLE.CRE_CHP_GRP_EVT);

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
    getEventById(id, category_key) {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT 
                    ge.* 
                FROM 
                    champion_grp_event ge,
                    champion_event en
                WHERE ge.id = ?
                AND ge.champ_event_id = en.id
                
                `;

            // if(!category_key || category_key ==  'DK'){
            //     query += ` AND en.category_key = 'DK' `
            // }   
            // if(category_key ==  'QU'){
            //     query += ` AND en.category_key = 'QU' `
            // }    
            this.db.get(query, [id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    //#region  Màn hình Quản lý dữ liệu

        // 1. API lấy thông tin Nội dung thi
        getGrpEvtSearch(champ_id, champ_grp_id, gender_id){
            return new Promise((resolve, reject) => {
                let query= `
                    select 
                        cge.id 'champ_grp_event_id',
                        cge.champ_id 'champ_id',
                        cge.champ_grp_id 'champ_grp_id',
                        ce.event_name 'champ_grp_event_nm',
                        cge.gender_commons_key 'gender_id'  
                    from 
                        champion_grp_event cge,
                        champion_event ce 
                    where ce.id = cge.champ_event_id
                `
                let param = []
                if(champ_id) query += ' AND cge.champ_id = ? ';
                if(champ_grp_id) query += ' AND cge.champ_grp_id = ? ';
                if(gender_id) query += ' AND cge.gender_commons_key = ? ';
    
                if(champ_id){
                    param = [champ_id]
                }
                if(champ_id && champ_grp_id){
                    param = [champ_id, champ_grp_id]
                }
                if(champ_id && champ_grp_id && gender_id){
                    param = [champ_id, champ_grp_id, gender_id]
                }
                if(champ_id && !champ_grp_id && gender_id){
                    param = [champ_id, gender_id]
                }
                console.log('param: ', param);
                console.log('query: ', query);
    
                this.db.all(query, param, (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            })
        }

        // 2. API lấy thông vdv theo Nội dung thi

    //#endregion

}

const instance = new DBChampionEventGenderService ();
module.exports = instance;

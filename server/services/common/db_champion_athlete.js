const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const {DB_SCHEME, TABLE} = require('./constant_sql')

class DBChampionAthleteService {
    constructor() {
        this.db = new sqlite3.Database(DB_SCHEME);
        this.db.serialize(() => {
            this.db.run(TABLE.CRE_CHP_ATH);
        })
    }

      // Insert a new record 
    insert(body) {
        return new Promise((resolve, reject) => {
            const {fullname, dob, team_name, champ_grp_event_id, num_random, cham_grp_id, gender_id, champ_id, category_key} = body;
            const query = `
                INSERT INTO champion_athlete (fullname, dob, team_name, champ_grp_event_id, num_random, cham_grp_id, gender_id, champ_id, category_key)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            this.db.run(query, [fullname, dob, team_name, champ_grp_event_id, num_random, cham_grp_id, gender_id, champ_id, category_key], function (err) {
                if (err) return reject(err);
                resolve(this.lastID); // Return the ID of the inserted row
            });
        });
    }

    // Update an existing record
    update(id, body) {
        return new Promise((resolve, reject) => {
            const {fullname, dob, team_name, champ_grp_event_id, num_random, cham_grp_id, gender_id, champ_id, category_key} = body;
            const query = `
                UPDATE champion_athlete
                SET fullname = ?, dob = ?, team_name = ?, champ_grp_event_id = ?, num_random = ?, cham_grp_id = ?, 
                gender_id = ?, 
                champ_id = ?, 
                category_key = ?, 
                updated_at = datetime('now')
                WHERE id = ?
            `;
            this.db.run(query, [fullname, dob, team_name, champ_grp_event_id, num_random, cham_grp_id, gender_id, champ_id, category_key, id], function (err) {
                if (err) return reject(err);
                resolve(this.changes); // Return the number of rows updated
            });
        });
    }
    

    // Delete a record by ID
    delete(id) {
        return new Promise((resolve, reject) => {
            const query = `
                DELETE FROM champion_athlete WHERE id = ?
            `;
            this.db.run(query, [id], function (err) {
                if (err) return reject(err);
                resolve(this.changes); // Return the number of rows deleted
            });
        });
    }
    deleteByChampGrpId(cham_grp_id, gender_id, category_key) {
        return new Promise((resolve, reject) => {
            let query = `
                DELETE FROM champion_athlete WHERE cham_grp_id = ? AND gender_id = ?
            `;
            if(category_key)  query += '  AND category_key = ? '
            this.db.run(query, [cham_grp_id, gender_id, category_key], function (err) {
                if (err) return reject(err);
                resolve(this.changes); // Return the number of rows deleted
            });
        });
    }


    // Select all records
    selectAllByChampId(champ_id, champ_grp_event_id) {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT * FROM champion_athlete where champ_id = ?
            `;
            if(champ_grp_event_id){
                query += ' AND champ_grp_event_id = ? '
            }
            this.db.all(query, [champ_id, champ_grp_event_id], (err, rows) => {
                if (err) return reject(err);
                resolve(rows); // Return all rows
            });
        });
    }

    // Select records by champ_grp_event_id
    selectByChampGrpEventId(champ_grp_event_id) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM champion_athlete WHERE champ_grp_event_id = ?
            `;
            this.db.all(query, [champ_grp_event_id], (err, rows) => {
                if (err) return reject(err);
                resolve(rows); // Return rows matching the champ_grp_event_id
            });
        });
    }

    // Update an existing record
    updateRandom(id, num_random) {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE 
                    champion_athlete
                SET 
                    num_random = ?,
                    updated_at = datetime('now')
                WHERE id = ?
            `;
            this.db.run(query, [num_random, id], function (err) {
                if (err) return reject(err);
                resolve(this.changes); // Return the number of rows updated
            });
        });
    }

    // [MAN_HINH] QUẢN LÝ CƠ SỞ DỮ LIỆU
    getAthByChampIdEvt(body) {
        return new Promise((resolve, reject) => {
            const {champ_id, champ_grp_event_id, champ_grp_id, category_key} = body
            const query = `
                SELECT
                    ath.id, -- id lay thong tin chung
                    c.tournament_name 'ten_giai',
                    cc.category_name 'hinh_thuc',
                    ath.team_name 'don_vi',
                    cg.name 'nhom_thi',
                    ce.event_name 'noi_dung_thi',
                    json_group_array(
                        json_object(
                            'ath_id', ath.id,
                            'fullname', ath.fullname,
                            'dob', ath.dob
                        )
                    ) AS members,
                    json_object(
                        'champ_id', ath.champ_id,
                        'cham_grp_id', ath.cham_grp_id,
                        'champ_event_id', cge.champ_event_id,
                        'champ_grp_event_id', ath.champ_grp_event_id,
                        'category_key', ath.category_key,
                        'gender_id', ath.gender_id
                    ) as config
                FROM 
                    champion_athlete ath, 			-- VDV 
                    champion_event ce, 				-- danh sach noi dug
                    champion_grp_event cge,  		-- danh sach noi dung theo nhom thi
                    champion_group cg,
                    champion_category cc,
                    champion c 
                WHERE ath.champ_id = ?
                AND ath.category_key = ?
                ${ champ_grp_event_id ? ' AND ath.champ_grp_event_id = ? ' : ''}
                ${ champ_grp_id ? ' AND  cge.champ_grp_id = ? ' : ''}
                AND ath.champ_id = c.id
                AND ath.category_key = cc.category_key
                AND ath.cham_grp_id = cg.id
                AND ath.champ_grp_event_id = cge.id
                AND cge.champ_event_id  = ce.id
                GROUP BY ath.champ_grp_event_id, ath.team_name, ath.gender_id;
            `;
            let param =[champ_id]
            if(champ_grp_event_id && !champ_grp_id){
                param = [champ_id,category_key, champ_grp_event_id]
            }
            if(!champ_grp_event_id && champ_grp_id){
                param = [champ_id,category_key, champ_grp_id]
            }

            if(!champ_grp_event_id && champ_grp_id && champ_grp_event_id){
                param = [champ_id,category_key, champ_grp_event_id, champ_grp_id]
            }
            this.db.all(query, param, function (err, rows) {
                if (err) return reject(err);
                resolve(rows.map(ele=>({...ele, members: JSON.parse(ele.members), config: JSON.parse(ele.config)}))); // Return list
            });
        });
    }

    getAthByChampIdEvtDistinct(body) {
        return new Promise((resolve, reject) => {
            const {champ_id, champ_grp_event_id, champ_grp_id, category_key} = body
            const query = `
                SELECT
                    DISTINCT ath.team_name team_name
                FROM 
                    champion_athlete ath, 			-- VDV 
                    champion_event ce, 				-- danh sach noi dug
                    champion_grp_event cge,  		-- danh sach noi dung theo nhom thi
                    champion_group cg,
                    champion_category cc,
                    champion c 
                WHERE ath.champ_id = ?
                AND ath.category_key = ?
                ${ champ_grp_event_id ? ' AND ath.champ_grp_event_id = ? ' : ''}
                ${ champ_grp_id ? ' AND  cge.champ_grp_id = ? ' : ''}
                AND ath.champ_id = c.id
                AND ath.category_key = cc.category_key
                AND ath.cham_grp_id = cg.id
                AND ath.champ_grp_event_id = cge.id
                AND cge.champ_event_id  = ce.id
                GROUP BY ath.champ_grp_event_id, ath.team_name, ath.gender_id;
            `;
            let param =[champ_id]
            if(champ_grp_event_id && !champ_grp_id){
                param = [champ_id,category_key, champ_grp_event_id]
            }
            if(!champ_grp_event_id && champ_grp_id){
                param = [champ_id,category_key, champ_grp_id]
            }

            if(!champ_grp_event_id && champ_grp_id && champ_grp_event_id){
                param = [champ_id,category_key, champ_grp_event_id, champ_grp_id]
            }
            this.db.all(query, param, function (err, rows) {
                if (err) return reject(err);
                resolve(rows); // Return list
            });
        });
    }


}

const instance = new DBChampionAthleteService ();
module.exports = instance;

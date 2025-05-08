const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const {DB_SCHEME, TABLE} = require('./constant_sql')

// champion
class DBChampionService {
    constructor() {
        this.db = new sqlite3.Database(DB_SCHEME);
        this.db.serialize(() => {
            this.db.run(TABLE.CRE_CHP); 
        })
    }

    getAllChampion(){
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM champion ORDER BY id DESC", [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    getChampionById(champ_id){
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM champion WHERE id = ?", [champ_id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // thêm mới
    insertChampion(data) {
        const {tournament_name, start_date, end_date, location, num_judges, num_athletes, status} = data
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT INTO champion 
                        (tournament_name, start_date, end_date, location, num_judges, num_athletes, status) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [tournament_name, start_date, end_date, location, num_judges, num_athletes, status], 
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ ...data, id: this.lastID });
                    }
                });
        });
    }

    updateChampion(id, data) {
        const {tournament_name, start_date, end_date, location, num_judges, num_athletes, status} = data
        return new Promise((resolve, reject) => {
            this.db.run(`
                    UPDATE champion SET 
                        tournament_name = ?,
                        start_date = ?,
                        end_date = ?,
                        location = ?,
                        num_judges = ?,
                        num_athletes = ?,
                        status = ?
                    WHERE id = ?
                `,
                [tournament_name, start_date, end_date, location, num_judges, num_athletes, status, id], 
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
            });
        });
    }
     // xoá  
     deleteChampion(id, data) {
        return new Promise((resolve, reject) => {
            this.db.run("DELETE FROM champion WHERE id = ?", [id], 
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id, ...data });
                    }
                });
        });
    }

}

const instance = new DBChampionService ();
module.exports = instance;

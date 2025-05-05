const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

class DBChampionAthleteService {
    constructor() {
        this.db = new sqlite3.Database('./database.sqlite');
        this.db.serialize(() => {
            this.db.run(`
                CREATE TABLE IF NOT EXISTS champion_athlete (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    fullname TEXT NOT NULL,
                    dob TEXT NOT NULL, -- YYYY-MM-DD (ISO 8601)
                    team_id INTEGER,
                    team_name TEXT,
                    gender_id TEXT NOT NULL,
                    champ_grp_event_id INTEGER NOT NULL,
                    cham_grp_id INTEGER NOT NULL,
                    champ_id INTEGER NOT NULL,
                    num_random TEXT, -- mã định danh ngẫu nhiên (có thể TEXT nếu chứa cả chữ)
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now'))
                )
             `); 
        })
    }

      // Insert a new record 
    insert(body) {
        return new Promise((resolve, reject) => {
            const {fullname, dob, team_name, champ_grp_event_id, num_random, cham_grp_id, gender_id, champ_id} = body;
            const query = `
                INSERT INTO champion_athlete (fullname, dob, team_name, champ_grp_event_id, num_random, cham_grp_id, gender_id, champ_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            this.db.run(query, [fullname, dob, team_name, champ_grp_event_id, num_random, cham_grp_id, gender_id, champ_id], function (err) {
                if (err) return reject(err);
                resolve(this.lastID); // Return the ID of the inserted row
            });
        });
    }

    // Update an existing record
    update(id, body) {
        return new Promise((resolve, reject) => {
            const {fullname, dob, team_name, champ_grp_event_id, num_random, cham_grp_id, gender_id, champ_id} = body;
            const query = `
                UPDATE champion_athlete
                SET fullname = ?, dob = ?, team_name = ?, champ_grp_event_id = ?, num_random = ?, cham_grp_id = ?, 
                gender_id = ?, 
                champ_id = ?, 
                updated_at = datetime('now')
                WHERE id = ?
            `;
            this.db.run(query, [fullname, dob, team_name, champ_grp_event_id, num_random, cham_grp_id, gender_id, champ_id, id], function (err) {
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
    deleteByChampGrpId(cham_grp_id, gender_id) {
        return new Promise((resolve, reject) => {
            const query = `
                DELETE FROM champion_athlete WHERE cham_grp_id = ? AND gender_id = ?
            `;
            this.db.run(query, [cham_grp_id, gender_id], function (err) {
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

}

const instance = new DBChampionAthleteService ();
module.exports = instance;

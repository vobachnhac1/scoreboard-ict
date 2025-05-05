const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

class DBChampionGroupService {
    constructor() {
        this.db = new sqlite3.Database('./database.sqlite');
        this.db.serialize(() => {
            // table champion_age_group: NHÓM/CẤP BẬC
            this.db.run(`
                CREATE TABLE IF NOT EXISTS champion_group (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    tournament_id INTEGER NOT NULL,
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now'))
                )
            `);
        });
    };

    async getChampionGroups() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM champion_group", [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
    async getChampionGroupsByChampion(tournament_id) {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM champion_group WHERE tournament_id = ?", [tournament_id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async getChampionGroupById(id) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM champion_group WHERE id = ?", [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async createChampionGroup(name, description, tournament_id) {
        return new Promise((resolve, reject) => {
            const stmt = `
                INSERT INTO champion_group (name, description, tournament_id) 
                VALUES (?, ?, ?)
            `;
            this.db.run(stmt, [name, description, tournament_id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    }

    async updateChampionGroup(id, name, description, tournament_id) {
        return new Promise((resolve, reject) => {
            const stmt = `
                UPDATE champion_group 
                SET name = ?, description = ?, tournament_id = ?, updated_at = datetime('now') 
                WHERE id = ?
            `;
            this.db.run(stmt, [name, description, tournament_id, id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    async deleteChampionGroup(id) {
        return new Promise((resolve, reject) => {
            this.db.run("DELETE FROM champion_group WHERE id = ?", [id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    

}

const instance = new DBChampionGroupService ();
module.exports = instance;

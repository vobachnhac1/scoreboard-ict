const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

class DBChampionEventService {
    constructor() {
        this.db = new sqlite3.Database('./database.sqlite');
        this.db.serialize(() => {
            this.db.run(`
                CREATE TABLE IF NOT EXISTS champion_event (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_name TEXT ,
                    num_member INTEGER DEFAULT 0,
                    category_key TEXT NOT NULL,
                    qu_type TEXT NOT NULL,
                    description TEXT,
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now'))
                )
             `); 
        })
    }

    // Thêm mới
    createEvent(body){
        const { event_name, num_member, category_key, description, qu_type } = body
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO 
                    champion_event (event_name, num_member, category_key, description, qu_type)
                VALUES (?, ?, ?, ?, ?)
            `;
            this.db.run(query, [event_name, num_member, category_key, description, qu_type], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    };

    // Cập nhật
    updateEvent(id, body){
        const {event_name, num_member, category_key, description, qu_type } = body;
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE champion_event
                SET event_name = ?, num_member = ?, category_key = ?, description = ?, qu_type = ?, updated_at = datetime('now')
                WHERE id = ?
            `;
            this.db.run(query, [event_name, num_member, category_key, description, qu_type, id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    // Xoá
    deleteEvent(id) {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM champion_event WHERE id = ?`;
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
    getEvent() {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM champion_event ORDER BY ID DESC`;
            this.db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    getEventById(id) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM champion_event WHERE ID = ? ORDER BY ID DESC`;
            this.db.get(query, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Lấy nội dung hình thức theo 
    getEventByCategory(category_key) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM champion_event WHERE category_key = ? ORDER BY ID DESC`;
            this.db.all(query, [category_key], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

}

const instance = new DBChampionEventService ();
module.exports = instance;

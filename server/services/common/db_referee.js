const sqlite3 = require('sqlite3').verbose();

class DBRefereeService {
    constructor() {
        this.db = new sqlite3.Database('./database.sqlite');
        this.db.serialize(() => {
            this.db.run(`
                CREATE TABLE IF NOT EXISTS referee (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    full_name TEXT NOT NULL,
                    team_name TEXT,
                    tournament_id INTEGER,
                    rank TEXT,
                    position TEXT,
                    code TEXT UNIQUE,
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now')),
                    FOREIGN KEY (team_name) REFERENCES team(id) ON DELETE SET NULL,
                    FOREIGN KEY (tournament_id) REFERENCES champion(id) ON DELETE CASCADE
                );
            `);
        });
    }

    // Lấy tất cả trọng tài theo giải đấu
    /** 
     *  SELECT r.*, t.display_name as team_name 
                FROM referee r
                LEFT JOIN team t ON r.team_name = t.id
                WHERE r.tournament_id = ?
                ORDER BY r.id DESC
    */
    getAllReferees(tournament_id) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT r.*
                FROM referee r
                WHERE r.tournament_id = ?
                ORDER BY r.id DESC
            `, [tournament_id], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Thêm mới
    insertReferee(data) {
        const { full_name, team_name, tournament_id, rank, position } = data;
        return new Promise((resolve, reject) => {
            this.db.run(`
                INSERT INTO referee (full_name, team_name, tournament_id, rank, position) 
                VALUES (?, ?, ?, ?, ?)
            `, [full_name, team_name, tournament_id, rank, position], function(err) {
                if (err) reject(err);
                else {
                    const id = this.lastID;
                    const code = `R-${tournament_id}-${team_name || 0}-${id}`;
                    // Update code ngay sau khi insert
                    const db = new sqlite3.Database('./database.sqlite');
                    db.run(`UPDATE referee SET code = ? WHERE id = ?`, [code, id]);
                    db.close();
                    resolve({ id, code, ...data });
                }
            });
        });
    }

    // Update
    updateReferee(id, data) {
        const { full_name, team_name, tournament_id, rank, position } = data;
        return new Promise((resolve, reject) => {
            this.db.run(`
                UPDATE referee SET 
                    full_name = ?,
                    team_name = ?,
                    tournament_id = ?,
                    rank = ?,
                    position = ?,
                    updated_at = datetime('now')
                WHERE id = ?
            `, [full_name, team_name, tournament_id, rank, position, id], function(err) {
                if (err) reject(err);
                else resolve({ id, ...data });
            });
        });
    }

    // Xoá
    deleteReferee(id) {
        return new Promise((resolve, reject) => {
            this.db.run(`DELETE FROM referee WHERE id = ?`, [id], function(err) {
                if (err) reject(err);
                else resolve({ id });
            });
        });
    }
    // Search trọng tài theo champion và tên
    searchReferees(tournament_id, keyword) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT r.*
                FROM referee r
                WHERE r.tournament_id = ?
                AND r.full_name LIKE ?
                ORDER BY r.id DESC
            `, [tournament_id, `%${keyword}%`], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // thêm dạng list
    insertListReferee (list){
        return new Promise((resolve, reject) => {
            try {
                const stmt = this.db.prepare(`
                    INSERT INTO referee (full_name, team_name, tournament_id, rank, position )
                    VALUES (?, ?, ?, ?, ?)
                  `);
                list.forEach((item) => { stmt.run(item); });      
                stmt.finalize();
                resolve(true)
            } catch (error) {
                console.log('error: ', error);
                reject(false)
            }
        })
    }   
     // Xoá
     deleteListReferees(tournament_id) {
        return new Promise((resolve, reject) => {
            this.db.run(`DELETE FROM referee WHERE tournament_id = ?`, [tournament_id], function(err) {
                if (err) reject(err);
                else resolve({ id });
            });
        });
    }

    // 
}

const instance = new DBRefereeService();
module.exports = instance;

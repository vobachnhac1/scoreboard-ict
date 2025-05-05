const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Quản lý đơn vị tham gia
class DBTeamService {
    constructor() {
        this.db = new sqlite3.Database('./database.sqlite');
        this.db.serialize(() => {
            // // table champion_competition_type: HÌNH THỨC THI: ĐỐI KHÁNG/BIỂU DIỄN
            this.db.run(`
                CREATE TABLE IF NOT EXISTS team (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    tournament_id INTEGER NOT NULL,    -- Liên kết tới giải đấu
                    full_name TEXT NOT NULL,            -- Tên đầy đủ đơn vị
                    area TEXT,                          -- Khu vực (ví dụ: Miền Bắc, Trung, Nam)
                    display_name TEXT NOT NULL,         -- Tên hiển thị ngắn
                    leader_name TEXT,                   -- Người dẫn đoàn
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now'))
                )
             `); 
        })
    }

    getAllTeamsByTournament(tournamentId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                "SELECT * FROM team WHERE tournament_id = ? ORDER BY id DESC",
                [tournamentId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    insertTeam(data) {
        const { tournament_id, full_name, area, display_name, leader_name } = data;
        return new Promise((resolve, reject) => {
            this.db.run(`
                INSERT INTO team 
                    (tournament_id, full_name, area, display_name, leader_name)
                VALUES (?, ?, ?, ?, ?)
            `,
            [tournament_id, full_name, area, display_name, leader_name],
            function (err) {
                if (err) reject(err);
                else resolve(data);
            });
        });
    }

    updateTeam(id, data) {
        const { tournament_id, full_name, area, display_name, leader_name } = data;
        return new Promise((resolve, reject) => {
            this.db.run(`
                UPDATE team SET 
                    tournament_id = ?,
                    full_name = ?,
                    area = ?,
                    display_name = ?,
                    leader_name = ?,
                    updated_at = datetime('now')
                WHERE id = ?
            `,
            [tournament_id, full_name, area, display_name, leader_name, id],
            function (err) {
                if (err) reject(err);
                else resolve(data);
            });
        });
    }

    deleteTeam(id) {
        return new Promise((resolve, reject) => {
            this.db.run(
                "DELETE FROM team WHERE id = ?",
                [id],
                function (err) {
                    if (err) reject(err);
                    else resolve({ id });
                }
            );
        });
    }

    // Mở rộng
    searchTeamsByDisplayName(keyword) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT * FROM team
                WHERE display_name LIKE ?
                ORDER BY id DESC
            `, [`%${keyword}%`], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
    getTeamsWithTournamentName() {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT 
                    u.*, 
                    t.tournament_name
                FROM team u
                JOIN champion t ON u.tournament_id = t.id
                ORDER BY u.id DESC
            `, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    insertListTeams (list){
        return new Promise((resolve, reject) => {
            try {
                const stmt = this.db.prepare(`
                    INSERT INTO team (full_name, area, display_name, leader_name, tournament_id )
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
    
    
}

const instance = new DBTeamService ();
module.exports = instance;

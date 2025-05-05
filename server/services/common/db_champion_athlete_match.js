const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');



/**
 * Lưu 1 record thi đấu
 * - Tạo 1 history với champion_athlete_match_id
 * - Thông số trận đấu | Thông tin trận đấu | Điểm số trận đấu (Hiệp) | Lịch sử thao tác Gíam định 
 * 
 */
class DBAthMatchService {
    constructor() {
        this.db = new sqlite3.Database('./database.sqlite');
        this.db.serialize(() => {
            this.db.run(`
                CREATE TABLE IF NOT EXISTS champion_athlete_match (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    champ_grp_event_id INTEGER NOT NULL,
                    round INTEGER NOT NULL,
                    match_id TEXT NOT NULL,
                    match_no INTEGER NOT NULL,
                    ath_red_id TEXT NOT NULL,
                    ath_blue_id TEXT NOT NULL,
                    ath_win_id TEXT,
                    match_status TEXT DEFAULT 'WAI',
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now'))
                )
             `); 
            this.db.run(`
                CREATE TABLE IF NOT EXISTS DB_MATCH_HIS (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    match_id INTEGER NOT NULL,             -- Mã trận đấu (foreign key nếu cần)
                    
                    red_score INTEGER DEFAULT 0,
                    blue_score INTEGER DEFAULT 0,

                    red_remind INTEGER DEFAULT 0,
                    blue_remind INTEGER DEFAULT 0,

                    red_warn INTEGER DEFAULT 0,
                    blue_warn INTEGER DEFAULT 0,

                    red_mins INTEGER DEFAULT 0,            -- Điểm trừ (minuses)
                    blue_mins INTEGER DEFAULT 0,

                    red_incr INTEGER DEFAULT 0,            -- Điểm cộng (increments)
                    blue_incr INTEGER DEFAULT 0,

                    round INTEGER DEFAULT 1,               -- Hiệp số
                    round_type TEXT DEFAULT 'NORMAL',      -- Loại hiệp: NORMAL / EXTRA / etc.
                    
                    confirm_attack INTEGER DEFAULT 0,      -- Tổng số lần công nhận đòn tấn công

                    status TEXT DEFAULT 'WAI',          -- ACTIVE / ENDED / REVIEWED etc.

                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now'))

                )
             `); 
        })
    }

    // Insert a new match record
    insert(body) {
        return new Promise((resolve, reject) => {
            const { champ_grp_event_id, round, match_id, match_no, ath_red_id, ath_blue_id, ath_win_id } = body;
            const query = `
                INSERT INTO champion_athlete_match (champ_grp_event_id, round, match_id, match_no, ath_red_id, ath_blue_id, ath_win_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            this.db.run(query, [champ_grp_event_id, round, match_id, match_no, ath_red_id, ath_blue_id, ath_win_id], function (err) {
                if (err) return reject(err);
                resolve(this.lastID); // Return the ID of the inserted row
            });
        });
    }

    // Update an existing match record
    update(id, body) {
        return new Promise((resolve, reject) => {
            const { champ_grp_event_id, round, match_id, match_no, ath_red_id, ath_blue_id, ath_win_id } = body;
            const query = `
                UPDATE champion_athlete_match
                SET champ_grp_event_id = ?, round = ?, match_id = ?, match_no = ?, ath_red_id = ?, ath_blue_id = ?, ath_win_id = ?, updated_at = datetime('now')
                WHERE id = ?
            `;
            this.db.run(query, [champ_grp_event_id, round, match_id, match_no, ath_red_id, ath_blue_id, ath_win_id, id], function (err) {
                if (err) return reject(err);
                resolve(this.changes); // Return the number of rows updated
            });
        });
    }

    // Find matches by champ_grp_event_id
    findByChampGrpEventId(champ_grp_event_id) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM champion_athlete_match WHERE champ_grp_event_id = ?
            `;
            this.db.all(query, [champ_grp_event_id], (err, rows) => {
                if (err) return reject(err);
                resolve(rows); // Return all rows matching the champ_grp_event_id
            });
        });
    }

     // Find matches by match_id
    findByMatchId(match_id) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM champion_athlete_match WHERE match_id = ?
            `;
            this.db.get(query, [match_id], (err, rows) => {
                if (err) return reject(err);
                resolve(rows); // Return all rows matching the match_id
            });
        });
    }

    // cập nhật Người chiến thắng | 2. Cập nhật id người chiến thắng đến trận kế tiếp
    updateAthWinner(id, body){
        return new Promise((resolve, reject) => {
            const { ath_win_id } = body;
            const query = `
                    UPDATE champion_athlete_match
                    SET ath_win_id = ?
                    WHERE id = ?
                `;
            this.db.run(query,[ath_win_id, id], function (err) {
                if (err) return reject(err);
                resolve(this.changes); // Return the number of rows updated
            });
        });
    } 

    // thêm list
    insertList(list) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO champion_athlete_match (champ_grp_event_id, round, match_id, match_no, ath_red_id, ath_blue_id)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const stmt = this.db.prepare(query);
    
            try {
                list.forEach(match => {
                    const { champ_grp_event_id, round, match_id, match_no, ath_red_id, ath_blue_id } = match;
                    stmt.run([champ_grp_event_id, round, match_id, match_no, ath_red_id, ath_blue_id ]);
                });
                stmt.finalize();
                resolve({ success: true, message: 'Inserted list successfully' });
            } catch (err) {
                console.log('err: ', err);
                reject(err);
            }
        });
    }
    // xoá theo nội dung thi
    deleteByChampGrpEventId(champ_grp_event_id) {
        return new Promise((resolve, reject) => {
            try {
                const query = `
                    DELETE FROM champion_athlete_match WHERE champ_grp_event_id = ?
                `;
                this.db.run(query, [champ_grp_event_id], function (err) {
                    if (err) return reject(err);
                    resolve(this.changes); // Return the number of rows deleted
                });
            } catch (error) {
                reject(error);

            }
           
        });
    }

    // tim trạn kế tiếp findNextMatchId
    findNextMatchId(match_id) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM champion_athlete_match WHERE (ath_red_id = ? OR ath_blue_id = ?)
            `;
            this.db.get(query, [match_id, match_id], (err, rows) => {
                if (err) return reject(err);
                resolve(rows); // Return all rows matching the match_id
            });
        });
    }

    // Cập nhật ath_id cho trận kế tiếp nếu có
    updateNextMatchId(id, body){
        return new Promise((resolve, reject) => {
            const { ath_red_id, ath_blue_id } = body;
            const query = `
                    UPDATE 
                        champion_athlete_match
                    SET 
                        ath_red_id = ?,
                        ath_blue_id = ?
                    WHERE id = ?
                `;
            this.db.run(query,[ath_red_id, ath_blue_id, id], function (err) {
                if (err) return reject(err);
                resolve(this.changes); // Return the number of rows updated
            });
        });
    }
}

const instance = new DBAthMatchService ();
module.exports = instance;

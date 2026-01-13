const { BetterSQLiteWrapper } = require('../common/db_better_sqlite3');
const fs = require('fs');
const {DB_SCHEME, TABLE} = require('../common/constant_sql')



/**
 * Lưu 1 record thi đấu
 * - Tạo 1 history với champion_athlete_match_id
 * - Thông số trận đấu | Thông tin trận đấu | Điểm số trận đấu (Hiệp) | Lịch sử thao tác Gíam định 
 * 
 */
class DBAthMatchService {
    constructor() {
        this.db = new BetterSQLiteWrapper(DB_SCHEME);
        this.db.serialize(() => {
            this.db.run(TABLE.CRE_CHP_ATH_MAT); 
            this.db.run(TABLE.CRE_CHP_ATH_MAT_HIS); 
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

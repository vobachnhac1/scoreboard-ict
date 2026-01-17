const { BetterSQLiteWrapper } = require('./db_better_sqlite3');
const { DB_SCHEME } = require('./constant_sql');

/**
 * Service quản lý team matches (SOL/TUV/DAL/DOL/ORTHER)
 * - Lưu thông tin team
 * - Lưu thông tin VĐV trong team
 * - Lưu lịch sử kết quả thi đấu
 */
class DBCompetitionMatchTeamService {
    constructor() {
        this.db = new BetterSQLiteWrapper(DB_SCHEME);
        this.db.serialize(() => {
            // Bảng competition_match_team - Thông tin team
            this.db.run(`
                CREATE TABLE IF NOT EXISTS competition_match_team (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    competition_dk_id INTEGER NOT NULL,
                    match_no TEXT NOT NULL,
                    row_index INTEGER NOT NULL,
                    match_name TEXT,
                    team_name TEXT,
                    match_type TEXT NOT NULL,
                    match_status TEXT DEFAULT 'WAI',
                    config_system TEXT,
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now')),
                    FOREIGN KEY (competition_dk_id) REFERENCES competition_dk(id) ON DELETE CASCADE
                )
            `);

            // Bảng competition_match_team_athlete - Thông tin VĐV trong team
            this.db.run(`
                CREATE TABLE IF NOT EXISTS competition_match_team_athlete (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    team_id INTEGER NOT NULL,
                    athlete_name TEXT NOT NULL,
                    athlete_unit TEXT,
                    athlete_order INTEGER DEFAULT 1,
                    created_at TEXT DEFAULT (datetime('now')),
                    FOREIGN KEY (team_id) REFERENCES competition_match_team(id) ON DELETE CASCADE
                )
            `);

            // Bảng competition_match_team_history - Lịch sử kết quả thi đấu
            this.db.run(`
                CREATE TABLE IF NOT EXISTS competition_match_team_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    team_id INTEGER NOT NULL,
                    score INTEGER DEFAULT 0,
                    rank INTEGER,
                    time_result TEXT,
                    notes TEXT,
                    status TEXT DEFAULT 'WAI',
                    action_type TEXT,
                    action_by TEXT,
                    created_at TEXT DEFAULT (datetime('now')),
                    FOREIGN KEY (team_id) REFERENCES competition_match_team(id) ON DELETE CASCADE
                )
            `);
        });
    }

    // Tạo team với athletes
    createTeam(body) {
        return new Promise((resolve, reject) => {
            const { competition_dk_id, match_no, row_index, match_name, team_name, match_type, config_system, athletes } = body;
            const db = this.db; // Lưu reference

            const query = `
                INSERT INTO competition_match_team (competition_dk_id, match_no, row_index, match_name, team_name, match_type, config_system)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            db.run(query, [
                competition_dk_id,
                match_no,
                row_index,
                match_name,
                team_name,
                match_type,
                JSON.stringify(config_system || {})
            ], function (err) {
                if (err) {
                    console.error('Error creating team:', err);
                    return reject(err);
                }

                const teamId = this.lastID;

                // Thêm athletes nếu có
                if (athletes && athletes.length > 0) {
                    const athleteQuery = `
                        INSERT INTO competition_match_team_athlete (team_id, athlete_name, athlete_unit, athlete_order)
                        VALUES (?, ?, ?, ?)
                    `;

                    try {
                        const stmt = db.prepare(athleteQuery);

                        athletes.forEach((athlete, index) => {
                            stmt.run(
                                teamId,
                                athlete.name || '',
                                athlete.unit || '',
                                index + 1
                            );
                        });

                        stmt.finalize();
                        resolve(teamId);
                    } catch (err) {
                        console.error('Error inserting athletes:', err);
                        return reject(err);
                    }
                } else {
                    resolve(teamId);
                }
            });
        });
    }

    // Bulk create teams
    bulkCreateTeams(teams) {
        return new Promise((resolve, reject) => {
            if (!teams || teams.length === 0) {
                return resolve({ count: 0 });
            }

            let successCount = 0;
            const errors = [];

            // Xử lý tuần tự từng team để tránh database locked
            const processTeam = async (index) => {
                if (index >= teams.length) {
                    if (errors.length > 0) {
                        console.error('Errors creating teams:', errors);
                    }
                    return resolve({ count: successCount, errors });
                }

                try {
                    await this.createTeam(teams[index]);
                    successCount++;
                } catch (err) {
                    console.error(`Error creating team ${index}:`, err);
                    errors.push({ index, error: err.message });
                }

                // Đợi một chút trước khi xử lý team tiếp theo
                setTimeout(() => processTeam(index + 1), 10);
            };

            processTeam(0);
        });
    }

    // Lấy team theo id (kèm athletes)
    getTeamById(id) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM competition_match_team WHERE id = ?`;
            this.db.get(query, [id], (err, team) => {
                if (err) return reject(err);
                if (!team) return resolve(null);

                // Parse config_system
                if (team.config_system) {
                    team.config_system = JSON.parse(team.config_system);
                }
                team.scores = team.scores ? JSON.parse(team.scores) : {};

                // Lấy athletes
                const athleteQuery = `SELECT * FROM competition_match_team_athlete WHERE team_id = ? ORDER BY athlete_order`;
                this.db.all(athleteQuery, [id], (err, athletes) => {
                    if (err) return reject(err);
                    team.athletes = athletes || [];
                    resolve(team);
                });
            });
        });
    }

    // Lấy tất cả teams theo competition_dk_id (kèm athletes)
    getTeamsByCompetitionDKId(competition_dk_id) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM competition_match_team WHERE competition_dk_id = ? ORDER BY row_index`;
            this.db.all(query, [competition_dk_id], (err, teams) => {
                if (err) return reject(err);

                if (!teams || teams.length === 0) {
                    return resolve([]);
                }

                // Parse config_system và lấy athletes cho từng team
                let processed = 0;
                teams.forEach((team, index) => {
                    if (team.config_system) {
                        team.config_system = JSON.parse(team.config_system);
                    }
                    team.scores = team.scores ? JSON.parse(team.scores) : {};

                    const athleteQuery = `SELECT * FROM competition_match_team_athlete WHERE team_id = ? ORDER BY athlete_order`;
                    this.db.all(athleteQuery, [team.id], (err, athletes) => {
                        if (err) return reject(err);
                        teams[index].athletes = athletes || [];

                        processed++;
                        if (processed === teams.length) {
                            resolve(teams);
                        }
                    });
                });
            });
        });
    }

    // Cập nhật status
    updateTeamStatus(id, status) {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE competition_match_team
                SET match_status = ?, updated_at = datetime('now')
                WHERE id = ?
            `;
            this.db.run(query, [status, id], function (err) {
                if (err) return reject(err);
                resolve({ changes: this.changes });
            });
        });
    }

    // Cập nhật config_system
    updateConfigSystem(id, config_system) {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE competition_match_team
                SET config_system = ?, updated_at = datetime('now')
                WHERE id = ?
            `;
            this.db.run(query, [JSON.stringify(config_system), id], function (err) {
                if (err) return reject(err);
                resolve({ changes: this.changes });
            });
        });
    }

    // Xóa team
    deleteTeam(id) {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM competition_match_team WHERE id = ?`;
            this.db.run(query, [id], function (err) {
                if (err) return reject(err);
                resolve({ changes: this.changes });
            });
        });
    }

    // Xóa tất cả teams theo competition_dk_id
    deleteTeamsByCompetitionDKId(competition_dk_id) {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM competition_match_team WHERE competition_dk_id = ?`;
            this.db.run(query, [competition_dk_id], function (err) {
                if (err) return reject(err);
                resolve({ changes: this.changes });
            });
        });
    }

    // Thêm history record
    addHistory(body) {
        return new Promise((resolve, reject) => {
            const { team_id, score, rank, time_result, notes, status, action_type, action_by } = body;

            const query = `
                INSERT INTO competition_match_team_history (
                    team_id, score, rank, time_result, notes, status, action_type, action_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            this.db.run(query, [
                team_id, score || 0, rank, time_result, notes, status || 'WAI', action_type, action_by
            ], function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });
    }

    // Lấy history theo team_id
    getHistoryByTeamId(team_id) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM competition_match_team_history WHERE team_id = ? ORDER BY created_at DESC`;
            this.db.all(query, [team_id], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }
    // thực hiện lưu kết quả thi đấu 
    saveResultTeam(match_id, scores, config_system) {
        // scores là một object
        return new Promise((resolve, reject) => {
            const query = `UPDATE competition_match_team SET scores = ?, match_status = 'FIN', config_system = ? , updated_at = datetime('now') WHERE id = ?`;
            this.db.run(query, [JSON.stringify(scores),  JSON.stringify(config_system), match_id], function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    }
}

const instance = new DBCompetitionMatchTeamService();
module.exports = instance;

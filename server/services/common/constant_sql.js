const path = require('path');
const fs = require('fs');
const os = require('os');

// Cache database path để tránh tính toán lại nhiều lần
let cachedDbPath = null;

// Sử dụng userData path cho production, fallback về ./database.sqlite cho dev
const getDbPath = () => {
    // Return cached path nếu đã tính toán
    if (cachedDbPath) {
        return cachedDbPath;
    }

    // Chỉ dùng USER_DATA_PATH trong production
    const isDevelopment = process.env.NODE_ENV === 'development';
    const userDataPath = isDevelopment ? null : process.env.USER_DATA_PATH;

    if (userDataPath) {
        // Production: Lưu database trong userData folder
        // Tạo thư mục nếu chưa tồn tại
        try {
            if (!fs.existsSync(userDataPath)) {
                fs.mkdirSync(userDataPath, { recursive: true });
                console.log('✅ Created userData directory:', userDataPath);
            }

            const dbPath = path.join(userDataPath, 'database.sqlite');
            console.log('📍 Database path (production):', dbPath);

            // Log ra file để debug
            try {
                const logPath = path.join(userDataPath, 'database.log');
                fs.appendFileSync(logPath, `\n[${new Date().toISOString()}] Database path: ${dbPath}\n`);
            } catch (logError) {
                // Ignore log errors
            }

            // Cache path
            cachedDbPath = dbPath;
            return dbPath;
        } catch (error) {
            console.error('❌ Error creating database path:', error);
            // Fallback to temp directory
            const tempDir = path.join(os.tmpdir(), 'vhd-scoreboard');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const tempPath = path.join(tempDir, 'database.sqlite');
            console.log('⚠️  Using temp path:', tempPath);
            cachedDbPath = tempPath;
            return tempPath;
        }
    } else {
        // Development: Lưu trong thư mục hiện tại
        const dbPath = path.resolve('./database.sqlite');
        console.log('📍 Database path (development):', dbPath);
        cachedDbPath = dbPath;
        return dbPath;
    }
};

// Export getDbPath function để có thể gọi khi cần
// KHÔNG tính toán DB_SCHEME ngay khi require

// Tính toán DB_SCHEME ngay khi require (vì USER_DATA_PATH đã được set trong electron.js)
const DB_SCHEME_UAT = getDbPath();

//-- 1. Bảng commons (dùng chung: giới tính, loại hiệp, v.v.)
const COMMON = `
    CREATE TABLE IF NOT EXISTS commons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_type TEXT(100),
        "key" TEXT(100) NOT NULL,
        value TEXT(255),
        description TEXT(255),
        num_member INTEGER DEFAULT 1
    );
`;

//-- 2. Bảng champion (giải đấu)
const CHAMPION = `
CREATE TABLE IF NOT EXISTS champion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_name TEXT NOT NULL,
    start_date TEXT NOT NULL, -- YYYY-MM-DD
    end_date TEXT NOT NULL,
    location TEXT,
    num_judges INTEGER DEFAULT 0,
    num_athletes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'NEW',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

`;

//-- 3. Bảng champion_category (hạng cân, độ tuổi...)
const CHAMPION_CATEGORY = `
CREATE TABLE IF NOT EXISTS champion_category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_key TEXT NOT NULL UNIQUE,
    category_name TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

`;

//-- 4. Bảng champion_group (bảng đấu)
const CHAMPION_GRP = `
    CREATE TABLE IF NOT EXISTS champion_group (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        tournament_id INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (tournament_id) REFERENCES champion(id) ON DELETE CASCADE
    );

`;

//-- 5. Bảng champion_event (sự kiện trong giải đấu)
const CHAMPION_EVE = `
    CREATE TABLE IF NOT EXISTS champion_event (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_name TEXT,
        num_member INTEGER DEFAULT 0,
        category_key TEXT NOT NULL,
        qu_type TEXT NOT NULL,
        description TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (category_key) REFERENCES champion_category(category_key)
    );
`;

//-- 6. Bảng champion_grp_event (gắn sự kiện với bảng đấu và giới tính)
const CHAMPION_GRP_EVE = `
    CREATE TABLE IF NOT EXISTS champion_grp_event (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        champ_event_id TEXT NOT NULL,
        gender_commons_key TEXT NOT NULL,
        champ_grp_id TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (champ_event_id) REFERENCES champion_event(id),
        FOREIGN KEY (champ_grp_id) REFERENCES champion_group(id),
        FOREIGN KEY (gender_commons_key) REFERENCES commons("key")
    );
`;

//-- 7. Bảng team (đơn vị tham gia)
const CHAMPION_TEAM = `
    CREATE TABLE IF NOT EXISTS team (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tournament_id INTEGER NOT NULL,
        full_name TEXT NOT NULL,
        area TEXT,
        display_name TEXT NOT NULL,
        leader_name TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (tournament_id) REFERENCES champion(id) ON DELETE CASCADE
    );
`;

//-- 8. Bảng referee (trọng tài)
const CHAMPION_REF = `
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
        FOREIGN KEY (tournament_id) REFERENCES champion(id) ON DELETE CASCADE
    );
`;

//-- 9. Bảng champion_athlete (vận động viên)
const CHAMPION_ATH = `
    CREATE TABLE IF NOT EXISTS champion_athlete (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullname TEXT NOT NULL,
        dob TEXT NOT NULL, -- YYYY-MM-DD
        team_id INTEGER,
        gender_id TEXT NOT NULL,
        category_key TEXT NOT NULL,
        champ_grp_event_id INTEGER NOT NULL,
        cham_grp_id INTEGER NOT NULL,
        champ_id INTEGER NOT NULL,
        num_random TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE SET NULL,
        FOREIGN KEY (gender_id) REFERENCES commons("key"),
        FOREIGN KEY (category_key) REFERENCES champion_category(category_key),
        FOREIGN KEY (champ_grp_event_id) REFERENCES champion_grp_event(id),
        FOREIGN KEY (cham_grp_id) REFERENCES champion_group(id),
        FOREIGN KEY (champ_id) REFERENCES champion(id)
    );
`;

//-- 10. Bảng champion_athlete_match (trận đấu)
const CHAMPION_ATH_MATCH = `
    CREATE TABLE IF NOT EXISTS champion_athlete_match (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        champ_grp_event_id INTEGER NOT NULL,
        round INTEGER NOT NULL,
        match_id TEXT NOT NULL,
        match_no INTEGER NOT NULL,
        ath_red_id INTEGER NOT NULL,
        ath_blue_id INTEGER NOT NULL,
        ath_win_id INTEGER,
        match_status TEXT DEFAULT 'WAI',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (champ_grp_event_id) REFERENCES champion_grp_event(id),
        FOREIGN KEY (ath_red_id) REFERENCES champion_athlete(id),
        FOREIGN KEY (ath_blue_id) REFERENCES champion_athlete(id),
        FOREIGN KEY (ath_win_id) REFERENCES champion_athlete(id)
    );
`;

//-- 11. Bảng DB_MATCH_HIS (lịch sử điểm)
const CHAMPION_ATH_MATCH_HIS = `
    CREATE TABLE IF NOT EXISTS DB_MATCH_HIS (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id INTEGER NOT NULL,
        red_score INTEGER DEFAULT 0,
        blue_score INTEGER DEFAULT 0,
        red_remind INTEGER DEFAULT 0,
        blue_remind INTEGER DEFAULT 0,
        red_warn INTEGER DEFAULT 0,
        blue_warn INTEGER DEFAULT 0,
        red_mins INTEGER DEFAULT 0,
        blue_mins INTEGER DEFAULT 0,
        red_incr INTEGER DEFAULT 0,
        blue_incr INTEGER DEFAULT 0,
        round INTEGER DEFAULT 1,
        round_type TEXT DEFAULT 'NORMAL',
        confirm_attack INTEGER DEFAULT 0,
        status TEXT DEFAULT 'WAI',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (match_id) REFERENCES champion_athlete_match(id) ON DELETE CASCADE
    );
`;

const DB_NO_RELATION = {
    CRE_COM: COMMON,
    CRE_CHP: CHAMPION,
    CRE_CHP_CG: CHAMPION_CATEGORY,
    CRE_CHP_GRP: CHAMPION_GRP,
    CRE_CHP_EVT: CHAMPION_EVE,
    CRE_CHP_GRP_EVT: CHAMPION_GRP_EVE,
    CRE_CHP_TEM: CHAMPION_TEAM,
    CRE_CHP_REF: CHAMPION_REF,
    CRE_CHP_ATH: CHAMPION_ATH,
    CRE_CHP_ATH_MAT: CHAMPION_ATH_MATCH,
    CRE_CHP_ATH_MAT_HIS: CHAMPION_ATH_MATCH_HIS,
}


/**
 * DB_SCHEME: Thiết kế không ràng buộc
 * DB_SCHEME_UAT: có ràng buộc
 *
 *
 */

module.exports = {
    TABLE: DB_NO_RELATION,
    DB_SCHEME: DB_SCHEME_UAT
};
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
                console.log(' Created userData directory:', userDataPath);
            }

            const dbPath = path.join(userDataPath, 'database.sqlite');
            console.log('Database path (production):', dbPath);

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
            console.error('Error creating database path:', error);
            // Fallback to temp directory
            const tempDir = path.join(os.tmpdir(), 'vhd-scoreboard');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const tempPath = path.join(tempDir, 'database.sqlite');
            console.log('Using temp path:', tempPath);
            cachedDbPath = tempPath;
            return tempPath;
        }
    } else {
        // Development: Lưu trong thư mục hiện tại
        const dbPath = path.resolve('./database.sqlite');
        console.log('Database path (development):', dbPath);
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

//-- 2. Bảng referees (quản lý trọng tài)
const REFEREE = `
    CREATE TABLE IF NOT EXISTS referees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT(255) NOT NULL,
        unit TEXT(255),
        country TEXT(255),
        r1 INTEGER DEFAULT 0,
        r2 INTEGER DEFAULT 0,
        r3 INTEGER DEFAULT 0,
        r4 INTEGER DEFAULT 0,
        r5 INTEGER DEFAULT 0,
        r6 INTEGER DEFAULT 0,
        r7 INTEGER DEFAULT 0,
        is_ref_machine INTEGER DEFAULT 0,
        is_ref_court INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`;

const DB_NO_RELATION = {
    CRE_COM: COMMON,
    CRE_REF: REFEREE,
}

/**
 * DB_SCHEME: Thiết kế không ràng buộc
 * DB_SCHEME_UAT: có ràng buộc
 */

module.exports = {
    TABLE: DB_NO_RELATION,
    DB_SCHEME: DB_SCHEME_UAT
};
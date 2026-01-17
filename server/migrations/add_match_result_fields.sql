-- -- Migration: Add match result fields
-- -- Date: 2025-12-25
-- -- Description: Thêm các trường để lưu kết quả trận đấu

-- -- 1. Thêm các cột vào bảng matches
-- ALTER TABLE matches 
-- ADD COLUMN IF NOT EXISTS status VARCHAR(10) DEFAULT 'PENDING' COMMENT 'PENDING, LIVE, FIN, CANCELLED',
-- ADD COLUMN IF NOT EXISTS red_score INT DEFAULT 0 COMMENT 'Điểm số đỏ',
-- ADD COLUMN IF NOT EXISTS blue_score INT DEFAULT 0 COMMENT 'Điểm số xanh',
-- ADD COLUMN IF NOT EXISTS red_remind INT DEFAULT 0 COMMENT 'Số lần nhắc nhở đỏ',
-- ADD COLUMN IF NOT EXISTS blue_remind INT DEFAULT 0 COMMENT 'Số lần nhắc nhở xanh',
-- ADD COLUMN IF NOT EXISTS red_warn INT DEFAULT 0 COMMENT 'Số lần cảnh cáo đỏ',
-- ADD COLUMN IF NOT EXISTS blue_warn INT DEFAULT 0 COMMENT 'Số lần cảnh cáo xanh',
-- ADD COLUMN IF NOT EXISTS red_kick INT DEFAULT 0 COMMENT 'Số đòn chân đỏ',
-- ADD COLUMN IF NOT EXISTS blue_kick INT DEFAULT 0 COMMENT 'Số đòn chân xanh',
-- ADD COLUMN IF NOT EXISTS winner VARCHAR(10) COMMENT 'red, blue, null (hòa)',
-- ADD COLUMN IF NOT EXISTS total_rounds INT COMMENT 'Tổng số hiệp đã thi đấu',
-- ADD COLUMN IF NOT EXISTS final_time VARCHAR(10) COMMENT 'Thời gian kết thúc (MM:SS.S)',
-- ADD COLUMN IF NOT EXISTS action_history JSON COMMENT 'Lịch sử thao tác',
-- ADD COLUMN IF NOT EXISTS round_history JSON COMMENT 'Lịch sử từng hiệp',
-- ADD COLUMN IF NOT EXISTS finished_at DATETIME COMMENT 'Thời điểm kết thúc';

-- -- 2. Tạo bảng round_results để lưu chi tiết từng hiệp
-- CREATE TABLE IF NOT EXISTS round_results (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   match_id VARCHAR(50) NOT NULL COMMENT 'ID trận đấu',
--   round INT NOT NULL COMMENT 'Số hiệp',
--   red_score INT DEFAULT 0 COMMENT 'Điểm đỏ trong hiệp này',
--   blue_score INT DEFAULT 0 COMMENT 'Điểm xanh trong hiệp này',
--   red_remind INT DEFAULT 0 COMMENT 'Nhắc nhở đỏ',
--   blue_remind INT DEFAULT 0 COMMENT 'Nhắc nhở xanh',
--   red_warn INT DEFAULT 0 COMMENT 'Cảnh cáo đỏ',
--   blue_warn INT DEFAULT 0 COMMENT 'Cảnh cáo xanh',
--   red_mins INT DEFAULT 0 COMMENT 'Phút đỏ',
--   blue_mins INT DEFAULT 0 COMMENT 'Phút xanh',
--   red_incr INT DEFAULT 0 COMMENT 'Tăng điểm đỏ',
--   blue_incr INT DEFAULT 0 COMMENT 'Tăng điểm xanh',
--   round_type VARCHAR(10) DEFAULT 'MAIN' COMMENT 'MAIN, EXTRA',
--   confirm_attack INT DEFAULT 0 COMMENT 'Xác nhận tấn công',
--   status VARCHAR(10) DEFAULT 'COMPLETED' COMMENT 'COMPLETED, CANCELLED',
--   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--   updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   UNIQUE KEY unique_match_round (match_id, round),
--   FOREIGN KEY (match_id) REFERENCES matches(match_id) ON DELETE CASCADE,
--   INDEX idx_match_id (match_id),
--   INDEX idx_round (round),
--   INDEX idx_status (status)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Kết quả từng hiệp';

-- -- 3. Tạo index cho bảng matches
-- CREATE INDEX IF NOT EXISTS idx_match_status ON matches(status);
-- CREATE INDEX IF NOT EXISTS idx_match_winner ON matches(winner);
-- CREATE INDEX IF NOT EXISTS idx_match_finished_at ON matches(finished_at);

-- -- 4. Tạo view để xem kết quả trận đấu
-- CREATE OR REPLACE VIEW v_match_results AS
-- SELECT 
--   m.match_id,
--   m.match_no,
--   m.weight_class,
--   m.red_athlete_name,
--   m.blue_athlete_name,
--   m.status,
--   m.red_score,
--   m.blue_score,
--   m.winner,
--   m.total_rounds,
--   m.final_time,
--   m.finished_at,
--   CASE 
--     WHEN m.winner = 'red' THEN m.red_athlete_name
--     WHEN m.winner = 'blue' THEN m.blue_athlete_name
--     ELSE 'HÒA'
--   END AS winner_name,
--   m.red_remind,
--   m.blue_remind,
--   m.red_warn,
--   m.blue_warn,
--   m.red_kick,
--   m.blue_kick
-- FROM matches m
-- WHERE m.status = 'FIN'
-- ORDER BY m.finished_at DESC;

-- -- 5. Tạo stored procedure để lấy thống kê trận đấu
-- DELIMITER //

-- CREATE PROCEDURE IF NOT EXISTS sp_get_match_statistics(IN p_match_id VARCHAR(50))
-- BEGIN
--   -- Thông tin tổng quan
--   SELECT 
--     m.*,
--     COUNT(rr.id) as total_rounds_played,
--     SUM(rr.red_score) as total_red_score_by_rounds,
--     SUM(rr.blue_score) as total_blue_score_by_rounds
--   FROM matches m
--   LEFT JOIN round_results rr ON m.match_id = rr.match_id
--   WHERE m.match_id = p_match_id
--   GROUP BY m.match_id;
  
--   -- Chi tiết từng hiệp
--   SELECT * FROM round_results
--   WHERE match_id = p_match_id
--   ORDER BY round;
-- END //

-- DELIMITER ;

-- -- 6. Tạo trigger để tự động cập nhật updated_at
-- DELIMITER //

-- CREATE TRIGGER IF NOT EXISTS trg_matches_before_update
-- BEFORE UPDATE ON matches
-- FOR EACH ROW
-- BEGIN
--   SET NEW.updated_at = NOW();
-- END //

-- DELIMITER ;

-- -- 7. Insert sample data (optional - for testing)
-- -- INSERT INTO matches (match_id, match_no, weight_class, red_athlete_name, blue_athlete_name, status)
-- -- VALUES ('TEST001', 'M001', '60kg', 'Nguyễn Văn A', 'Trần Văn B', 'PENDING');

-- -- 8. Verify tables
-- SELECT 
--   TABLE_NAME, 
--   TABLE_ROWS, 
--   CREATE_TIME, 
--   UPDATE_TIME
-- FROM information_schema.TABLES
-- WHERE TABLE_SCHEMA = DATABASE()
--   AND TABLE_NAME IN ('matches', 'round_results');

-- -- 9. Verify columns
-- SELECT 
--   COLUMN_NAME, 
--   DATA_TYPE, 
--   IS_NULLABLE, 
--   COLUMN_DEFAULT,
--   COLUMN_COMMENT
-- FROM information_schema.COLUMNS
-- WHERE TABLE_SCHEMA = DATABASE()
--   AND TABLE_NAME = 'matches'
--   AND COLUMN_NAME IN ('status', 'red_score', 'blue_score', 'winner', 'action_history', 'round_history')
-- ORDER BY ORDINAL_POSITION;


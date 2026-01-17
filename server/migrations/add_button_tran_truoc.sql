-- -- Migration: Thêm cấu hình button "Trận trước"
-- -- Date: 2025-12-26
-- -- Description: Thêm trường cấu hình quyền hiển thị button "Trận trước" trên màn hình Vovinam

-- -- Thêm trường quyền hiển thị button Trận trước
-- ALTER TABLE config_system 
-- ADD COLUMN IF NOT EXISTS hien_thi_button_tran_truoc BOOLEAN DEFAULT TRUE COMMENT 'Hiển thị button Trận trước';

-- -- Cập nhật giá trị mặc định cho bản ghi hiện có (nếu có)
-- UPDATE config_system 
-- SET hien_thi_button_tran_truoc = COALESCE(hien_thi_button_tran_truoc, TRUE)
-- WHERE id IS NOT NULL;

-- -- Kiểm tra kết quả
-- SELECT 
--   'Button Trận trước' as category,
--   hien_thi_button_tran_truoc
-- FROM config_system
-- LIMIT 1;

